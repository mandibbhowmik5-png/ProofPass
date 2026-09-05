import { credentialService } from '../src/services/credentialService.js';
import { sha256 } from 'js-sha256';

async function testBackend() {
  console.log('🧪 Starting ProofPass Backend Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Issuers list
    const issuers = credentialService.getAllIssuers();
    if (issuers.length >= 2) {
      console.log(`✅ Test 1 Passed: Loaded ${issuers.length} registered Midnight institutions`);
      passed++;
    } else {
      throw new Error('Failed to retrieve seeded issuers');
    }

    // 2. Register new institution
    const newOrg = credentialService.registerIssuer('Oxford University', 'ox.ac.uk', 1, 'United Kingdom');
    if (newOrg.publicKey && newOrg.name === 'Oxford University') {
      console.log(`✅ Test 2 Passed: Registered new institution authority (${newOrg.name})`);
      passed++;
    } else {
      throw new Error('Failed to register institution');
    }

    // 3. Issue commitment
    const mit = issuers[0];
    const commHash = '0x' + sha256('test:commitment:' + Date.now());
    const expiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const record = credentialService.issueCommitment(commHash, mit.publicKey, expiry, 'Computer Science');
    if (record.commitmentHash === commHash) {
      console.log('✅ Test 3 Passed: Successfully posted credential commitment record');
      passed++;
    } else {
      throw new Error('Failed to record commitment');
    }

    // 4. Server-side proof verification
    const nullifier = '0x' + sha256('nullifier:' + Date.now());
    const proofPayload: any = {
      version: '1.0.0-midnight',
      proofId: 'test-proof-1',
      createdAt: Date.now(),
      verifierPurpose: 'Backend API Test',
      verifierNonce: 'nonce-123',
      publicInputs: {
        commitmentHash: commHash,
        issuerPublicKey: mit.publicKey,
        currentTimestamp: Date.now(),
        proofNullifier: nullifier,
        minAccreditationTier: 3
      },
      provenPredicates: {
        isEnrolled: true,
        isNotExpired: true,
        isAccredited: true,
        isHolderOfSecret: true
      },
      selectiveDisclosure: {
        issuerName: mit.name,
        department: 'Computer Science'
      },
      zkProofBlob: {
        protocol: 'Midnight-Compact-ZK-SNARK',
        circuitName: 'verify_student_proof',
        proofData: '0x1234567890abcdef',
        publicSignalsHash: '0xabcdef123456'
      }
    };

    const verifyResult = credentialService.verifyProof(proofPayload);
    if (verifyResult.status === 'VERIFIED') {
      console.log('✅ Test 4 Passed: Server-side ZK verification returned VERIFIED status');
      passed++;
    } else {
      throw new Error(`Verification returned status: ${verifyResult.status}`);
    }

  } catch (err: any) {
    console.error('❌ Test Failed:', err.message);
    failed++;
  }

  console.log(`\n🏁 Backend Test Suite Complete: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

testBackend();
