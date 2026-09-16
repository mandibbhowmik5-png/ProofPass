# 🔐 ProofPass: Privacy-Preserving Digital Credential Verification on Midnight

[![Midnight Network](https://img.shields.io/badge/Midnight-Preprod%20%7C%20Preview-00f5ff?style=for-the-badge&logo=shield)](https://docs.midnight.network)
[![Smart Contract](https://img.shields.io/badge/Compact-zk--SNARK%20Circuit-indigo?style=for-the-badge)](contracts/proofpass.compact)
[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://proof-pass.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

---

## 🚀 Live Deployments

| Network | URL |
|---------|-----|
| **Production** | https://proof-pass.vercel.app |
| **Preview** | https://proof-pass-git-main-mandibbhowmik5-png.vercel.app |

---

## 📜 Midnight Smart Contract

| Field | Value |
|-------|-------|
| **Contract Name** | `ProofPass` |
| **Language** | Compact (Midnight ZK-SNARK DSL) |
| **Source** | [`contracts/proofpass.compact`](contracts/proofpass.compact) |
| **Deploy Script** | [`contracts/deploy/src/deploy.ts`](contracts/deploy/src/deploy.ts) |
| **Preprod Address** | *Deploy to get address — see [Deploy Guide](#deploying-the-smart-contract)* |
| **Preview Address** | *Deploy to get address — see [Deploy Guide](#deploying-the-smart-contract)* |
| **Preprod Explorer** | [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) |
| **Preview Explorer** | [preview.midnightexplorer.com](https://preview.midnightexplorer.com) |
| **Preprod Node RPC** | `https://rpc.preprod.midnight.network` |
| **Preview Node RPC** | `https://rpc.preview.midnight.network` |

> ProofPass uses Midnight's zero-knowledge Compact circuits. The `proofpass.compact` contract manages issuer registration, credential commitments, and ZK proof verification — **no student PII ever touches the public ledger**.
>
> **Note:** On Midnight, contract addresses are unique per deployment transaction. Run `npm run deploy:preprod` or `npm run deploy:preview` from `contracts/deploy/` to get your real address, then paste it above and into `frontend/.env`.

---

---

> **ProofPass** is a privacy-first digital credential platform built for the **Midnight blockchain ecosystem**. It allows accredited educational institutions (Universities) to issue tamper-proof digital credentials, students (Holders) to store them self-sovereignly and generate zero-knowledge proofs ("I am an active student at an accredited university"), and verifiers (hackathons, job fairs, student discounts) to verify status in real time **without accessing sensitive PII** (Full Legal Name, Student ID, Date of Birth, or GPA).

---

## 📁 Repository Structure

```
midnight/
├── frontend/                     # React + Vite + Tailwind CSS + TypeScript Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── issuer/           # University Credential Issuance & Revocation Portal
│   │   │   ├── holder/           # Student Vault & ZK Proof Studio (Hides PII)
│   │   │   ├── verifier/         # Live QR Camera Scanner & Midnight Verification Engine
│   │   │   ├── layout/           # Navbar, Footer, Network Switcher
│   │   │   └── common/           # ZK Explainer Modal, Demo Workflow Guide
│   │   ├── context/              # Midnight Lace Wallet Context & Credential Store Context
│   │   ├── lib/
│   │   │   ├── crypto/           # ZK Engine (Commitments, Predicates, Nullifiers)
│   │   │   ├── midnight/         # Midnight Network Connector & Wallet APIs
│   │   │   ├── sampleData.ts     # Pre-loaded MIT, Stanford, Cambridge credentials
│   │   │   └── types.ts          # Shared TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── test/                     # Frontend ZK Cryptographic Tests
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── backend/                      # Node.js + Express + TypeScript Midnight Service
│   ├── src/
│   │   ├── routes/
│   │   │   └── api.ts            # REST endpoints (/api/issuers, /api/commitments, /api/verify)
│   │   ├── services/
│   │   │   └── credentialService.ts # On-chain commitment ledger & ZK verifier
│   │   ├── types.ts
│   │   └── server.ts             # Express application server
│   ├── test/                     # Backend API integration tests
│   ├── contracts/                # Midnight Compact contracts
│   ├── package.json
│   └── tsconfig.json
│
├── contracts/                    # Core Midnight Compact Smart Contracts
│   ├── proofpass.compact         # Compact zero-knowledge circuits
│   └── proofpass-witnesses.ts    # Witness computation helpers & types
│
├── package.json                  # Monorepo workspace scripts
└── vercel.json                   # Root Vercel deployment configuration
```

---

## 🌟 Key Capabilities

### 1. 🏛️ Issuer Portal (`frontend/src/components/issuer`)
- University authorities issue verifiable credentials.
- Posts only the **32-byte commitment hash** to the Midnight blockchain via the `issue_credential` Compact circuit.
- **Zero student PII touches the blockchain**.

### 2. 🎒 Student Identity Vault (`frontend/src/components/holder`)
- Locally encrypted in-browser credential vault.
- **Zero-Knowledge Proof Studio**: Proves active enrollment status (`expiresAt > now`) and accredited institution membership while keeping Name, ID, DOB, and GPA 100% private.
- Generates dynamic **Verification QR Codes** and JSON proof packages.

### 3. 🔍 Verifier Hub (`frontend/src/components/verifier`)
- Live QR camera scanner (webcam / mobile camera) and JSON proof inspector.
- Real-time cryptographic & Midnight state verification against Compact circuit rules.
- Instant verdict: **VERIFIED (Active Student)**, **EXPIRED**, **REVOKED**, or **INVALID**.

### 4. 🌐 Backend Midnight API Service (`backend/`)
- Enterprise REST API endpoints for automated verifications, university registry querying, and ledger synchronization.

---

## 🚀 Quick Start Commands

### Install Dependencies
```bash
# In root: installs both frontend and backend
npm --prefix backend install
npm --prefix frontend install
```

### Run Automated Tests
```bash
# Runs test suites for both frontend (ZK engine) and backend (API service)
npm test
```

### Run Local Development
```bash
# Start frontend client
npm run dev:frontend

# Start backend server (optional)
npm run dev:backend
```

### Build for Production
```bash
npm run build
```

---

## ⛓️ Deploying the Smart Contract

ProofPass includes a full deployment script at [`contracts/deploy/src/deploy.ts`](contracts/deploy/src/deploy.ts).

### Step-by-step: Deploy to Preview or Preprod

**1. Install the Compact compiler**
```bash
# Follow official setup guide:
# https://docs.midnight.network/develop/tutorial/using/env-setup
compact --version   # verify it works
```

**2. Compile the contract**
```bash
# From project root:
compact compile contracts/proofpass.compact
# Generates: contracts/managed-api/  contracts/keys/  contracts/zkir/
```

**3. Start the Proof Server (separate terminal)**
```bash
docker run -p 6300:6300 midnightntwrk/proof-server:latest
```

**4. Get test tNIGHT tokens**
| Network | Faucet |
|---------|--------|
| Preview | https://faucet.midnight.network/preview |
| Preprod | https://faucet.midnight.network/preprod |

Install the **Midnight Lace wallet** extension → https://midnight.network/lace  
Switch the wallet to your target network (Preview or Preprod).

**5. Run the deploy script**
```bash
cd contracts/deploy
npm install
npm run deploy:preview   # → Preview testnet
npm run deploy:preprod   # → Preprod testnet
```

The script will print your **contract address** and the **Midnight Explorer link** on success:
```
Contract Address: <YOUR_UNIQUE_CONTRACT_ADDRESS>
Explorer Link   : https://preprod.midnightexplorer.com/contracts/<YOUR_UNIQUE_CONTRACT_ADDRESS>
```

**6. Record your contract address**
```bash
# Update frontend/.env:
echo "VITE_CONTRACT_ADDRESS_PREPROD=<YOUR_ADDRESS>" >> frontend/.env
echo "VITE_CONTRACT_ADDRESS_PREVIEW=<YOUR_ADDRESS>" >> frontend/.env
```

### Network Reference

| Network | Node RPC | Indexer | Explorer |
|---------|----------|---------|----------|
| **Preview** | `https://rpc.preview.midnight.network` | `https://indexer.preview.midnight.network/api/v4/graphql` | [preview.midnightexplorer.com](https://preview.midnightexplorer.com) |
| **Preprod** | `https://rpc.preprod.midnight.network` | `https://indexer.preprod.midnight.network/api/v4/graphql` | [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) |

Full tutorial: https://docs.midnight.network/develop/tutorial/building/deploy

---

## 🚢 Deployment to Vercel

ProofPass is configured for **Vercel Preview** and **Production** via root `vercel.json`:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Install Command** | `npm --prefix frontend install` |
| **Build Command** | `npm --prefix frontend run build` |
| **Output Directory** | `frontend/dist` |
| **SPA Rewrites** | `/* → /index.html` |

**To deploy:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `mandibbhowmik5-png/ProofPass` GitHub repository
3. Vercel auto-reads `vercel.json` — click **Deploy**

---

## 📄 License
MIT License. Built for the **Midnight Privacy Blockchain Ecosystem**.

