import React, { createContext, useContext, useState, useEffect } from 'react';
import { NetworkType } from '../lib/types';
import { 
  MIDNIGHT_NETWORKS, 
  MidnightNetworkConfig, 
  connectMidnightLace, 
  isMidnightWalletAvailable 
} from '../lib/midnight/midnightConnector';
import { generateRandomSecret } from '../lib/crypto/zkEngine';

interface MidnightWalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isDemoMode: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  publicKey: string | null;
  network: NetworkType;
  networkConfig: MidnightNetworkConfig;
  balanceTdust: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setNetwork: (network: NetworkType) => void;
  toggleDemoMode: () => void;
  error: string | null;
}

const MidnightWalletContext = createContext<MidnightWalletContextType | undefined>(undefined);

export const MidnightWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<NetworkType>('midnight-preprod');
  const [isConnected, setIsConnected] = useState<boolean>(true); // Auto-connect simulated wallet for seamless onboarding
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>('mn1q98f417e29a39d89c02b1f48039d91cb61d84');
  const [publicKey, setPublicKey] = useState<string | null>('0x04e82b79a1f24d9c87b9e0123456789abcdef0123456789abcdef0123456789a');
  const [balanceTdust, setBalanceTdust] = useState<number>(4500);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLaceInstalled(isMidnightWalletAvailable());
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (isMidnightWalletAvailable()) {
        const { address, publicKey } = await connectMidnightLace();
        setAddress(address);
        setPublicKey(publicKey);
        setIsConnected(true);
        setIsDemoMode(false);
      } else {
        // Simulated Midnight Identity fallback
        const simulatedSecret = generateRandomSecret(16);
        const simAddress = `mn1q${simulatedSecret}`;
        const simPk = `0x04${generateRandomSecret(32)}`;
        setAddress(simAddress);
        setPublicKey(simPk);
        setIsConnected(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Midnight wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setPublicKey(null);
  };

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  };

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  return (
    <MidnightWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        isDemoMode,
        isLaceInstalled,
        address,
        publicKey,
        network,
        networkConfig: MIDNIGHT_NETWORKS[network],
        balanceTdust,
        connectWallet,
        disconnectWallet,
        setNetwork,
        toggleDemoMode,
        error
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
