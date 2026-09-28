# 🗣️ ProofPass User Feedback & Community Review (FEEDBACK.md)

This document aggregates community feedback gathered from testing on **Midnight Preprod** via the official Google Form, Discord, and Telegram community groups, and details the engineering fixes and feature enhancements implemented in response.

- **Google Feedback Form**: [https://docs.google.com/forms/d/e/1FAIpQLSfopJCS93t4V1oaVgmjxYS8Eu6RgpZjl5ZmedVqVSBbTxoYNg/viewform](https://docs.google.com/forms/d/e/1FAIpQLSfopJCS93t4V1oaVgmjxYS8Eu6RgpZjl5ZmedVqVSBbTxoYNg/viewform)
- **Live Response Sheet**: [https://docs.google.com/spreadsheets/d/1NEdLIUNZQGZuFLsjIagCGxtM_ilzwQT_8lP0LXV6Z_c/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1NEdLIUNZQGZuFLsjIagCGxtM_ilzwQT_8lP0LXV6Z_c/edit?usp=sharing)
- **Total Responses Logged**: 72 Submissions in `USERS.md` + 25 Launch Submissions in `LAUNCH_USERS.md`
- **Average Satisfaction Score**: 4.76 / 5.0 ⭐

---

## 📊 Feedback Categorization & Codebase Cross-Reference Matrix

Every feedback item below was converted into verified, test-covered code changes in the repository.

| # | Feedback Category & User Quote | Reported By | Codebase Location & File Diff | Commit Message & Evidence |
|---|---|---|---|---|
| **1** | **Verification & Settlement Flow**<br>*"I found some issue in settlements, maybe it is still in development... settlements are not working"* | Maitri Golder, Amitava Pal | [`frontend/src/lib/crypto/zkEngine.ts`](frontend/src/lib/crypto/zkEngine.ts#L185-L290), [`backend/src/services/credentialService.ts`](backend/src/services/credentialService.ts#L70-L120) | `feat(crypto): implement real ECDSA secp256k1 issuer authorization and deterministic preimage binding`<br>• Enforced real cryptographic ECDSA secp256k1 authorization and 5-step on-chain settlement validation.<br>• Added explicit status verdicts: `VERIFIED`, `EXPIRED`, `REVOKED`, `INVALID`. |
| **2** | **Notification Preferences**<br>*"Custom alerts, notification preferences"* | Sampad De, Debasmit Bose | [`frontend/src/components/layout/TopHeader.tsx`](frontend/src/components/layout/TopHeader.tsx#L40-L48) | `feat(ui): update CredentialStoreContext, VerifierView, and TopHeader with indexer queries and real block heights`<br>• Built interactive Notification Center popover.<br>• Added customizable toggles for On-Chain Settlements, Verification Verdicts, and Block Confirmations. |
| **3** | **Circuit Execution & Wallet Triggers**<br>*"i have connected wallet, but couldn't open the circles, please fix this issue"* | Rooplekha Banik | [`frontend/src/components/verifier/VerifierView.tsx`](frontend/src/components/verifier/VerifierView.tsx#L80-L96), [`frontend/src/lib/midnight/midnightConnector.ts`](frontend/src/lib/midnight/midnightConnector.ts#L220-L310) | `feat(sdk): migrate to official Midnight SDK, setNetworkId, DApp Connector API & remove synthetic fallbacks`<br>• Integrated `@midnight-ntwrk/dapp-connector-api` so connected wallet state automatically triggers `callTx.verify_student_proof`.<br>• Added visual on-chain confirmation badge displaying Midnight Preprod block height. |
| **4** | **Mobile UX & Responsive Navigation**<br>*"some navigation issues in mobile, animations lagging should be fixed"* | Snigdhanil Basu, Prajit Bakshi | [`frontend/src/components/layout/TopHeader.tsx`](frontend/src/components/layout/TopHeader.tsx#L64-L100), [`frontend/src/index.css`](frontend/src/index.css) | `feat(ui): optimize responsive mobile layout and GPU-accelerated CSS transitions`<br>• Replaced JS animation loops with GPU-accelerated CSS transforms.<br>• Enhanced mobile responsive header and bottom touch navigation. |
| **5** | **Ledger State & Data Synchronization**<br>*"Detailed activity logs and data synchronization"* | Tathagata Ghosh | [`frontend/src/context/CredentialStoreContext.tsx`](frontend/src/context/CredentialStoreContext.tsx#L100-L138), [`frontend/src/lib/midnight/indexerClient.ts`](frontend/src/lib/midnight/indexerClient.ts#L60-L160) | `feat(sdk): replace LocalStorage ledger state with Midnight GraphQL indexer queries`<br>• Replaced LocalStorage with live GraphQL indexer polling (`fetchContractLedgerState`).<br>• Real-time synchronization of commitments, issuers, and nullifiers. |

---

## 🔍 Detailed Code-Level Evidence

### 1. `frontend/src/lib/crypto/zkEngine.ts` (Settlement & Cryptographic Verification)
- **Implemented Fix**: Replaced dummy verification with strict zero-knowledge verification rules mirroring `proofpass.compact`:
  - `computeCredentialCommitment`: Preimage binding $H(\text{student\_id}, \text{salt})$
  - `deriveProofNullifier`: One-time nullifier $H(\text{salt}, \text{secret\_key})$
  - `verifyIssuerSignature`: Cryptographic ECDSA signature verification over credential commitment
  - Replay prevention: Checked against `spentNullifiers` set populated from Midnight ledger.

### 2. `frontend/src/components/layout/TopHeader.tsx` (Custom Alert Preferences)
- **Implemented Fix**: Added state `alertPreferences` with options:
  - `settlements`: On-Chain Settlement Alerts
  - `verifications`: Instant Verification Verdicts
  - `circuitNullifiers`: Spent Nullifier Tracking
- Connected to real Midnight Preprod block heights (`fetchLatestBlockHeight`) with live sync indicators.

### 3. `frontend/src/components/verifier/VerifierView.tsx` (Circuit Execution)
- **Implemented Fix**: Bound `submitMidnightContractTx('verify_student_proof', ...)` with `connectedApi` from Midnight Lace wallet.
- On verification success, automatically submits on-chain nullifier consumption transaction to the Midnight Preprod testnet.
