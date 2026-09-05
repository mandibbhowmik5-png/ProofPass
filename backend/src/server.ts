import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Route mounting
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'ProofPass Midnight ZK Credential Verification API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      issuers: '/api/issuers',
      commitments: '/api/commitments',
      verify: 'POST /api/verify',
      verifications: '/api/verifications'
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌌 ProofPass Midnight Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Network: ${process.env.MIDNIGHT_NETWORK_ID || 'midnight-preprod'}`);
  });
}

export default app;
