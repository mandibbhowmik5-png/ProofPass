import { IssuerOrganization, StudentCredential } from './types';
import { computeCredentialCommitment, computeIssuerSignature } from './crypto/zkEngine';

export const SAMPLE_UNIVERSITIES: IssuerOrganization[] = [
  {
    id: 'org-mit',
    name: 'Massachusetts Institute of Technology (MIT)',
    domain: 'mit.edu',
    publicKey: '0x04e82b79a1f24d9c87b9e0123456789abcdef0123456789abcdef0123456789a',
    accreditationTier: 1,
    country: 'United States',
    registeredAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    onChainTx: '0x3a7f9c2d1e8b4a05f6e7d8c9b0a1f2e3d4c5b6a7',
    status: 'ACTIVE'
  },
  {
    id: 'org-stanford',
    name: 'Stanford University',
    domain: 'stanford.edu',
    publicKey: '0x04b12c88f9e0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0',
    accreditationTier: 1,
    country: 'United States',
    registeredAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
    onChainTx: '0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90',
    status: 'ACTIVE'
  },
  {
    id: 'org-cambridge',
    name: 'University of Cambridge',
    domain: 'cam.ac.uk',
    publicKey: '0x04d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    accreditationTier: 1,
    country: 'United Kingdom',
    registeredAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    onChainTx: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
    status: 'ACTIVE'
  },
  {
    id: 'org-iitb',
    name: 'Indian Institute of Technology Bombay (IIT Bombay)',
    domain: 'iitb.ac.in',
    publicKey: '0x0499a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9',
    accreditationTier: 1,
    country: 'India',
    registeredAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    onChainTx: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    status: 'ACTIVE'
  }
];

// Generate sample student credentials
function createSampleStudentCredentials(): StudentCredential[] {
  const now = Date.now();
  const mit = SAMPLE_UNIVERSITIES[0];
  const stanford = SAMPLE_UNIVERSITIES[1];

  // 1. Active Student (MIT - Computer Science)
  const salt1 = 'a1f49e0c8b273d6e5a4f3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e';
  const expiresAt1 = now + 365 * 24 * 60 * 60 * 1000; // 1 year in future
  const commitment1 = computeCredentialCommitment('MIT-CS-2024-9982', salt1, mit.publicKey, expiresAt1, 'Computer Science & AI');
  const sig1 = computeIssuerSignature(commitment1, 'mit_issuer_key');

  // 2. Active Student (Stanford - Electrical Engineering)
  const salt2 = 'f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3';
  const expiresAt2 = now + 180 * 24 * 60 * 60 * 1000; // 6 months in future
  const commitment2 = computeCredentialCommitment('STAN-EE-2023-1402', salt2, stanford.publicKey, expiresAt2, 'Electrical Engineering');
  const sig2 = computeIssuerSignature(commitment2, 'stanford_issuer_key');

  // 3. Expired Student (Graduated last year)
  const salt3 = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const expiresAt3 = now - 60 * 24 * 60 * 60 * 1000; // 2 months ago
  const commitment3 = computeCredentialCommitment('MIT-CS-2020-0012', salt3, mit.publicKey, expiresAt3, 'Computer Science');
  const sig3 = computeIssuerSignature(commitment3, 'mit_issuer_key');

  return [
    {
      id: 'cred-sample-1',
      studentName: 'Alex Rivera',
      studentId: 'MIT-CS-2024-9982',
      studentEmail: 'arivera@mit.edu',
      dateOfBirth: '2003-05-14',
      department: 'Computer Science & AI',
      degree: 'Bachelor of Science (B.S.)',
      gpa: '3.92',
      secretSalt: salt1,
      issuerOrgId: mit.id,
      issuerName: mit.name,
      issuerPublicKey: mit.publicKey,
      accreditationTier: mit.accreditationTier,
      issuedAt: now - 90 * 24 * 60 * 60 * 1000,
      expiresAt: expiresAt1,
      commitmentHash: commitment1,
      issuerSignature: sig1,
      onChainTxId: '0x7b1c4e9f2a8d3e0b6c5a7f9e1d2c3b4a5f6e7d8c'
    },
    {
      id: 'cred-sample-2',
      studentName: 'Maya Patel',
      studentId: 'STAN-EE-2023-1402',
      studentEmail: 'mpatel@stanford.edu',
      dateOfBirth: '2002-11-28',
      department: 'Electrical Engineering',
      degree: 'Master of Science (M.S.)',
      gpa: '3.88',
      secretSalt: salt2,
      issuerOrgId: stanford.id,
      issuerName: stanford.name,
      issuerPublicKey: stanford.publicKey,
      accreditationTier: stanford.accreditationTier,
      issuedAt: now - 60 * 24 * 60 * 60 * 1000,
      expiresAt: expiresAt2,
      commitmentHash: commitment2,
      issuerSignature: sig2,
      onChainTxId: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
    },
    {
      id: 'cred-sample-3',
      studentName: 'Jordan Vance (Alumni - Expired)',
      studentId: 'MIT-CS-2020-0012',
      studentEmail: 'jvance@alum.mit.edu',
      dateOfBirth: '2000-03-09',
      department: 'Computer Science',
      degree: 'Bachelor of Science (B.S.)',
      gpa: '3.75',
      secretSalt: salt3,
      issuerOrgId: mit.id,
      issuerName: mit.name,
      issuerPublicKey: mit.publicKey,
      accreditationTier: mit.accreditationTier,
      issuedAt: now - 400 * 24 * 60 * 60 * 1000,
      expiresAt: expiresAt3,
      commitmentHash: commitment3,
      issuerSignature: sig3,
      onChainTxId: '0x123456789abcdef0123456789abcdef012345678'
    }
  ];
}

export const SAMPLE_CREDENTIALS = createSampleStudentCredentials();
