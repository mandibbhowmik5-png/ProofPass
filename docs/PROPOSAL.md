# 📜 ProofPass Project Proposal (docs/PROPOSAL.md)

**Project Name**: ProofPass  
**Track**: Privacy-Preserving Applications on Midnight  
**Target Blockchain**: Midnight Network (Preprod Testnet)  
**Deployed Contract Address**: [`5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e`](https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e)  
**Preprod Explorer Link**: [https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e](https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e)  
**Live Production URL**: [https://proof-pass.vercel.app](https://proof-pass.vercel.app)  
**Product X (Twitter) Profile**: [https://x.com/MIDNIGHTya0ne](https://x.com/MIDNIGHTya0ne)  

---

## 1. Executive Summary

In today's digital landscape, educational credential verification is broken. Verifying student status for student discounts, hackathons, academic conferences, student housing, and recruitment requires exposing raw Personally Identifiable Information (PII) — including legal names, national student identification numbers, dates of birth, transcripts, and GPAs. This centralization exposes students to identity theft, tracking across disparate web services, and frequent database breaches.

**ProofPass** solves this systemic issue by leveraging the **Midnight blockchain**'s native zero-knowledge capabilities. Built using Midnight's domain-specific language **Compact**, ProofPass enables accredited academic institutions to issue tamper-proof digital credentials that students hold self-sovereignly in an encrypted device vault. Students can generate cryptographic zero-knowledge proofs (zk-SNARKs) to prove statements like *"I am an actively enrolled student at an accredited university"* or *"I meet the minimum graduation year requirement"*, without revealing any raw PII. Verifiers instantly validate the proof against the deployed Midnight smart contract in real time, settling one-time nullifiers on-chain to prevent double-spending or replay attacks.

---

## 2. Core Problem Statement

1. **Invasive PII Leakage**: Routine status checks require uploading government or student IDs to unvetted third-party platforms.
2. **Centralized Honeypots**: Centralized background check vendors hold massive databases of student credentials vulnerable to exfiltration.
3. **Forged Credentials**: Physical student IDs and forged PDF transcripts are trivial to counterfeit.
4. **Surveillance & Tracking**: Conventional identity solutions correlate student verification activity across multiple merchants and services.

---

## 3. The Midnight Solution Architecture

ProofPass is architected specifically around the strengths of Midnight:
- **Shielded State & Public Ledger State Partitioning**: The raw credential data and student witnesses are held entirely off-chain in the student's local client; only cryptographic commitments $H(\text{student\_id}, \text{salt})$ and consumed nullifiers are maintained on the public ledger.
- **Compact Smart Contract**: Written in Midnight's Compact language, enforcing circuit-level constraints rather than relying on client-side trust.
- **Official Midnight SDK**: Direct integration with `@midnight-ntwrk/midnight-js-contracts`, `@midnight-ntwrk/midnight-js-network-id`, and `@midnight-ntwrk/dapp-connector-api`.
- **Proving Provider**: Local and containerized Midnight Proof Server (`midnightntwrk/proof-server:latest`) generating authentic Groth16 zero-knowledge proofs.

```
┌────────────────────────────────────────────────────────┐
│                   EDUCATIONAL ISSUER                   │
│  Accredited University / Registrar                     │
│  - Holds private issuer secret key                     │
│  - Signs credential commitment                         │
│  - Calls callTx.issue_credential() on Midnight         │
└───────────────────────────┬────────────────────────────┘
                            │ Issues Cryptographic Credential
                            ▼
┌────────────────────────────────────────────────────────┐
│                     STUDENT HOLDER                     │
│  Local Secure Device Vault (Client-Side Storage)       │
│  - Holds private secret salt & student ID hash         │
│  - Generates zero-knowledge proof via Proof Server     │
│  - Discloses only authorized zero-knowledge predicates │
└───────────────────────────┬────────────────────────────┘
                            │ Transmits ZK Proof Payload
                            ▼
┌────────────────────────────────────────────────────────┐
│                   THIRD-PARTY VERIFIER                 │
│  Hackathons / Recruiters / Student Discounts           │
│  - Verifies proof against Midnight Preprod contract    │
│  - Invokes callTx.verify_student_proof()               │
│  - Consumes one-time nullifier on-chain                │
└───────────────────────────┬────────────────────────────┘
                            │ On-Chain Settlement
                            ▼
┌────────────────────────────────────────────────────────┐
│               MIDNIGHT PREPROD BLOCKCHAIN              │
│  Contract: 5a9cd8179b54c81863309dcfacd83f8207f0fc...   │
│  - commitments: Map<CommitmentHash, Metadata>          │
│  - issuers: Map<IssuerPK, IssuerInfo>                  │
│  - revoked_nullifiers: Set<NullifierHash>              │
│  - total_verified_count: Counter                       │
└────────────────────────────────────────────────────────┘
```

---

## 4. Technical Specifications & Circuits

### 1. `register_issuer`
- **Purpose**: Registers accredited university authorities on Midnight.
- **Authorization**: Contract Admin private witness (`admin_secret_key`).
- **Enforcement**: Circuit verifies derived key matches `admin` on the public ledger.

### 2. `issue_credential`
- **Purpose**: Records credential commitments on Midnight with zero student PII on-chain.
- **Authorization**: Issuer private witness (`issuer_secret_key`).
- **Parameters**: `commitment_hash`, `issuer_pk`, `issued_at`, `expires_at`.

### 3. `verify_student_proof`
- **Purpose**: Verifies student status in zero knowledge and consumes a unique proof nullifier.
- **Private Witnesses**: `student_secret_salt`, `student_id_hash`, `student_secret_key`.
- **Preimage Constraint**:
  $$\text{persistent\_hash}([\text{student\_id\_hash}, \text{student\_secret\_salt}]) == \text{commitment\_hash}$$
- **Nullifier Constraint**:
  $$\text{persistent\_hash}([\text{student\_secret\_salt}, \text{student\_secret\_key}]) == \text{proof\_nullifier}$$
- **Replay Protection**: Asserts `proof_nullifier` is not in `revoked_nullifiers`, then commits `revoked_nullifiers.insert(proof_nullifier)`.

### 4. `revoke_credential`
- **Purpose**: Revokes credentials or compromised nullifiers.
- **Authorization**: Originating Issuer or Governance Admin.

---

## 5. Security & Privacy Guarantees

1. **Zero Knowledge**: The verifier learns only the boolean truth value of predicates (e.g. *active enrollment*, *accreditation tier $\le 3$*, *expiration in future*). Student name, GPA, and student ID are never shared.
2. **Unlinkability**: Every verification derives a unique one-time nullifier using random salts, preventing cross-verifier user tracking.
3. **Cryptographic Tamper-Proofing**: Backed by ECDSA secp256k1 issuer signatures and Midnight Groth16 zk-SNARK verification.
4. **On-Chain Double-Spend Prevention**: Reused nullifiers are rejected by the Compact circuit.

---

## 6. Project Roadmap & Delivery Milestones

- **Level 1**: Compact Smart Contract Architecture & Architecture Design ✅
- **Level 2**: Cryptographic Engine & Local ZK Prover Pipeline ✅
- **Level 3**: Multi-Party Web Portal (Holder Vault, Issuer Portal, Verifier App) ✅
- **Level 4**: Preprod Contract Deployment & Explorer Integration ✅
- **Level 5**: 50+ Verified Preprod Community Testers & Feedback Iterations ✅
- **Level 6 (Supermoon)**: Official Midnight SDK Full Migration, DApp Connector API integration, visible error handling with zero synthetic fallbacks, 25+ Launch Testers, 30+ atomic commits, and E2E Preprod verification suite ✅
