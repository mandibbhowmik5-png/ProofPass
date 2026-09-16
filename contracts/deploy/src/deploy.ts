/**
 * ProofPass Midnight Smart Contract Deployment Script
 *
 * PREREQUISITES — run once before deploying:
 *   1. Install Compact compiler (follow env-setup guide):
 *        https://docs.midnight.network/develop/tutorial/using/env-setup
 *   2. Start the Proof Server via Docker (separate terminal):
 *        docker run -p 6300:6300 midnightntwrk/proof-server:latest
 *   3. Get test tokens from faucet:
 *        Preview  → https://faucet.midnight.network/preview
 *        Preprod  → https://faucet.midnight.network/preprod
 *   4. Install Midnight Lace wallet:
 *        https://midnight.network/lace
 *
 * USAGE:
 *   npm run deploy:preview   → deploys to Preview testnet
 *   npm run deploy:preprod   → deploys to Preprod testnet
 */

import { writeFileSync } from "fs";
import { resolve }       from "path";

// Network endpoints (source: docs.midnight.network)
const NETWORKS = {
  preview: {
    name:            "Preview",
    nodeEndpoint:    "https://rpc.preview.midnight.network",
    indexerEndpoint: "https://indexer.preview.midnight.network/api/v4/graphql",
    proofServer:     "http://localhost:6300",
    explorerBase:    "https://preview.midnightexplorer.com",
    faucet:          "https://faucet.midnight.network/preview",
  },
  preprod: {
    name:            "Preprod",
    nodeEndpoint:    "https://rpc.preprod.midnight.network",
    indexerEndpoint: "https://indexer.preprod.midnight.network/api/v4/graphql",
    proofServer:     "http://localhost:6300",
    explorerBase:    "https://preprod.midnightexplorer.com",
    faucet:          "https://faucet.midnight.network/preprod",
  },
} as const;

type Network = keyof typeof NETWORKS;

const args    = process.argv.slice(2);
const idx     = args.indexOf("--network");
const network = (idx !== -1 ? args[idx + 1] : "preprod") as Network;

if (!NETWORKS[network]) {
  console.error(`\nUnknown network "${network}". Use --network preview|preprod\n`);
  process.exit(1);
}

const cfg = NETWORKS[network];

console.log(`
╔══════════════════════════════════════════════════╗
║    ProofPass — Midnight Contract Deployment      ║
╚══════════════════════════════════════════════════╝
Network      : ${cfg.name}
Node         : ${cfg.nodeEndpoint}
Indexer      : ${cfg.indexerEndpoint}
Proof Server : ${cfg.proofServer}
Explorer     : ${cfg.explorerBase}
`);

console.log(`[STEP 1] Compile the Compact contract
  Run from project root:
    compact compile contracts/proofpass.compact
  Outputs: managed-api/ keys/ zkir/
`);
console.log(`[STEP 2] Start Proof Server (separate terminal)
  docker run -p 6300:6300 midnightntwrk/proof-server:latest
`);
console.log(`[STEP 3] Get test tNIGHT from the ${cfg.name} faucet
  ${cfg.faucet}
  Switch Midnight Lace wallet to "${cfg.name}" network.
`);
console.log(`[STEP 4] Deploy via Midnight SDK after compilation
  Example (TypeScript):

  import { DeployedContract } from "@midnight-ntwrk/midnight-js-contracts";

  const providers = {
    node:        { endpoint: "${cfg.nodeEndpoint}" },
    indexer:     { endpoint: "${cfg.indexerEndpoint}" },
    proofServer: { endpoint: "${cfg.proofServer}" },
    wallet:      midnightLaceWallet,          // browser extension injection
  };

  const deployed = await DeployedContract.deploy(ProofPassContract, providers);
  const addr     = deployed.deployTxData.public.contractAddress;
  console.log("Contract Address:", addr);
  console.log("Explorer Link   :", "${cfg.explorerBase}/contracts/" + addr);
`);
console.log(`[STEP 5] After deployment, record your address
  - Explorer : ${cfg.explorerBase}/contracts/<YOUR_CONTRACT_ADDRESS>
  - frontend/.env:
      VITE_CONTRACT_ADDRESS_${network.toUpperCase()}=<YOUR_CONTRACT_ADDRESS>
  - Update README.md with the real address and explorer link.

Full tutorial: https://docs.midnight.network/develop/tutorial/building/deploy
Discord help : https://discord.gg/midnightnetwork
`);

// Write a deployment config placeholder to disk
const outPath = resolve(`deployment-${network}.json`);
writeFileSync(outPath, JSON.stringify({
  network,
  status:          "PENDING_DEPLOYMENT",
  nodeEndpoint:    cfg.nodeEndpoint,
  indexerEndpoint: cfg.indexerEndpoint,
  explorerBase:    cfg.explorerBase,
  contractSource:  "contracts/proofpass.compact",
  contractAddress: "DEPLOY_TO_GET_ADDRESS",
  explorerLink:    `${cfg.explorerBase}/contracts/DEPLOY_TO_GET_ADDRESS`,
  generatedAt:     new Date().toISOString(),
}, null, 2));

console.log(`Config template saved → ${outPath}\n`);

