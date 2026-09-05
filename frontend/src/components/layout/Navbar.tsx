import React, { useState } from 'react';
import { 
  Shield, 
  Building2, 
  Wallet, 
  CheckCircle, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { NetworkType } from '../../lib/types';

interface NavbarProps {
  activeTab: 'issuer' | 'holder' | 'verifier';
  setActiveTab: (tab: 'issuer' | 'holder' | 'verifier') => void;
  onOpenZkModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenZkModal }) => {
  const { 
    isConnected, 
    isConnecting, 
    isDemoMode, 
    isLaceInstalled,
    address, 
    network, 
    setNetwork, 
    toggleDemoMode, 
    connectWallet, 
    disconnectWallet 
  } = useMidnightWallet();

  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  const networks: { id: NetworkType; label: string; tag: string }[] = [
    { id: 'midnight-preprod', label: 'Midnight Preprod', tag: 'Testnet' },
    { id: 'midnight-preview', label: 'Midnight Preview', tag: 'Staging' },
    { id: 'midnight-local', label: 'Midnight Local', tag: 'Devnet' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-midnight-700/60 bg-[#060813]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('holder')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060813] animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  ProofPass
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 rounded-full">
                  Midnight zk
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero-Knowledge Student Credentials</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-midnight-900/90 border border-midnight-700/60 rounded-xl">
            <button
              onClick={() => setActiveTab('issuer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'issuer'
                  ? 'bg-gradient-to-r from-indigo-600 to-midnight-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>1. Issuer Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('holder')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'holder'
                  ? 'bg-gradient-to-r from-cyan-600 to-midnight-600 text-white shadow-md shadow-cyan-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/50'
              }`}
            >
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>2. Student Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'verifier'
                  ? 'bg-gradient-to-r from-emerald-600 to-midnight-600 text-white shadow-md shadow-emerald-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>3. Verifier Hub</span>
            </button>
          </nav>

          {/* Controls, Network, Wallet */}
          <div className="flex items-center space-x-3">
            
            {/* ZK Info Modal Trigger */}
            <button
              onClick={onOpenZkModal}
              title="How Midnight ZK Works"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-midnight-900/80 hover:bg-midnight-800 border border-midnight-700/60 rounded-lg transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">How ZK Works</span>
            </button>

            {/* Network Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-midnight-900/80 hover:bg-midnight-800 border border-midnight-700/60 rounded-lg transition-colors"
              >
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">
                  {network === 'midnight-preprod' ? 'Preprod' : network === 'midnight-preview' ? 'Preview' : 'Local'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isNetworkDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 py-2 bg-midnight-900/95 border border-midnight-700 rounded-xl shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Midnight Networks
                  </div>
                  {networks.map(net => (
                    <button
                      key={net.id}
                      onClick={() => {
                        setNetwork(net.id);
                        setIsNetworkDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                        network === net.id
                          ? 'bg-cyan-950/60 text-cyan-300 border-l-2 border-cyan-400'
                          : 'text-slate-300 hover:bg-midnight-800'
                      }`}
                    >
                      <span>{net.label}</span>
                      <span className="px-1.5 py-0.5 text-[9px] bg-midnight-800 text-slate-400 rounded">
                        {net.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Demo / Live Mode Toggle */}
            <button
              onClick={toggleDemoMode}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isDemoMode
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}
              title={isDemoMode ? "Interactive sandbox mode enabled" : "Connected to Midnight network"}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDemoMode ? 'Demo Sandbox' : 'Live Midnight'}</span>
            </button>

            {/* Wallet Button */}
            {isConnected && address ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-midnight-900/90 border border-midnight-700/80 rounded-lg text-xs font-mono text-cyan-300">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Midnight'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-midnight-800">
          <button
            onClick={() => setActiveTab('issuer')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg font-medium ${
              activeTab === 'issuer' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Issuer</span>
          </button>
          <button
            onClick={() => setActiveTab('holder')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg font-medium ${
              activeTab === 'holder' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Student Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg font-medium ${
              activeTab === 'verifier' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verifier</span>
          </button>
        </div>

      </div>
    </header>
  );
};
