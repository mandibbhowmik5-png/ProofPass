import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  StudentCredential, 
  IssuerOrganization, 
  VerificationResult, 
  AccreditationTier 
} from '../lib/types';
import { SAMPLE_UNIVERSITIES, SAMPLE_CREDENTIALS } from '../lib/sampleData';
import { 
  computeCredentialCommitment, 
  computeIssuerSignature, 
  generateRandomSecret 
} from '../lib/crypto/zkEngine';
import { 
  getDeployedProofPassContract, 
  MIDNIGHT_NETWORKS 
} from '../lib/midnight/midnightConnector';
import { indexerClient } from '../lib/midnight/indexerClient';
import { useMidnightWallet } from './MidnightWalletContext';
import { sha256 } from 'js-sha256';

interface IssueCredentialParams {
  studentName: string;
  studentId: string;
  studentEmail: string;
  dateOfBirth: string;
  department: string;
  degree: string;
  gpa?: string;
  expiresAt: number;
  issuerOrgId: string;
}

interface CredentialStoreContextType {
  // Holder's Vault
  myCredentials: StudentCredential[];
  importCredential: (credential: StudentCredential) => void;
  removeCredential: (id: string) => void;
  
  // Issuer State
  issuedCredentials: StudentCredential[];
  registeredIssuers: Record<string, IssuerOrganization>;
  onChainCommitments: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }>;
  spentNullifiers: Set<string>;
  
  // Actions
  issueNewCredential: (params: IssueCredentialParams) => Promise<StudentCredential>;
  revokeCredential: (commitmentHash: string) => Promise<void>;
  registerNewIssuer: (name: string, domain: string, tier: AccreditationTier, country: string) => Promise<IssuerOrganization>;
  
  // Verifier State
  verificationHistory: VerificationResult[];
  recordVerification: (result: VerificationResult) => void;
  clearVerificationHistory: () => void;
  
  // Reset
  resetToSampleData: () => void;
}

const CredentialStoreContext = createContext<CredentialStoreContextType | undefined>(undefined);

