/**
 * Witness computations and TypeScript interfaces for ProofPass Compact Contract on Midnight
 */

export interface WitnessContext {
  studentSecretSalt: string;
  studentIdHash: string;
  studentBirthYear: number;
  universityPublicKey: string;
}

export interface IssuerRegistrationWitness {
  issuerSecretKey: string;
  nameHash: string;
  accreditationTier: number;
}

export interface ProofGenerationWitness {
  credentialCommitment: string;
  studentSecretSalt: string;
  studentIdHash: string;
  universityPublicKey: string;
  currentTimestamp: number;
  verifierNonce: string;
}

export interface CompactContractState {
  issuers: Record<string, {
    nameHash: string;
    accreditationTier: number;
    status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
    registeredAt: number;
  }>;
  commitments: Record<string, {
    issuerPk: string;
    issuedAt: number;
    expiresAt: number;
    isRevoked: boolean;
  }>;
  revokedNullifiers: string[];
  totalVerifiedCount: number;
}
