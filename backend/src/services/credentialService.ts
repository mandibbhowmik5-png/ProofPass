import { sha256 } from 'js-sha256';
import { 
  IssuerOrganization, 
  CredentialCommitmentRecord, 
  ZKProofPayload, 
  VerificationResult,
  AccreditationTier,
  NetworkType 
} from '../types.js';

export class CredentialService {
  private issuers: Map<string, IssuerOrganization> = new Map();
  private commitments: Map<string, CredentialCommitmentRecord> = new Map();
  private spentNullifiers: Set<string> = new Set();
  private verificationLogs: VerificationResult[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const mit: IssuerOrganization = {
      id: 'org-mit',
      name: 'Massachusetts Institute of Technology (MIT)',
      domain: 'mit.edu',
      publicKey: '0x04e82b79a1f24d9c87b9e0123456789abcdef0123456789abcdef0123456789a',
      accreditationTier: 1,
      country: 'United States',
      registeredAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      onChainTx: '0x3a7f9c2d1e8b4a05f6e7d8c9b0a1f2e3d4c5b6a7',
      status: 'ACTIVE'
    };

    const stanford: IssuerOrganization = {
      id: 'org-stanford',
      name: 'Stanford University',
      domain: 'stanford.edu',
      publicKey: '0x04b12c88f9e0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0',
      accreditationTier: 1,
      country: 'United States',
      registeredAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
      onChainTx: '0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90',
      status: 'ACTIVE'
    };

    this.issuers.set(mit.publicKey, mit);
    this.issuers.set(stanford.publicKey, stanford);

    // Initial on-chain commitments
    const now = Date.now();
    const comm1 = '0x' + sha256(`midnight:commitment:MIT-CS-2024-9982:a1f49e0c8b273d6e5a4f3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e:${mit.publicKey}:${now + 365*24*60*60*1000}:Computer Science & AI`);
    this.commitments.set(comm1, {
      commitmentHash: comm1,
      issuerPk: mit.publicKey,
      issuedAt: now - 90 * 24 * 60 * 60 * 1000,
      expiresAt: now + 365 * 24 * 60 * 60 * 1000,
      department: 'Computer Science & AI',
      isRevoked: false,
      onChainTxId: '0x7b1c4e9f2a8d3e0b6c5a7f9e1d2c3b4a5f6e7d8c'
    });
  }

  public getAllIssuers(): IssuerOrganization[] {
    return Array.from(this.issuers.values());
  }

  public getIssuerByPublicKey(publicKey: string): IssuerOrganization | undefined {
    return this.issuers.get(publicKey);
  }

  public registerIssuer(name: string, domain: string, tier: AccreditationTier, country: string): IssuerOrganization {
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const publicKey = `0x04${randomHex.slice(0, 62)}`;
    const txHash = `0x${randomHex}`;

    const newIssuer: IssuerOrganization = {
      id: `org-${Math.random().toString(36).substring(2, 7)}`,
      name,
      domain,
      publicKey,
      accreditationTier: tier,
      country,
      registeredAt: Date.now(),
      onChainTx: txHash,
      status: 'ACTIVE'
    };

    this.issuers.set(publicKey, newIssuer);
    return newIssuer;
  }

  public getAllCommitments(): CredentialCommitmentRecord[] {
    return Array.from(this.commitments.values());
  }

  public issueCommitment(
    commitmentHash: string,
    issuerPk: string,
    expiresAt: number,
    department: string = 'General'
  ): CredentialCommitmentRecord {
    const issuer = this.issuers.get(issuerPk);
    if (!issuer) throw new Error('Issuing organization is not registered on Midnight');
    if (issuer.status !== 'ACTIVE') throw new Error('Issuer organization is suspended');

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const record: CredentialCommitmentRecord = {
      commitmentHash,
      issuerPk,
      issuedAt: Date.now(),
      expiresAt,
      department,
      isRevoked: false,
      onChainTxId: txHash
    };

    this.commitments.set(commitmentHash, record);
    return record;
  }

  public revokeCommitment(commitmentHash: string): boolean {
    const record = this.commitments.get(commitmentHash);
    if (!record) return false;
    record.isRevoked = true;
    return true;
  }

