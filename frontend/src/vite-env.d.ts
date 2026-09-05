/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIDNIGHT_NETWORK_ID?: string;
  readonly VITE_INDEXER_URI?: string;
  readonly VITE_PROVER_SERVER_URI?: string;
  readonly VITE_NODE_URI?: string;
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_APP_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
