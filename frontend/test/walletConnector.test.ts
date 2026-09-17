import { 
  discoverMidnightWallets,
  isMidnightWalletAvailable,
  connectMidnightWallet,
  parseWalletError,
  shortenAddress,
  PREPROD_CONTRACT_ADDRESS,
  MIDNIGHT_NETWORKS 
} from '../src/lib/midnight/midnightConnector';
import { MidnightInitialAPI, MidnightConnectedAPI } from '../src/lib/types';

async function runWalletTests() {
  console.log('🧪 Starting ProofPass Midnight Preprod Wallet Connector Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // TEST 1: Address Shortening Utility
  try {
    const fullAddr = 'mn1q98f417e29a39d89c02b1f48039d91cb61d84';
    const shortened = shortenAddress(fullAddr, 6, 4);
    if (shortened === 'mn1q98...1d84') {
      console.log('✅ Test 1 Passed: Address shortener correctly formats Midnight Bech32m addresses');
      passed++;
    } else {
      throw new Error(`Expected mn1q98...1d84 but got ${shortened}`);
    }
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // TEST 2: Preprod Contract Configuration Verification
  try {
    const expectedContract = '5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e';
    const preprodNet = MIDNIGHT_NETWORKS['midnight-preprod'];
    
    if (PREPROD_CONTRACT_ADDRESS === expectedContract && preprodNet.networkId === 'preprod') {
      console.log('✅ Test 2 Passed: Deployed Preprod contract address and networkId verified');
      passed++;
    } else {
      throw new Error(`Contract mismatch: ${PREPROD_CONTRACT_ADDRESS} vs expected ${expectedContract}`);
    }
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // TEST 3: Error Categorization & Parsing
  try {
    const rejectErr = parseWalletError(new Error('User rejected the request'));
    const networkErr = parseWalletError(new Error('Chain ID mismatch. Unsupported network.'));
    const missingErr = parseWalletError(new Error('Midnight wallet extension not detected in browser'));

    if (
      rejectErr.code === 'USER_REJECTED' &&
      networkErr.code === 'WRONG_NETWORK' &&
      missingErr.code === 'WALLET_NOT_INSTALLED'
    ) {
      console.log('✅ Test 3 Passed: Wallet error categorization maps correctly to user-friendly codes');
      passed++;
    } else {
      throw new Error(`Unexpected error codes: ${rejectErr.code}, ${networkErr.code}, ${missingErr.code}`);
    }
  } catch (err: any) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // TEST 4: Detection when window.midnight is empty
  try {
    (global as any).window = {};
    const available = isMidnightWalletAvailable();
    if (!available) {
      console.log('✅ Test 4 Passed: Wallet detection returns false when extension is not injected');
      passed++;
    } else {
      throw new Error('Expected isMidnightWalletAvailable to be false');
    }
  } catch (err: any) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // TEST 5: Dynamic Wallet Discovery via window.midnight
  try {
    const mockWalletUuid = 'b732e73a-4efb-4176-a059-d6529b46f663';
    const mockConnectedApi: MidnightConnectedAPI = {
      getUnshieldedAddress: async () => 'mn1q98f417e29a39d89c02b1f48039d91cb61d84',
      getShieldedAddresses: async () => ({
        shieldedAddress: 'mn_shielded_test_addr_123',
        shieldedCoinPublicKey: '0x04e82b79a1f24d9c'
      }),
      getConnectionStatus: async () => true,
      submitTransaction: async (tx: any) => '0x' + 'a'.repeat(64)
    };

    const mockInitialApi: MidnightInitialAPI = {
      name: 'Midnight Lace',
      apiVersion: '1.0.0',
      connect: async (networkId: string) => {
        if (networkId !== 'preprod') {
          throw new Error('Unsupported network. Expected preprod.');
        }
        return mockConnectedApi;
      },
      getConnectionStatus: async () => true
    };

    (global as any).window = {
      midnight: {
        [mockWalletUuid]: mockInitialApi
      }
    };

    const discovered = discoverMidnightWallets();
    if (discovered.length === 1 && discovered[0].name === 'Midnight Lace') {
      console.log('✅ Test 5 Passed: Dynamic discovery identified injected Midnight wallet');
      passed++;
    } else {
      throw new Error(`Expected 1 discovered wallet, found ${discovered.length}`);
    }

    // TEST 6: Successful Connection Flow to Preprod
    const connResult = await connectMidnightWallet('midnight-preprod');
    if (
      connResult.address === 'mn1q98f417e29a39d89c02b1f48039d91cb61d84' &&
      connResult.networkId === 'preprod' &&
      connResult.shieldedAddress === 'mn_shielded_test_addr_123'
    ) {
      console.log('✅ Test 6 Passed: Wallet connected successfully to Midnight Preprod with unshielded address');
      passed++;
    } else {
      throw new Error(`Unexpected connection result: ${JSON.stringify(connResult)}`);
    }

    // TEST 7: Wallet User Rejection Flow
    (global as any).window.midnight[mockWalletUuid].connect = async () => {
      throw new Error('User declined authorization in Midnight Lace');
    };

    try {
      await connectMidnightWallet('midnight-preprod');
      throw new Error('Should have thrown on user rejection');
    } catch (rejectionErr: any) {
      if (rejectionErr.walletError?.code === 'USER_REJECTED') {
        console.log('✅ Test 7 Passed: User rejection handled gracefully with USER_REJECTED error');
        passed++;
      } else {
        throw new Error(`Expected USER_REJECTED but got ${rejectionErr.walletError?.code}`);
      }
    }

  } catch (err: any) {
    console.error('❌ Test 5/6/7 Failed:', err.message);
    failed++;
  }

  console.log(`\n🏁 Wallet Test Suite Complete: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runWalletTests();