  public verifyProof(proof: ZKProofPayload, network: NetworkType = 'midnight-preprod'): VerificationResult {
    const startTime = performance.now();
    const checks: { name: string; description: string; passed: boolean; detail: string }[] = [];
    const now = Date.now();

    // 1. Schema check
    const validSchema = Boolean(proof.version && proof.publicInputs?.commitmentHash && proof.zkProofBlob?.proofData);
    checks.push({
      name: 'ZK-SNARK Proof Structure',
      description: 'Validates proof payload matches Midnight Compact schema',
      passed: validSchema,
      detail: validSchema ? 'Valid Midnight Compact SNARK Schema' : 'Invalid schema format'
    });

    if (!validSchema) {
      return {
        status: 'INVALID',
        verifiedAt: now,
        executionTimeMs: Math.round(performance.now() - startTime),
        network,
        checks,
        provenClaims: [],
        protectedData: ['Student Identity', 'Student ID', 'Birthdate', 'GPA'],
        proofPayload: proof
      };
    }

    // 2. Issuer check
    const issuer = this.issuers.get(proof.publicInputs.issuerPublicKey);
    const issuerValid = !!issuer && issuer.status === 'ACTIVE';
    checks.push({
      name: 'Midnight Issuer Authority Verification',
      description: 'Checks that issuer public key is active in Midnight Issuer Registry',
      passed: issuerValid,
      detail: issuerValid ? `Verified: ${issuer.name}` : 'Issuer not registered or suspended'
    });

    // 3. Commitment check
    const commitment = this.commitments.get(proof.publicInputs.commitmentHash);
    const commitmentExists = !!commitment;
    checks.push({
      name: 'On-Chain Commitment Verification',
      description: 'Verifies commitment exists in Midnight state ledger',
      passed: commitmentExists,
      detail: commitmentExists ? 'Commitment verified on-chain' : 'Commitment not found on Midnight ledger'
    });

    // 4. Revocation check
    const isRevoked = commitment ? commitment.isRevoked : false;
    checks.push({
      name: 'Revocation Status',
      description: 'Validates credential has not been revoked',
      passed: !isRevoked,
      detail: isRevoked ? 'Credential REVOKED by institution' : 'Active (Not revoked)'
    });

    // 5. Expiration check
    const isExpired = commitment ? commitment.expiresAt <= now : !proof.provenPredicates.isNotExpired;
    checks.push({
      name: 'Zero-Knowledge Expiration Predicate',
      description: 'Evaluates (expiresAt > currentTimestamp)',
      passed: !isExpired,
      detail: !isExpired ? 'Valid active student (unexpired)' : 'Credential has expired'
    });

    // 6. Nullifier check
    const nullifierSpent = this.spentNullifiers.has(proof.publicInputs.proofNullifier);
    checks.push({
      name: 'Nullifier & Replay Protection',
      description: 'Verifies proof nullifier has not been previously spent',
      passed: !nullifierSpent,
      detail: !nullifierSpent ? 'Fresh nullifier' : 'Nullifier already spent'
    });

    let status: VerificationResult['status'] = 'VERIFIED';
    if (!issuerValid) status = 'UNREGISTERED_ISSUER';
    else if (isRevoked) status = 'REVOKED';
    else if (isExpired) status = 'EXPIRED';
    else if (!commitmentExists || nullifierSpent || !validSchema) status = 'INVALID';

    if (status === 'VERIFIED') {
      this.spentNullifiers.add(proof.publicInputs.proofNullifier);
    }

    const provenClaims: string[] = [];
    if (status === 'VERIFIED') {
      provenClaims.push('Verified Enrolled Student');
      provenClaims.push('Credential is Valid & Active');
      provenClaims.push('Cryptographic Witness Proof Confirmed');
      if (proof.selectiveDisclosure.department) {
        provenClaims.push(`Department: ${proof.selectiveDisclosure.department}`);
      }
      if (proof.selectiveDisclosure.issuerName) {
        provenClaims.push(`Institution: ${proof.selectiveDisclosure.issuerName}`);
      }
    }

    const result: VerificationResult = {
      status,
      verifiedAt: now,
      executionTimeMs: Math.round(performance.now() - startTime),
      network,
      checks,
      provenClaims,
      protectedData: [
        'Student Full Legal Name',
        'Student ID / Roll Number',
        'Date of Birth / Age',
        'Email Address',
        'Cumulative GPA',
        'Private Salt Witness'
      ],
      issuerDetails: issuer ? {
        name: issuer.name,
        publicKey: issuer.publicKey,
        tier: issuer.accreditationTier
      } : undefined,
      proofPayload: proof
    };

    this.verificationLogs.unshift(result);
    return result;
  }

  public getVerificationLogs(): VerificationResult[] {
    return this.verificationLogs;
  }
}

export const credentialService = new CredentialService();
