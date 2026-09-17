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
import { submitMidnightContractTx } from '../lib/midnight/midnightConnector';
import { useMidnightWallet } from './MidnightWalletContext';

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

  // Load state from localStorage or use initial presets
  const [myCredentials, setMyCredentials] = useState<StudentCredential[]>(() => {
    const saved = localStorage.getItem('proofpass_my_credentials');
    return saved ? JSON.parse(saved) : SAMPLE_CREDENTIALS;
  });

  const [issuedCredentials, setIssuedCredentials] = useState<StudentCredential[]>(() => {
    const saved = localStorage.getItem('proofpass_issued_credentials');
    return saved ? JSON.parse(saved) : SAMPLE_CREDENTIALS;
  });

  const [registeredIssuers, setRegisteredIssuers] = useState<Record<string, IssuerOrganization>>(() => {
    const saved = localStorage.getItem('proofpass_issuers');
    if (saved) return JSON.parse(saved);
    const map: Record<string, IssuerOrganization> = {};
    SAMPLE_UNIVERSITIES.forEach(u => {
      map[u.publicKey] = u;
    });
    return map;
  });

  const [onChainCommitments, setOnChainCommitments] = useState<Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }>>(() => {
    const saved = localStorage.getItem('proofpass_commitments');
    if (saved) return JSON.parse(saved);
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
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>(() => {
    const saved = localStorage.getItem('proofpass_verifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('proofpass_my_credentials', JSON.stringify(myCredentials));
  }, [myCredentials]);

  useEffect(() => {
    localStorage.setItem('proofpass_issued_credentials', JSON.stringify(issuedCredentials));
  }, [issuedCredentials]);

  useEffect(() => {
    localStorage.setItem('proofpass_issuers', JSON.stringify(registeredIssuers));
  }, [registeredIssuers]);

  useEffect(() => {
    localStorage.setItem('proofpass_commitments', JSON.stringify(onChainCommitments));
  }, [onChainCommitments]);

  useEffect(() => {
    localStorage.setItem('proofpass_verifications', JSON.stringify(verificationHistory));
  }, [verificationHistory]);

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
    const issuerSignature = computeIssuerSignature(commitmentHash, 'issuer_secret_key');

    // Submit transaction to Midnight Compact smart contract using connected wallet
    const tx = await submitMidnightContractTx('issue_credential', {
      commitmentHash,
      issuerPk: issuer.publicKey,
      issuedAt,
      expiresAt: params.expiresAt
    }, network, connectedApi);

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
    setMyCredentials(prev => [newCredential, ...prev]); // Also add to local vault for immediate testing
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
    await submitMidnightContractTx('revoke_credential', { commitmentHash }, network, connectedApi);
    
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
    const tx = await submitMidnightContractTx('register_issuer', { name, tier, pk }, network, connectedApi);
    
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
    localStorage.clear();
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
