import { MidnightProvingProvider } from '../../contracts/proofpass/index';

export class ProofServerUnavailableError extends Error {
  readonly proverServerUri: string;
  readonly circuitName: string;

  constructor(proverServerUri: string, circuitName: string, cause?: any) {
    super(
      `Midnight Proof Server is unavailable at ${proverServerUri} while compiling/generating proof for circuit "${circuitName}". ` +
      `Please ensure the Midnight proof server is running (e.g. docker run -p 6300:6300 midnightntwrk/proof-server:latest) or a valid prover is configured.`
    );
    this.name = 'ProofServerUnavailableError';
    this.proverServerUri = proverServerUri;
    this.circuitName = circuitName;
    this.cause = cause;
  }
}

export interface ProverResponse {
  proof: string;
  publicInputs: string[];
  protocol?: string;
}

/**
 * Official Midnight Proving Provider Client
 * Connects to Midnight Proof Server (docker midnightntwrk/proof-server:latest or remote prover)
 * to generate zero-knowledge proofs for Compact circuits.
 * 
 * Fails visibly if the proof server is unreachable or reports an error.
 * Zero synthetic or mock proof fallbacks.
 */
export class ProofPassProvingProvider implements MidnightProvingProvider {
  readonly proverServerUri: string;

  constructor(proverServerUri: string = 'http://localhost:6300') {
    this.proverServerUri = proverServerUri;
  }

  /**
   * Request a genuine zk-SNARK proof from the Midnight Proving Server
   */
  async generateProof(
    circuitName: string,
    publicInputs: Record<string, any>,
    privateWitnesses: Record<string, any>
  ): Promise<{ proofBlob: string; publicSignals: string[] }> {
    const payload = {
      circuit: circuitName,
      publicInputs,
      privateWitnesses,
      protocol: 'Midnight-Groth16-ZK-SNARK'
    };

    let response: Response;
    try {
      response = await fetch(`${this.proverServerUri}/v1/prove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
    } catch (networkErr: any) {
      throw new ProofServerUnavailableError(this.proverServerUri, circuitName, networkErr);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new ProofServerUnavailableError(
        this.proverServerUri,
        circuitName,
        new Error(`HTTP ${response.status}: ${errText}`)
      );
    }

    const result = (await response.json()) as ProverResponse;
    if (!result?.proof) {
      throw new ProofServerUnavailableError(
        this.proverServerUri,
        circuitName,
        new Error('Malformed response from proof server: missing proof payload')
      );
    }

    return {
      proofBlob: result.proof,
      publicSignals: result.publicInputs || []
    };
  }
}
