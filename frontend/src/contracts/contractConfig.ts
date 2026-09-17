// Midnight Preprod Deployed Contract Address
export const MIDNIGHT_PREPROD_CONTRACT_ADDRESS = "5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e";
export const MIDNIGHT_PREPROD_EXPLORER_URL = `https://preprod.midnightexplorer.com/contracts/${MIDNIGHT_PREPROD_CONTRACT_ADDRESS}`;
export const MIDNIGHT_PREPROD_RPC = "https://rpc.preprod.midnight.network";
export const MIDNIGHT_PREPROD_INDEXER = "https://indexer.preprod.midnight.network/api/v1/graphql";

// EVM / Hardhat compatibility config
export const PROOFPASS_CONTRACT_ADDRESS = MIDNIGHT_PREPROD_CONTRACT_ADDRESS;
export const PROOFPASS_NETWORK_NAME = "midnight-preprod";
export const PROOFPASS_CHAIN_ID = 31337;

export const PROOFPASS_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitmentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "issuedAt",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "expiresAt",
        "type": "uint64"
      }
    ],
    "name": "CredentialIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitmentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "nullifier",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      }
    ],
    "name": "CredentialRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "accreditationTier",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "registeredAt",
        "type": "uint64"
      }
    ],
    "name": "IssuerRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum ProofPass.IssuerStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "IssuerStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitmentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "proofNullifier",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "currentTimestamp",
        "type": "uint64"
      }
    ],
    "name": "ProofVerified",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "commitments",
    "outputs": [
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "issuedAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "expiresAt",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "isRevoked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllIssuersCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_commitmentHash",
        "type": "bytes32"
      }
    ],
    "name": "getCredential",
    "outputs": [
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "issuedAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "expiresAt",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "isRevoked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuer",
        "type": "address"
      }
    ],
    "name": "getIssuer",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "accreditationTier",
        "type": "uint8"
      },
      {
        "internalType": "enum ProofPass.IssuerStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "registeredAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_nullifier",
        "type": "bytes32"
      }
    ],
    "name": "isNullifierSpent",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_commitmentHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint64",
        "name": "_expiresAt",
        "type": "uint64"
      }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "issuerAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "issuers",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "accreditationTier",
        "type": "uint8"
      },
      {
        "internalType": "enum ProofPass.IssuerStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "registeredAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_accreditationTier",
        "type": "uint8"
      }
    ],
    "name": "registerIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_commitmentHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_nullifier",
        "type": "bytes32"
      }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "revokedNullifiers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuer",
        "type": "address"
      },
      {
        "internalType": "enum ProofPass.IssuerStatus",
        "name": "_status",
        "type": "uint8"
      }
    ],
    "name": "setIssuerStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVerifiedCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_commitmentHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_proofNullifier",
        "type": "bytes32"
      },
      {
        "internalType": "uint64",
        "name": "_currentTimestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint8",
        "name": "_minAccreditationTier",
        "type": "uint8"
      }
    ],
    "name": "verifyStudentProof",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
