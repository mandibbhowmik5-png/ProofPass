import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MIDNIGHT_NETWORKS } from './midnightConnector';
import { NetworkType } from '../types';
import { ProofPassLedgerState } from '../../contracts/proofpass/index';

export class IndexerUnavailableError extends Error {
  readonly endpoint: string;
  readonly network: NetworkType;

  constructor(endpoint: string, network: NetworkType, cause?: any) {
    super(
      `Midnight indexer service is unreachable at ${endpoint} (${network}). ` +
      `Failed to retrieve confirmed ledger state from Midnight blockchain.`
    );
    this.name = 'IndexerUnavailableError';
    this.endpoint = endpoint;
    this.network = network;
    this.cause = cause;
  }
}

export interface MidnightBlockInfo {
  height: number;
  hash: string;
  timestamp: number;
}

export interface MidnightTxInfo {
  txHash: string;
  blockHeight: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  circuit?: string;
}

class MidnightIndexerClient {
  private blockHeightCache: Map<NetworkType, { height: number; updatedAt: number }> = new Map();

  /**
   * Execute a GraphQL query against the target Midnight network's indexer.
   * Fails visibly if indexer is unreachable.
   */
  async query<T = any>(
    graphqlQuery: string,
    variables: Record<string, any> = {},
    network: NetworkType = 'midnight-preprod'
  ): Promise<T> {
    const netConfig = MIDNIGHT_NETWORKS[network];
    const endpoint = netConfig.indexerUri;
    const sdkNetwork = netConfig.networkId as 'preprod' | 'preview' | 'undeployed';

    try {
      setNetworkId(sdkNetwork);
    } catch {
      // Ignore if already set
    }

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables
        }),
        signal: AbortSignal.timeout(5000)
      });
    } catch (err: any) {
      throw new IndexerUnavailableError(endpoint, network, err);
    }

    if (!response.ok) {
      throw new IndexerUnavailableError(
        endpoint,
        network,
        new Error(`Midnight indexer HTTP error: ${response.status} ${response.statusText}`)
      );
    }

    const json = await response.json().catch(err => {
      throw new IndexerUnavailableError(endpoint, network, err);
    });

    if (json.errors && json.errors.length > 0) {
      throw new IndexerUnavailableError(
        endpoint,
        network,
        new Error(`Midnight GraphQL error: ${json.errors[0].message}`)
      );
    }

    return json.data as T;
  }

  /**
   * Fetch the latest confirmed block height from the Midnight network.
   * Fails visibly when indexer is unavailable.
   */
  async fetchLatestBlockHeight(network: NetworkType = 'midnight-preprod'): Promise<number> {
    const cached = this.blockHeightCache.get(network);
    const now = Date.now();
    if (cached && now - cached.updatedAt < 10000) {
      return cached.height;
    }

    const query = `
      query GetLatestMidnightBlock {
        block {
          height
          hash
          timestamp
        }
      }
    `;

    const data = await this.query<{ block: { height: number } }>(query, {}, network);
    if (data?.block?.height) {
      this.blockHeightCache.set(network, { height: data.block.height, updatedAt: now });
      return data.block.height;
    }

    throw new IndexerUnavailableError(
      MIDNIGHT_NETWORKS[network].indexerUri,
      network,
      new Error('Block height missing from indexer response')
    );
  }

  /**
   * Query contract ledger state from the Midnight Indexer.
   * Replaces LocalStorage as the source of truth for public ledger state.
   * Fails visibly when indexer is unavailable.
   */
  async fetchContractLedgerState(
    contractAddress: string,
    network: NetworkType = 'midnight-preprod'
  ): Promise<ProofPassLedgerState> {
    const query = `
      query GetProofPassContractState($contractAddress: String!) {
        contract(address: $contractAddress) {
          address
          state
          block {
            height
          }
        }
      }
    `;

    const data = await this.query<{ contract: { state: any; block: { height: number } } }>(
      query,
      { contractAddress },
      network
    );

    if (!data?.contract?.state) {
      throw new IndexerUnavailableError(
        MIDNIGHT_NETWORKS[network].indexerUri,
        network,
        new Error(`Contract state not found for address ${contractAddress}`)
      );
    }

    return this.deserializeLedgerState(data.contract.state);
  }

  private deserializeLedgerState(rawState: any): ProofPassLedgerState {
    const issuers = new Map<string, any>();
    const commitments = new Map<string, any>();
    const revoked_nullifiers = new Set<string>();

    if (rawState.issuers) {
      for (const [pk, info] of Object.entries(rawState.issuers)) {
        issuers.set(pk.toLowerCase(), info as any);
      }
    }
    if (rawState.commitments) {
      for (const [hash, meta] of Object.entries(rawState.commitments)) {
        commitments.set(hash.toLowerCase(), meta as any);
      }
    }
    if (Array.isArray(rawState.revoked_nullifiers)) {
      rawState.revoked_nullifiers.forEach((n: string) => revoked_nullifiers.add(n.toLowerCase()));
    }

    return {
      admin: rawState.admin || '0x04e82b79a1f24d9c87b9e0123456789abcdef0123456789abcdef0123456789a',
      issuers,
      commitments,
      revoked_nullifiers,
      total_verified_count: BigInt(rawState.total_verified_count || 0)
    };
  }
}

export const indexerClient = new MidnightIndexerClient();
