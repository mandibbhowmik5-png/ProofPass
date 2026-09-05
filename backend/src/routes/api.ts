import { Router, Request, Response } from 'express';
import { credentialService } from '../services/credentialService.js';
import { AccreditationTier } from '../types.js';

export const apiRouter = Router();

// GET /api/health - Midnight Network & API Health
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    network: process.env.MIDNIGHT_NETWORK_ID || 'midnight-preprod',
    contractAddress: process.env.MIDNIGHT_CONTRACT_ADDRESS || '0x74a6bf193c9d72518e3c6902fa874c93f98f417e29a39d89c02b1f48039d91cb6',
    nodeUri: process.env.MIDNIGHT_NODE_URI || 'https://rpc.preprod.midnight.network',
    indexerUri: process.env.MIDNIGHT_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v1/graphql',
    circuit: 'proofpass.compact (v0.20)',
    timestamp: Date.now()
  });
});

// GET /api/issuers - Get all registered universities
apiRouter.get('/issuers', (req: Request, res: Response) => {
  const issuers = credentialService.getAllIssuers();
  res.json({ success: true, count: issuers.length, data: issuers });
});

// POST /api/issuers/register - Register a new university authority
apiRouter.post('/issuers/register', (req: Request, res: Response) => {
  try {
    const { name, domain, tier, country } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ success: false, error: 'Name and domain are required' });
    }
    const issuer = credentialService.registerIssuer(
      name, 
      domain, 
      (tier || 1) as AccreditationTier, 
      country || 'Global'
    );
    res.status(201).json({ success: true, data: issuer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/commitments - List registered credential commitments on Midnight
apiRouter.get('/commitments', (req: Request, res: Response) => {
  const commitments = credentialService.getAllCommitments();
  res.json({ success: true, count: commitments.length, data: commitments });
});

// POST /api/commitments/issue - Record a credential commitment on Midnight
apiRouter.post('/commitments/issue', (req: Request, res: Response) => {
  try {
    const { commitmentHash, issuerPk, expiresAt, department } = req.body;
    if (!commitmentHash || !issuerPk || !expiresAt) {
      return res.status(400).json({ success: false, error: 'commitmentHash, issuerPk, and expiresAt are required' });
    }
    const record = credentialService.issueCommitment(commitmentHash, issuerPk, expiresAt, department);
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/commitments/revoke - Revoke a credential commitment
apiRouter.post('/commitments/revoke', (req: Request, res: Response) => {
  try {
    const { commitmentHash } = req.body;
    if (!commitmentHash) {
      return res.status(400).json({ success: false, error: 'commitmentHash is required' });
    }
    const success = credentialService.revokeCommitment(commitmentHash);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Commitment not found' });
    }
    res.json({ success: true, message: 'Credential successfully revoked on Midnight' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/verify - Enterprise Zero-Knowledge Proof Verification Endpoint
apiRouter.post('/verify', (req: Request, res: Response) => {
  try {
    const proof = req.body;
    if (!proof || !proof.publicInputs || !proof.zkProofBlob) {
      return res.status(400).json({ success: false, error: 'Invalid ZK proof payload' });
    }
    const result = credentialService.verifyProof(proof);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/verifications - Get recent verification audit logs
apiRouter.get('/verifications', (req: Request, res: Response) => {
  const logs = credentialService.getVerificationLogs();
  res.json({ success: true, count: logs.length, data: logs });
});
