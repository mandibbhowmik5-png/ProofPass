import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  NetworkType, 
  WalletError, 
  MidnightConnectedAPI 
} from '../lib/types';
import { 
  MIDNIGHT_NETWORKS, 
  MidnightNetworkConfig, 
  PREPROD_CONTRACT_ADDRESS,
  connectMidnightWallet, 
  discoverMidnightWallets,
  isMidnightWalletAvailable,
  checkWalletConnectionStatus,
  shortenAddress,
  parseWalletError 
} from '../lib/midnight/midnightConnector';

interface MidnightWalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isWalletInstalled: boolean;
  address: string | null;
  shortAddress: string;
  publicKey: string | null;
  shieldedAddress: string | null;
  walletName: string | null;
  network: NetworkType;
  networkName: string;
  networkConfig: MidnightNetworkConfig;
  contractAddress: string;
  contractExplorerUrl: string;
  connectedApi: MidnightConnectedAPI | null;
  balanceTdust: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setNetwork: (network: NetworkType) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  error: WalletError | null;
  clearError: () => void;
}

const MidnightWalletContext = createContext<MidnightWalletContextType | undefined>(undefined);

const STORAGE_KEY = 'proofpass_wallet_connected';

export const MidnightWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<NetworkType>('midnight-preprod');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isWalletInstalled, setIsWalletInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<MidnightConnectedAPI | null>(null);
  const [balanceTdust, setBalanceTdust] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [error, setError] = useState<WalletError | null>(null);

  const currentNetworkConfig = MIDNIGHT_NETWORKS[network];
  const contractAddress = currentNetworkConfig.contractAddress || PREPROD_CONTRACT_ADDRESS;
  const contractExplorerUrl = `${currentNetworkConfig.explorerUrl}/contracts/${contractAddress}`;

  // Check if wallet is installed in browser
  useEffect(() => {
    const checkInstallation = () => {
      const installed = isMidnightWalletAvailable();
      setIsWalletInstalled(installed);
    };

    checkInstallation();
    // Recheck on window focus or after brief delay in case extension injected after DOM load
    const timer = setTimeout(checkInstallation, 600);
    window.addEventListener('focus', checkInstallation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', checkInstallation);
    };
  }, []);

  // Silent session restoration if user previously connected
  useEffect(() => {
    const trySilentReconnect = async () => {
      const previouslyConnected = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!previouslyConnected) return;

      const isAuthorized = await checkWalletConnectionStatus();
      if (isAuthorized) {
        try {
          const result = await connectMidnightWallet(network);
          setAddress(result.address);
          setPublicKey(result.publicKey);
          setShieldedAddress(result.shieldedAddress || null);
          setWalletName(result.walletName);
          setConnectedApi(result.connectedApi);
          setIsConnected(true);
        } catch {
          // If silent reconnect fails, clear storage
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    trySilentReconnect();
  }, [network]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await connectMidnightWallet(network);
      
      setAddress(result.address);
      setPublicKey(result.publicKey);
      setShieldedAddress(result.shieldedAddress || null);
      setWalletName(result.walletName);
      setConnectedApi(result.connectedApi);
      setIsConnected(true);
      setError(null);
      localStorage.setItem(STORAGE_KEY, 'true');

      // Fetch balances if available on ConnectedAPI
      if (typeof result.connectedApi.getShieldedBalances === 'function') {
        try {
          const balances = await result.connectedApi.getShieldedBalances();
          const firstBalance = Object.values(balances)[0];
          if (firstBalance !== undefined) {
            setBalanceTdust(Number(firstBalance));
          }
        } catch {
          // Optional balance fetch
        }
      }
    } catch (err: any) {
      const walletErr: WalletError = err.walletError || parseWalletError(err);
      setError(walletErr);
      setIsConnected(false);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsConnecting(false);
    }
  }, [network]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setPublicKey(null);
    setShieldedAddress(null);
    setWalletName(null);
    setConnectedApi(null);
    setBalanceTdust(0);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  }, []);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const shortAddress = shortenAddress(address, 6, 4);

  return (
    <MidnightWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        isWalletInstalled,
        address,
        shortAddress,
        publicKey,
        shieldedAddress,
        walletName,
        network,
        networkName: currentNetworkConfig.name,
        networkConfig: currentNetworkConfig,
        contractAddress,
        contractExplorerUrl,
        connectedApi,
        balanceTdust,
        connectWallet,
        disconnectWallet,
        setNetwork,
        isDemoMode,
        toggleDemoMode,
        error,
        clearError
      }}
    >
      {children}
    </MidnightWalletContext.Provider>
  );
};

export const useMidnightWallet = () => {
  const context = useContext(MidnightWalletContext);
  if (!context) {
    throw new Error('useMidnightWallet must be used within a MidnightWalletProvider');
  }
  return context;
};

