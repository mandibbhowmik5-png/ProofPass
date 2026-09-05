export type NetworkType = 'midnight-preprod' | 'midnight-preview' | 'midnight-local';

export type AccreditationTier = 1 | 2 | 3;

export interface IssuerOrganization {
  id: string;
  name: string;
  domain: string;
  publicKey: string;
  accreditationTier: AccreditationTier;
  country: string;
  registeredAt: number;
  onChainTx?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface CredentialCommitmentRecord {
  commitmentHash: string;
  issuerPk: string;
  issuedAt: number;
  expiresAt: number;
  department: string;
  isRevoked: boolean;
  onChainTxId: string;
}

export interface ZKProofPayload {
  version: string;
  proofId: string;
  createdAt: number;
  verifierPurpose: string;
  verifierNonce: string;
  
  publicInputs: {
    commitmentHash: string;
    issuerPublicKey: string;
    currentTimestamp: number;
    proofNullifier: string;
    minAccreditationTier: number;
  };

  provenPredicates: {
    isEnrolled: boolean;
    isNotExpired: boolean;
    isAccredited: boolean;
    isHolderOfSecret: boolean;
  };

  selectiveDisclosure: {
    issuerName?: string;
    department?: string;
    accreditationTier?: number;
    expiryDateFormatted?: string;
  };

  zkProofBlob: {
    protocol: 'Midnight-Compact-ZK-SNARK';
    circuitName: 'verify_student_proof';
    proofData: string;
    publicSignalsHash: string;
  };
}

export type VerificationStatus = 'VERIFIED' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'UNREGISTERED_ISSUER';

export interface VerificationResult {
  status: VerificationStatus;
  verifiedAt: number;
  executionTimeMs: number;
  network: NetworkType;
  checks: { name: string; description: string; passed: boolean; detail: string }[];
  provenClaims: string[];
  protectedData: string[];
  issuerDetails?: {
    name: string;
    publicKey: string;
    tier: number;
  };
  proofPayload?: ZKProofPayload;
}
