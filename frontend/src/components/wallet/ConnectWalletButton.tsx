import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Radio, 
  X,
  Download
} from 'lucide-react';
import { useMidnightWallet } from '../../context/MidnightWalletContext';

interface ConnectWalletButtonProps {
  className?: string;
  showNetworkTag?: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  className = '',
  showNetworkTag = true 
}) => {
  const {
    isConnected,
    isConnecting,
    isWalletInstalled,
    address,
    shortAddress,
    walletName,
    networkName,
    contractAddress,
    contractExplorerUrl,
    connectWallet,
    disconnectWallet,
    error,
    clearError
  } = useMidnightWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    disconnectWallet();
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* ── NOT CONNECTED: Prominent "Connect Wallet" Button ── */}
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          aria-label="Connect Midnight Wallet"
          className="group relative inline-flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 text-cyan-200 animate-spin" />
              <span className="tracking-wide">Connecting...</span>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <Wallet className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform duration-200" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
              </div>
              <span className="tracking-wide font-bold">Connect Wallet</span>
              {showNetworkTag && (
                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#050B1A]/60 text-cyan-300 rounded border border-cyan-400/20">
                  Preprod
                </span>
              )}
            </>
          )}
        </button>
      ) : (
        /* ── CONNECTED: Shortened Address Pill with Dropdown Trigger ── */
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-label="Wallet details"
          className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 border shadow-sm ${
            isDropdownOpen
              ? 'bg-[#0F1E38] border-cyan-400/60 text-cyan-300 shadow-cyan-500/20'
              : 'bg-[#0A1428] hover:bg-[#0F1E38] border-[#1E2E4A] hover:border-cyan-500/40 text-slate-200'
          }`}
        >
          {/* Active Network Pulse Indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          {/* Shortened Address */}
          <span className="font-semibold tracking-tight text-cyan-300">
            {shortAddress || 'mn1q...'}
          </span>

          {/* Preprod Badge */}
          {showNetworkTag && (
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#050B1A] text-emerald-400 rounded border border-emerald-500/30">
              Preprod
            </span>
          )}

          <ChevronDown 
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180 text-cyan-300' : ''
            }`} 
          />
        </button>
      )}

      {/* ── CONNECTED DROPDOWN POPOVER ── */}
      {isConnected && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 bg-[#0A1428]/95 border border-[#1E2E4A] rounded-2xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-300">
          
          {/* Header Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-white">Connected Status</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              Active Session
            </span>
          </div>

          <div className="py-3 space-y-3">
            {/* Wallet Provider Info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Wallet Provider</span>
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>{walletName || 'Midnight Lace'}</span>
              </span>
            </div>

            {/* Network Display */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Network</span>
              <span className="font-mono text-cyan-300 flex items-center space-x-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{networkName}</span>
              </span>
            </div>

            {/* Full Wallet Address Box with Copy */}
            <div className="p-3 bg-[#050B1A] border border-[#1E2E4A] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Wallet Address</span>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors text-[10px] font-mono"
                  title="Copy full address"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-slate-200 break-all select-all leading-relaxed">
                {address}
              </p>
            </div>

            {/* Deployed Contract Reference */}
            <div className="p-3 bg-[#0F1E38]/50 border border-[#1E2E4A]/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Deployed Preprod Contract</span>
                <a
                  href={contractExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors text-[10px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="font-mono text-[11px] text-cyan-300 break-all select-all">
                {contractAddress}
              </p>
            </div>
          </div>

          {/* Footer Action: Disconnect Button */}
          <div className="pt-3 border-t border-[#1E2E4A]">
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>

        </div>
      )}

      {/* ── ERROR MESSAGE BANNER / MODAL ── */}
      {error && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 bg-[#0A1428] border border-rose-500/40 rounded-2xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-rose-300">
                  {error.code === 'WALLET_NOT_INSTALLED' && 'Wallet Not Installed'}
                  {error.code === 'USER_REJECTED' && 'Connection Rejected'}
                  {error.code === 'WRONG_NETWORK' && 'Wrong Network'}
                  {error.code === 'CONNECTION_FAILED' && 'Connection Error'}
                  {error.code === 'TRANSACTION_ERROR' && 'Transaction Error'}
                </h4>
                <button 
                  onClick={clearError}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-slate-300 mt-1 leading-relaxed">
                {error.message}
              </p>

              {/* Action buttons based on error type */}
              {error.code === 'WALLET_NOT_INSTALLED' && (
                <div className="mt-3">
                  <a
                    href="https://midnight.network/lace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install Midnight Lace</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}

              {error.code === 'USER_REJECTED' && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      clearError();
                      connectWallet();
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow transition-all"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
