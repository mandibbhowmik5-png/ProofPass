# 🎨 ProofPass Brand Brief & Identity Guidelines (docs/BRAND.md)

This document establishes the official visual design, brand voice, asset inventory, and social presence for **ProofPass**.

---

## 1. Brand Mission & Core Tenets

**Mission**: Empower students and educational institutions with self-sovereign, privacy-preserving digital identity built on the Midnight zero-knowledge blockchain.

### Core Tenets
1. **Privacy as a Human Right**: Students should never have to disclose their full legal identity or academic transcripts for everyday verification.
2. **Mathematical Trust**: Trust is rooted in zero-knowledge SNARK circuits and immutable blockchain ledger commitments, not centralized corporate databases.
3. **Seamless Simplicity**: Cryptography should be effortless; users experience one-click wallet connection and instant QR verification.

---

## 2. Color Palette & Theming

ProofPass utilizes a futuristic, dark-mode-first aesthetic inspired by Midnight's shielded network architecture.

| Color Name | Hex Code | Tailwind Token | Application & Usage |
|---|:---:|---|---|
| **Deep Void** | `#050B1A` | `bg-[#050B1A]` | Primary application background, canvas, and layout base |
| **Cyber Shield Navy** | `#0A1428` | `bg-[#0A1428]` | Container surfaces, modals, elevated glassmorphic panels |
| **Glass Border Navy** | `#1E2E4A` | `border-[#1E2E4A]` | Structural dividers, card borders, subtle grid outlines |
| **Electric Midnight Cyan** | `#22D3EE` | `text-[#22D3EE]` | Primary brand accent, call-to-action buttons, active tabs |
| **Zero-Knowledge Emerald** | `#4FFFC1` | `text-[#4FFFC1]` | Verified badges, cryptographic proof success indicators |
| **Warning Amber** | `#F59E0B` | `text-amber-400` | Expiration alerts, pending confirmations |
| **Revocation Crimson** | `#EF4444` | `text-red-500` | Revocation flags, security rejection notices |
| **Bright Contrast White** | `#F8FAFC` | `text-[#F8FAFC]` | Primary headings, prominent data labels |
| **Muted Slate** | `#94A3B8` | `text-[#94A3B8]` | Secondary body text, timestamps, transaction hashes |

---

## 3. Typography & Styling

- **Primary Typeface**: Inter / SF Pro (clean sans-serif for high readability across dense credential data)
- **Monospace Typeface**: JetBrains Mono (used for Bech32m addresses `mn_addr_preprod1...`, transaction hashes, and Compact circuit names)
- **Design Tokens**:
  - `backdrop-blur-xl`: Translucent frosted glass effect
  - Hardware-accelerated CSS GPU transforms (`will-change: transform`) for fluid 60fps transitions
  - Custom scrollbars styled with cyan/navy accents

---

## 4. Brand Asset Inventory

All official brand image assets are hosted within [`frontend/public/assets/`](../frontend/public/assets/):

| Asset Filename | Format | Dimensions | Usage in Codebase |
|---|:---:|:---:|---|
| `sidebar_futuristic_bg.jpg` | JPEG | 1920x1080 | Ambient background texture behind the desktop navigation sidebar ([`Sidebar.tsx`](../frontend/src/components/layout/Sidebar.tsx)) |
| `zk_hero_geometry.jpg` | JPEG | 2400x1350 | Geometric hero graphic representing zero-knowledge circuit topology ([`IssuerView.tsx`](../frontend/src/components/issuer/IssuerView.tsx)) |
| `zk_midnight_crypto_hero.jpg` | JPEG | 2048x1152 | Primary application banner and modal background representing the Midnight privacy ecosystem |
| `favicon.ico` / `favicon.svg` | SVG | Vector | Official browser tab icon displaying the ProofPass privacy shield |

---

## 5. Official Social Presence: Product X (Twitter) Profile

- **Handle**: [`@MIDNIGHTya0ne`](https://x.com/MIDNIGHTya0ne)
- **Direct Link**: [https://x.com/MIDNIGHTya0ne](https://x.com/MIDNIGHTya0ne)
- **Bio**: *"ProofPass — Privacy-preserving zero-knowledge student credentials on Midnight Blockchain. Tamper-proof, zero PII exposure, built on Cardano's privacy partner network."*

### Key Product Highlights on X:
1. **Launch Announcement**: Introduction to ProofPass on Midnight Preprod testnet with verified explorer contract link.
2. **Zero-Knowledge Demo**: Visual walkthrough of student credential generation and QR code instant verification without PII exposure.
3. **Community Testing Campaign**: Sharing the Google feedback form and inviting student developers to test the live Vercel deployment.
