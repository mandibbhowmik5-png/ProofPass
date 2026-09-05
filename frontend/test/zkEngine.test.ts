import { 
  computeCredentialCommitment, 
  computeIssuerSignature, 
  deriveProofNullifier, 
  generateZKStudentProof, 
  verifyProof 
} from '../src/lib/crypto/zkEngine';
import { SAMPLE_UNIVERSITIES, SAMPLE_CREDENTIALS } from '../src/lib/sampleData';
import { IssuerOrganization, StudentCredential } from '../src/lib/types';

async function runTests() {
  console.log('🧪 Starting ProofPass Midnight ZK Cryptographic Engine Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const universityMap: Record<string, IssuerOrganization> = {};
  SAMPLE_UNIVERSITIES.forEach(u => { universityMap[u.publicKey] = u; });

  const onChainCommitments: Record<string, { issuerPk: string; issuedAt: number; expiresAt: number; isRevoked: boolean }> = {};
  SAMPLE_CREDENTIALS.forEach(c => {
    onChainCommitments[c.commitmentHash] = {
      issuerPk: c.issuerPublicKey,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
      isRevoked: Boolean(c.isRevoked)
    };
  });

  const spentNullifiers = new Set<string>();

  // TEST 1: Commitment Computation Consistency
  try {
    const cred = SAMPLE_CREDENTIALS[0];
    const commitment = computeCredentialCommitment(
      cred.studentId,
      cred.secretSalt,
      cred.issuerPublicKey,
      cred.expiresAt,
      cred.department
    );
    if (commitment === cred.commitmentHash) {
      console.log('✅ Test 1 Passed: Credential commitment computation is deterministic and correct');
      passed++;
    } else {
      throw new Error(`Commitment mismatch: expected ${cred.commitmentHash}, got ${commitment}`);
    }
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // TEST 2: Valid Active Student ZK Proof Verification
  try {
    const activeCred = SAMPLE_CREDENTIALS[0]; // MIT CS Student
    const proof = generateZKStudentProof(activeCred, 'Hackathon 2026 Test', undefined, { revealIssuerName: true });
    
    // Ensure raw PII is NOT in the proof payload
    const serialized = JSON.stringify(proof);
    if (serialized.includes(activeCred.studentName) || serialized.includes(activeCred.studentId) || serialized.includes(activeCred.secretSalt)) {
      throw new Error('Privacy Leak! Student Name, ID or Salt found in ZK proof payload!');
    }

    const result = await verifyProof(proof, universityMap, onChainCommitments, spentNullifiers, 'midnight-preprod');
    if (result.status === 'VERIFIED') {
      console.log('✅ Test 2 Passed: Valid student proof successfully verified with zero PII exposure');
      passed++;
    } else {
      throw new Error(`Expected VERIFIED status, got ${result.status}`);
    }
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // TEST 3: Expired Credential Verification Handling
  try {
    const expiredCred = SAMPLE_CREDENTIALS[2]; // Expired Student
    const proof = generateZKStudentProof(expiredCred, 'Hackathon Check');
    const result = await verifyProof(proof, universityMap, onChainCommitments, spentNullifiers, 'midnight-preprod');
    if (result.status === 'EXPIRED') {
      console.log('✅ Test 3 Passed: Expired student credential correctly rejected with EXPIRED status');
      passed++;
    } else {
      throw new Error(`Expected EXPIRED status, got ${result.status}`);
    }
  } catch (err: any) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // TEST 4: Tampered Commitment Hash Rejection
  try {
    const activeCred = SAMPLE_CREDENTIALS[0];
    const proof = generateZKStudentProof(activeCred, 'Hackathon Check');
    proof.publicInputs.commitmentHash = '0xbad0000000000000000000000000000000000000000000000000000000000000';
    const result = await verifyProof(proof, universityMap, onChainCommitments, spentNullifiers, 'midnight-preprod');
    if (result.status === 'INVALID') {
      console.log('✅ Test 4 Passed: Tampered/unregistered commitment correctly rejected with INVALID status');
      passed++;
    } else {
      throw new Error(`Expected INVALID status for tampered commitment, got ${result.status}`);
    }
  } catch (err: any) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // TEST 5: Nullifier Double-Spend / Replay Protection
  try {
    const activeCred = SAMPLE_CREDENTIALS[0];
    const proof = generateZKStudentProof(activeCred, 'Hackathon Check');
    spentNullifiers.add(proof.publicInputs.proofNullifier); // Mark nullifier as spent
    
    const result = await verifyProof(proof, universityMap, onChainCommitments, spentNullifiers, 'midnight-preprod');
    if (result.status === 'INVALID') {
      console.log('✅ Test 5 Passed: Replayed nullifier successfully detected and prevented');
      passed++;
    } else {
      throw new Error(`Expected INVALID status for spent nullifier, got ${result.status}`);
    }
  } catch (err: any) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }

  console.log(`\n🏁 Test Suite Complete: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
