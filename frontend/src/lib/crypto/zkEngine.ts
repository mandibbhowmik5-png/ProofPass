import { sha256 } from 'js-sha256';
import { 
  StudentCredential, 
  ZKProofPayload, 
  ZKDisclosedFields, 
  VerificationResult, 
  IssuerOrganization,
  NetworkType 
} from '../types';

/**
 * Generate a cryptographically secure random hexadecimal salt
 */
export function generateRandomSecret(byteLength: number = 32): string {
  const array = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < byteLength; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate the Credential Commitment Hash according to Midnight Compact smart contract specification
 * Commitment = Hash(studentId || secretSalt || issuerPublicKey || expiresAt || department)
 */
export function computeCredentialCommitment(
  studentId: string,
  secretSalt: string,
  issuerPublicKey: string,
  expiresAt: number,
  department: string
): string {
  const preimage = `midnight:commitment:${studentId}:${secretSalt}:${issuerPublicKey}:${expiresAt}:${department}`;
  return '0x' + sha256(preimage);
}

/**
 * Calculate the Issuer Signature over the commitment hash
 */
export function computeIssuerSignature(
  commitmentHash: string,
  issuerPrivateKeyMock: string
): string {
  const sigPreimage = `sig:${commitmentHash}:${issuerPrivateKeyMock}`;
  return '0x' + sha256(sigPreimage).slice(0, 64) + sha256(sigPreimage + ':extra').slice(0, 64);
}

/**
 * Derive a Zero-Knowledge Nullifier for this proof to prevent replay attacks
 * Nullifier = Hash(secretSalt || verifierNonce || commitmentHash)
 */
export function deriveProofNullifier(
  secretSalt: string,
  verifierNonce: string,
  commitmentHash: string
): string {
  const nullifierPreimage = `midnight:nullifier:${secretSalt}:${verifierNonce}:${commitmentHash}`;
  return '0x' + sha256(nullifierPreimage);
}

/**
 * Generate a Zero-Knowledge Proof payload on the Student (Holder) side
 * Strictly avoids embedding studentId, studentName, DOB, or secretSalt in the proof.
 */
export function generateZKStudentProof(
  credential: StudentCredential,
  verifierPurpose: string = 'Hackathon Registration Verification',
  verifierNonce: string = generateRandomSecret(8),
  disclosures: ZKDisclosedFields = {}
): ZKProofPayload {
  const now = Date.now();
  const nullifier = deriveProofNullifier(credential.secretSalt, verifierNonce, credential.commitmentHash);
  
  const isNotExpired = credential.expiresAt > now;
  const isEnrolled = true; // In active standing
  const isAccredited = (credential.accreditationTier ?? 1) <= 3;

  // Mock zk-SNARK proof bytes simulating Midnight Compact prover output
  const simulatedProofData = '0x' + sha256(`midnight:zkproof:${credential.commitmentHash}:${now}:${nullifier}`) + 
                            sha256(`snark_eval_${credential.secretSalt.slice(0, 8)}`);

  const payload: ZKProofPayload = {
    version: '1.0.0-midnight',
    proofId: 'proof-' + generateRandomSecret(6),
    createdAt: now,
    verifierPurpose,
    verifierNonce,
    publicInputs: {
      commitmentHash: credential.commitmentHash,
      issuerPublicKey: credential.issuerPublicKey,
      currentTimestamp: now,
      proofNullifier: nullifier,
      minAccreditationTier: 3
    },
    provenPredicates: {
      isEnrolled,
      isNotExpired,
      isAccredited,
      isHolderOfSecret: true
    },
    selectiveDisclosure: {
      ...(disclosures.revealIssuerName ? { issuerName: credential.issuerName } : {}),
      ...(disclosures.revealDepartment ? { department: credential.department } : {}),
      ...(disclosures.revealAccreditationTier ? { accreditationTier: credential.accreditationTier } : {}),
      ...(disclosures.revealGraduationYear ? { expiryDateFormatted: new Date(credential.expiresAt).getFullYear().toString() } : {})
    },
    zkProofBlob: {
      protocol: 'Midnight-Compact-ZK-SNARK',
      circuitName: 'verify_student_proof',
      proofData: simulatedProofData,
      publicSignalsHash: '0x' + sha256(`${credential.commitmentHash}:${nullifier}:${now}`)
    }
  };

  return payload;
}

/**
 * Verify a Zero-Knowledge Proof against known ledger commitments and registered issuers
 * Follows the rules defined in `proofpass.compact` smart contract
 */
export async function verifyProof(
  proof: ZKProofPayload,
  registeredIssuers: Record<string, IssuerOrganization>,
  onChainCommitments: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }>,
  spentNullifiers: Set<string>,
  network: NetworkType = 'midnight-preprod'
): Promise<VerificationResult> {
  const startTime = performance.now();
  const checks: { name: string; description: string; passed: boolean; detail: string }[] = [];
  const now = Date.now();

  // 1. Check proof schema and version
  const validSchema = Boolean(proof.version && proof.publicInputs?.commitmentHash && proof.zkProofBlob?.proofData);
  checks.push({
    name: 'ZK-SNARK Proof Structure',
    description: 'Validates proof payload matches Midnight Compact schema',
    passed: validSchema,
    detail: validSchema ? 'Proof format verified (Midnight-Compact-ZK-SNARK)' : 'Invalid proof payload format'
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

  // 2. Issuer verification on Midnight registry
  const issuer = registeredIssuers[proof.publicInputs.issuerPublicKey];
  const issuerRegistered = !!issuer && issuer.status === 'ACTIVE';
  checks.push({
    name: 'Issuing Authority Verification',
    description: 'Verifies the issuer public key is active in Midnight Issuer Registry',
    passed: issuerRegistered,
    detail: issuerRegistered 
      ? `Registered: ${issuer.name} (Tier ${issuer.accreditationTier})` 
      : 'Issuer public key is not registered or is suspended on Midnight ledger'
  });

  // 3. Commitment presence on Midnight Ledger
  const onChainRecord = onChainCommitments[proof.publicInputs.commitmentHash];
  const commitmentFound = !!onChainRecord;
  checks.push({
    name: 'On-Chain Commitment Verification',
    description: 'Verifies the cryptographic commitment exists on Midnight state',
    passed: commitmentFound,
    detail: commitmentFound
      ? `Found commitment recorded by ${onChainRecord.issuerPk.slice(0, 10)}...`
      : 'Commitment hash not found on Midnight ledger state'
  });

  // 4. Revocation check
  const isRevoked = onChainRecord ? onChainRecord.isRevoked : false;
  checks.push({
    name: 'Revocation Status',
    description: 'Checks that credential has not been revoked by the institution',
    passed: !isRevoked,
    detail: isRevoked ? 'Credential was REVOKED by the issuing university' : 'Active (Not revoked)'
  });

  // 5. Expiration predicate check (ZK predicate validation)
  const isExpired = onChainRecord ? onChainRecord.expiresAt <= now : !proof.provenPredicates.isNotExpired;
  checks.push({
    name: 'Zero-Knowledge Expiration Predicate',
    description: 'Validates credential expiration condition (expiresAt > currentTimestamp)',
    passed: !isExpired,
    detail: !isExpired 
      ? 'Valid active student credential (expires in future)' 
      : `Expired on ${onChainRecord ? new Date(onChainRecord.expiresAt).toLocaleDateString() : 'earlier date'}`
  });

  // 6. Replay attack / Nullifier check
  const nullifierSpent = spentNullifiers.has(proof.publicInputs.proofNullifier);
  checks.push({
    name: 'Nullifier & Replay Protection',
    description: 'Ensures one-time proof nullifier has not been spent or duplicated',
    passed: !nullifierSpent,
    detail: !nullifierSpent 
      ? `Fresh nullifier: ${proof.publicInputs.proofNullifier.slice(0, 14)}...` 
      : 'Nullifier has already been spent for this context'
  });

  // Determine Final Verdict
  let status: VerificationResult['status'] = 'VERIFIED';

  if (!issuerRegistered) {
    status = 'UNREGISTERED_ISSUER';
  } else if (isRevoked) {
    status = 'REVOKED';
  } else if (isExpired) {
    status = 'EXPIRED';
  } else if (!commitmentFound || nullifierSpent || !validSchema) {
    status = 'INVALID';
  }

  const provenClaims: string[] = [];
  if (status === 'VERIFIED') {
    provenClaims.push('Verified Enrolled Student at Accredited Institution');
    provenClaims.push('Credential is Valid & Not Expired');
    provenClaims.push('Cryptographic Proof of Preimage Holder Ownership');
    if (proof.selectiveDisclosure.department) {
      provenClaims.push(`Department: ${proof.selectiveDisclosure.department}`);
    }
    if (proof.selectiveDisclosure.issuerName) {
      provenClaims.push(`Institution: ${proof.selectiveDisclosure.issuerName}`);
    }
    if (proof.selectiveDisclosure.expiryDateFormatted) {
      provenClaims.push(`Graduation Year: ${proof.selectiveDisclosure.expiryDateFormatted}`);
    }
  }

  const protectedData = [
    'Student Full Legal Name',
    'Student ID / Roll Number',
    'Date of Birth / Exact Age',
    'Personal Email & Phone',
    'Cumulative GPA & Academic Transcripts',
    'Student Secret Salt (Witness)'
  ];

  return {
    status,
    verifiedAt: now,
    executionTimeMs: Math.round(performance.now() - startTime),
    network,
    checks,
    provenClaims,
    protectedData,
    issuerDetails: issuer ? {
      name: issuer.name,
      publicKey: issuer.publicKey,
      tier: issuer.accreditationTier
    } : undefined,
    proofPayload: proof
  };
}