export const CredentialStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network, connectedApi, address: connectedAddress, publicKey: connectedPk } = useMidnightWallet();

  // Holder's private credentials
  const [myCredentials, setMyCredentials] = useState<StudentCredential[]>(() => {
    return SAMPLE_CREDENTIALS;
  });

  const [issuedCredentials, setIssuedCredentials] = useState<StudentCredential[]>(() => {
    return SAMPLE_CREDENTIALS;
  });

  // Public ledger state synchronized from Midnight Indexer
  const [registeredIssuers, setRegisteredIssuers] = useState<Record<string, IssuerOrganization>>(() => {
    const map: Record<string, IssuerOrganization> = {};
    SAMPLE_UNIVERSITIES.forEach(u => {
      map[u.publicKey] = u;
    });
    return map;
  });

  const [onChainCommitments, setOnChainCommitments] = useState<Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }>>(() => {
    const map: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }> = {};
    SAMPLE_CREDENTIALS.forEach(c => {
      map[c.commitmentHash] = {
        issuerPk: c.issuerPublicKey,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        isRevoked: Boolean(c.isRevoked)
      };
    });
    return map;
  });

  const [spentNullifiers, setSpentNullifiers] = useState<Set<string>>(new Set());
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);

  // Synchronize on-chain ledger state from Midnight Indexer (replaces LocalStorage as source of truth)
  useEffect(() => {
    let isMounted = true;

    async function syncFromMidnightIndexer() {
      try {
        const netConfig = MIDNIGHT_NETWORKS[network];
        const ledgerState = await indexerClient.fetchContractLedgerState(netConfig.contractAddress, network);
        if (!isMounted || !ledgerState) return;

        // Sync commitments
        const commMap: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }> = {};
        ledgerState.commitments.forEach((meta, hash) => {
          commMap[hash] = {
            issuerPk: meta.issuer_pk,
            issuedAt: Number(meta.issued_at),
            expiresAt: Number(meta.expires_at),
            isRevoked: meta.is_revoked
          };
        });
        setOnChainCommitments(prev => ({ ...commMap, ...prev }));

        // Sync nullifiers consumed on-chain
        setSpentNullifiers(prev => {
          const next = new Set(prev);
          ledgerState.revoked_nullifiers.forEach(n => next.add(n));
          return next;
        });
      } catch (err) {
        console.warn('Midnight Indexer synchronization notice:', err);
      }
    }

    syncFromMidnightIndexer();
    const interval = setInterval(syncFromMidnightIndexer, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [network]);

  const importCredential = (credential: StudentCredential) => {
    setMyCredentials(prev => {
      const exists = prev.some(c => c.id === credential.id || c.commitmentHash === credential.commitmentHash);
      if (exists) return prev;
      return [credential, ...prev];
    });
  };

  const removeCredential = (id: string) => {
    setMyCredentials(prev => prev.filter(c => c.id !== id));
  };

  const issueNewCredential = async (params: IssueCredentialParams): Promise<StudentCredential> => {
    const issuer = Object.values(registeredIssuers).find(i => i.id === params.issuerOrgId) || SAMPLE_UNIVERSITIES[0];
    const secretSalt = generateRandomSecret(32);
    const issuedAt = Date.now();
    const commitmentHash = computeCredentialCommitment(
      params.studentId,
      secretSalt,
      issuer.publicKey,
      params.expiresAt,
      params.department
    );

    // Cryptographic ECDSA signature from the authorized issuer
    const issuerPrivateKey = '0x' + sha256(`midnight:issuer:privatekey:${issuer.domain || issuer.name}`);
    const issuerSignature = computeIssuerSignature(commitmentHash, issuerPrivateKey);

    // Invoke actual generated Compact bindings: callTx.issue_credential
    const contract = await getDeployedProofPassContract(network, connectedApi, {
      issuer_secret_key: () => issuerPrivateKey
    });

    const tx = await contract.callTx.issue_credential(
      commitmentHash,
      issuer.publicKey,
      BigInt(issuedAt),
      BigInt(params.expiresAt)
    );

    const newCredential: StudentCredential = {
      id: 'cred-' + generateRandomSecret(6),
      studentName: params.studentName,
      studentId: params.studentId,
      studentEmail: params.studentEmail,
      dateOfBirth: params.dateOfBirth,
      department: params.department,
      degree: params.degree,
      gpa: params.gpa,
      secretSalt,
      issuerOrgId: issuer.id,
      issuerName: issuer.name,
      issuerPublicKey: issuer.publicKey,
      accreditationTier: issuer.accreditationTier,
      issuedAt,
      expiresAt: params.expiresAt,
      commitmentHash,
      issuerSignature,
      onChainTxId: tx.txHash
    };

    // Update state
    setIssuedCredentials(prev => [newCredential, ...prev]);
    setMyCredentials(prev => [newCredential, ...prev]);
    setOnChainCommitments(prev => ({
      ...prev,
      [commitmentHash]: {
        issuerPk: issuer.publicKey,
        issuedAt,
        expiresAt: params.expiresAt,
        isRevoked: false
      }
    }));

    return newCredential;
  };

  const revokeCredential = async (commitmentHash: string) => {
    // Invoke actual generated Compact bindings: callTx.revoke_credential
    const contract = await getDeployedProofPassContract(network, connectedApi, {
      issuer_secret_key: () => '0x' + sha256('midnight:issuer:privatekey:mit.edu')
    });

    await contract.callTx.revoke_credential(commitmentHash, '0x' + '0'.repeat(64));
    
    setOnChainCommitments(prev => {
      if (!prev[commitmentHash]) return prev;
      return {
        ...prev,
        [commitmentHash]: {
          ...prev[commitmentHash],
          isRevoked: true
        }
      };
    });

    setIssuedCredentials(prev => prev.map(c => c.commitmentHash === commitmentHash ? { ...c, isRevoked: true } : c));
    setMyCredentials(prev => prev.map(c => c.commitmentHash === commitmentHash ? { ...c, isRevoked: true } : c));
  };

  const registerNewIssuer = async (name: string, domain: string, tier: AccreditationTier, country: string): Promise<IssuerOrganization> => {
    const pk = connectedPk || connectedAddress || `0x04${generateRandomSecret(32)}`;
    
    // Invoke actual generated Compact bindings: callTx.register_issuer with admin authorization
    const contract = await getDeployedProofPassContract(network, connectedApi, {
      admin_secret_key: () => '0x' + sha256('midnight:admin:governance_secret')
    });

    const tx = await contract.callTx.register_issuer(
      pk,
      name,
      tier,
      BigInt(Date.now())
    );
    
    const newIssuer: IssuerOrganization = {
      id: 'org-' + generateRandomSecret(4),
      name,
      domain,
      publicKey: pk,
      accreditationTier: tier,
      country,
      registeredAt: Date.now(),
      onChainTx: tx.txHash,
      status: 'ACTIVE'
    };

    setRegisteredIssuers(prev => ({
      ...prev,
      [pk]: newIssuer
    }));

    return newIssuer;
  };

  const recordVerification = (result: VerificationResult) => {
    if (result.proofPayload?.publicInputs?.proofNullifier) {
      setSpentNullifiers(prev => new Set(prev).add(result.proofPayload!.publicInputs.proofNullifier));
    }
    setVerificationHistory(prev => [result, ...prev.slice(0, 19)]);
  };

  const clearVerificationHistory = () => {
    setVerificationHistory([]);
  };

  const resetToSampleData = () => {
    const map: Record<string, IssuerOrganization> = {};
    SAMPLE_UNIVERSITIES.forEach(u => {
      map[u.publicKey] = u;
    });
    setRegisteredIssuers(map);
    setMyCredentials(SAMPLE_CREDENTIALS);
    setIssuedCredentials(SAMPLE_CREDENTIALS);
    const commMap: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }> = {};
    SAMPLE_CREDENTIALS.forEach(c => {
      commMap[c.commitmentHash] = {
        issuerPk: c.issuerPublicKey,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        isRevoked: Boolean(c.isRevoked)
      };
    });
    setOnChainCommitments(commMap);
    setVerificationHistory([]);
  };

  return (
    <CredentialStoreContext.Provider
      value={{
        myCredentials,
        importCredential,
        removeCredential,
        issuedCredentials,
        registeredIssuers,
        onChainCommitments,
        spentNullifiers,
        issueNewCredential,
        revokeCredential,
        registerNewIssuer,
        verificationHistory,
        recordVerification,
        clearVerificationHistory,
        resetToSampleData
      }}
    >
      {children}
    </CredentialStoreContext.Provider>
  );
};

export const useCredentialStore = () => {
  const context = useContext(CredentialStoreContext);
  if (!context) {
    throw new Error('useCredentialStore must be used within a CredentialStoreProvider');
  }
  return context;
};
