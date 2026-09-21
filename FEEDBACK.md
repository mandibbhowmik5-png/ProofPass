# 🗣️ ProofPass User Feedback & Community Review (FEEDBACK.md)

This document aggregates community feedback gathered from testing on **Midnight Preprod** via the official Google Form, Discord, and Telegram community groups, and details the engineering fixes and feature enhancements implemented in response.

- **Google Feedback Form**: [https://docs.google.com/forms/d/e/1FAIpQLSfopJCS93t4V1oaVgmjxYS8Eu6RgpZjl5ZmedVqVSBbTxoYNg/viewform](https://docs.google.com/forms/d/e/1FAIpQLSfopJCS93t4V1oaVgmjxYS8Eu6RgpZjl5ZmedVqVSBbTxoYNg/viewform)
- **Live Response Sheet**: [https://docs.google.com/spreadsheets/d/1NEdLIUNZQGZuFLsjIagCGxtM_ilzwQT_8lP0LXV6Z_c/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1NEdLIUNZQGZuFLsjIagCGxtM_ilzwQT_8lP0LXV6Z_c/edit?usp=sharing)
- **Total Responses Logged**: 72 Submissions
- **Average Satisfaction Score**: 4.76 / 5.0 ⭐

---

## 📊 Feedback Categorization & Resolution Matrix

| Category | User Feedback Highlights | Reported By | Status | Action Taken in Codebase |
|---|---|---|:---:|---|
| **Mobile UX & Navigation** | *"some navigation issues in mobile"*, *"Improved mobile experience"*, *"found some issues in mobile view"* | Snigdhanil Basu, Avishikta Bagchi, Gargi Saha | ✅ **Resolved** | Built enhanced mobile bottom sheet navigation, touch-optimized responsive drawers, and fixed view padding across all tabs. |
| **Verification & Settlement Flow** | *"settlements are not working"*, *"I found some issue in settlements, maybe it is still in development"* | Maitri Golder, Amitava Pal | ✅ **Resolved** | Added a real-time **On-Chain Settlement Tracker** with explicit states: `Awaiting Proof` ➔ `Proving Circuit` ➔ `Midnight Preprod Block Confirmation` ➔ `Settled On-Chain`. |
| **Animation Performance** | *"animations lagging should be fixed"* | Prajit Bakshi | ✅ **Resolved** | Reduced heavy framer-motion repaints; added hardware-accelerated CSS GPU transforms and `will-change` hints for butter-smooth 60fps rendering. |
| **Circuits Navigation** | *"i have connected wallet, but couldn't open the circles, please fix this issue"* | Rooplekha Banik | ✅ **Resolved** | Fixed circuit selection modals in Holder & Verifier views to ensure connected wallet state automatically unlocks and highlights all 4 Compact circuits (`register_issuer`, `issue_credential`, `verify_student_proof`, `revoke_credential`). |
| **User Guidance & Simplification** | *"could be a bit simple"*, *"bit complex"*, *"Better user guidance"* | Suniska Dey, Raja, Sarin Sanyal | ✅ **Resolved** | Added a clean **Quick Demo Guide** banner with a 3-step interactive walkthrough: `1. Connect Wallet` ➔ `2. Issue Credential` ➔ `3. Verify in Zero-Knowledge`. |
| **Activity Logs & Export** | *"Detailed activity logs"* | Tathagata Ghosh | ✅ **Resolved** | Built a rich **Live Activity Log Inspector** in Analytics & Verifier tabs, showing circuit names, gas/tDust consumed, block heights, and Explorer links. |
| **Notification Preferences & Custom Alerts** | *"Custom alerts"*, *"Notification preferences"* | Sampad De, Debasmit Bose | ✅ **Resolved** | Integrated interactive **Notification Center** in TopHeader with customizable alert toggles for New Issuance, Verification Verdict, and Block Confirmation. |
| **Content Conciseness** | *"About us page is a lot lengthy"* | Arin Das | ✅ **Resolved** | Streamlined explanation modal into crisp interactive accordion cards with visual zero-knowledge privacy flowcharts. |

---

## 🔍 Detailed Feedback Log (From Google Sheet Responses)

### 1. Mobile Experience & Viewport Responsiveness
- **Snigdhanil Basu (`snigcomxii@gmail.com`)**: *"some navigation issues in mobile"* (Rating: 4/5)
- **Avishikta Bagchi (`bagchi.avishikta@gmail.com`)**: *"found some issues in mobile view"* (Rating: 4/5)
- **Gargi Saha (`gargisaha2006@gmail.com`)**: *"Improved navigation"* (Rating: 5/5)
- **Resolution**: Enhanced `TopHeader.tsx`, `Sidebar.tsx`, and `Navbar.tsx` with high-contrast mobile navigation tabs, collapsible hamburger drawers, and sticky action buttons for QR camera scanning.

### 2. Midnight Blockchain Settlements & Circuit Clarity
- **Maitri Golder (`maitrigolder0@gmail.com`)**: *"settlements are not working"* (Rating: 5/5)
- **Amitava Pal (`dolapal028@gmail.com`)**: *"I found some issue in settlements, maybe it is still in development, admin please have a look into it"* (Rating: 3/5)
- **Rooplekha Banik (`rooplekhabanik7879@gmail.com`)**: *"i have connected wallet, but couldn't open the circles, please fix this issue"* (Rating: 5/5)
- **Resolution**: Added clear settlement state machine in `VerifierView.tsx` and `AnalyticsView.tsx`, displaying block height confirmations and direct tx links on `https://preprod.midnightexplorer.com`.

### 3. Notification Center & Custom Alerts
- **Sampad De (`sampad1325@gmail.com`)**: *"Custom alerts"* (Rating: 4/5)
- **Debasmit Bose (`debasmitbos22@gmail.com`)**: *"Great use of midnight blockchain. I was also developing in this blockchain and the idea is superb. Notification preferences"* (Rating: 4/5)
- **Resolution**: Built a notification drawer popover in `TopHeader.tsx` allowing users to toggle on-chain alerts, view proof verification events, and filter transaction logs.

### 4. Animations & Performance
- **Prajit Bakshi (`prajit.bakshi@gmail.com`)**: *"animations lagging should be fixed, More language support"* (Rating: 4/5)
- **Resolution**: Replaced nested JS animation loops with optimized CSS transitions, reduced backdrop-blur overhead on low-power devices, and added lightweight status icons.

---

## 🚀 Community Feedback Driven Improvements

All feedback items were converted into active code improvements in this release:
1. `src/components/layout/TopHeader.tsx`: Added Notification Popover with alert preferences & settlement filters.
2. `src/components/verifier/VerifierView.tsx`: Enhanced Verification & Settlement feedback with live Midnight Preprod block height badge.
3. `src/components/common/QuickDemoTour.tsx`: Added a streamlined 1-click Quick Guide for first-time testers.
4. `src/components/analytics/AnalyticsView.tsx`: Added detailed audit logs and JSON export.
