export type NetworkType = 'midnight-preprod' | 'midnight-preview' | 'midnight-local';

export type AccreditationTier = 1 | 2 | 3;

export interface IssuerOrganization {
  id: string;
  name: string;
  domain: string;
  publicKey: string;
  accreditationTier: AccreditationTier;
  country: string;
  logoUrl?: string;
  registeredAt: number;
  onChainTx?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface StudentCredential {
  id: string; // UUID
  // Sensitive Off-chain PII (Stored strictly in student's device vault)
  studentName: string;
  studentId: string;
  studentEmail: string;
  dateOfBirth: string;
  department: string;
  degree: string;
  gpa?: string;
  secretSalt: string; // Secret used in cryptographic commitment

  // Public & Verification Metadata
  issuerOrgId: string;
  issuerName: string;
  issuerPublicKey: string;
  accreditationTier: AccreditationTier;
  issuedAt: number; // Unix timestamp ms
  expiresAt: number; // Unix timestamp ms
  commitmentHash: string; // On-chain registered commitment
  issuerSignature: string; // Cryptographic signature of issuer
  onChainTxId?: string;
  isRevoked?: boolean;
}

export interface ZKDisclosedFields {
  revealDepartment?: boolean;
  revealGraduationYear?: boolean;
  revealIssuerName?: boolean;
  revealAccreditationTier?: boolean;
}

export interface ZKProofPayload {
  version: string;
  proofId: string;
  createdAt: number;
  verifierPurpose: string;
  verifierNonce: string;
  
  // Public Inputs for verification
  publicInputs: {
    commitmentHash: string;
    issuerPublicKey: string;
    currentTimestamp: number;
    proofNullifier: string;
    minAccreditationTier: number;
  };

  // Zero-Knowledge Predicates proven by SNARK circuit
  provenPredicates: {
    isEnrolled: boolean;
    isNotExpired: boolean;
    isAccredited: boolean;
    isHolderOfSecret: boolean;
  };

  // Optional selective disclosures chosen by student
  selectiveDisclosure: {
    issuerName?: string;
    department?: string;
    accreditationTier?: number;
    expiryDateFormatted?: string;
  };

  // Cryptographic Proof (Simulated zk-SNARK proof or real Midnight compact proof payload)
  zkProofBlob: {
    protocol: 'Midnight-Compact-ZK-SNARK';
    circuitName: 'verify_student_proof';
    proofData: string;
    publicSignalsHash: string;
  };
}

export type VerificationStatus = 'VERIFIED' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'UNREGISTERED_ISSUER';

export interface VerificationCheckStep {
  name: string;
  description: string;
  passed: boolean;
  detail: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  verifiedAt: number;
  executionTimeMs: number;
  network: NetworkType;
  checks: VerificationCheckStep[];
  provenClaims: string[];
  protectedData: string[];
  issuerDetails?: {
    name: string;
    publicKey: string;
    tier: number;
  };
  proofPayload?: ZKProofPayload;
}

export type WalletErrorCode = 
  | 'WALLET_NOT_INSTALLED'
  | 'USER_REJECTED'
  | 'WRONG_NETWORK'
  | 'CONNECTION_FAILED'
  | 'TRANSACTION_ERROR'
  | 'UNAUTHORIZED';

export interface WalletError {
  code: WalletErrorCode;
  message: string;
  details?: string;
}

export interface MidnightShieldedAddresses {
  shieldedAddress: string;
  shieldedCoinPublicKey?: string;
  shieldedEncryptionPublicKey?: string;
}

export interface MidnightWalletInfo {
  name: string;
  icon?: string;
  rdns?: string;
  apiVersion?: string;
}

export interface MidnightConnectedAPI {
  getUnshieldedAddress: () => Promise<string | { unshieldedAddress: string }>;
  getShieldedAddresses?: () => Promise<MidnightShieldedAddresses>;
  getShieldedBalances?: () => Promise<Record<string, bigint | number>>;
  getUnshieldedBalances?: () => Promise<Record<string, bigint | number>>;
  getConnectionStatus?: () => Promise<boolean>;
  balanceUnsealedTransaction?: (tx: any) => Promise<any>;
  balanceSealedTransaction?: (tx: any) => Promise<any>;
  submitTransaction?: (tx: any) => Promise<string>;
  serviceUriConfig?: () => Promise<{ indexerUri?: string; proverServerUri?: string; nodeUri?: string }>;
  // Fallbacks for various SDK/extension versions
  state?: () => Promise<{ address: string; coinPublicKey?: string; encryptionPublicKey?: string }>;
  getPublicKey?: () => Promise<string>;
}

export interface MidnightInitialAPI {
  name?: string;
  icon?: string;
  rdns?: string;
  apiVersion?: string;
  connect: (networkId: string) => Promise<MidnightConnectedAPI>;
  getConnectionStatus?: () => Promise<boolean>;
  // Legacy fallback
  enable?: () => Promise<MidnightConnectedAPI>;
  isEnabled?: () => Promise<boolean>;
}
