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
| **Preprod Address** | `mn1preprod1qr9x3ah7v2dmxq8fs4n2r8ld2qdegzq3v6v2xtka9rcsjgx7ew3mfq7l` |
| **Preview Address** | `mn1preview1qzk8v5fptmryw4n96jm0n8dxtqe4jwm3h2la7u8r5ecs2fkgx4j9cmsv` |
| **Preprod Explorer** | [explorer.midnight.network/preprod](https://explorer.midnight.network/preprod) |
| **Preview Explorer** | [explorer.midnight.network/preview](https://explorer.midnight.network/preview) |
| **Preprod Contract** | [View on Midnight Preprod Explorer](https://explorer.midnight.network/preprod/contracts/mn1preprod1qr9x3ah7v2dmxq8fs4n2r8ld2qdegzq3v6v2xtka9rcsjgx7ew3mfq7l) |
| **Preview Contract** | [View on Midnight Preview Explorer](https://explorer.midnight.network/preview/contracts/mn1preview1qzk8v5fptmryw4n96jm0n8dxtqe4jwm3h2la7u8r5ecs2fkgx4j9cmsv) |

> ProofPass uses Midnight's zero-knowledge Compact circuits. The `proofpass.compact` contract manages issuer registration, credential commitments, and ZK proof verification — **no student PII ever touches the public ledger**.

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

## 🚢 Deployment to Vercel

ProofPass is configured for direct **Vercel Preview** and **Production** deployment:
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `frontend/dist`
- **Root Directory**: `.` (or select `frontend/` as root directory)

---

## 📄 License
MIT License. Built for the **Midnight Privacy Blockchain Ecosystem**.
