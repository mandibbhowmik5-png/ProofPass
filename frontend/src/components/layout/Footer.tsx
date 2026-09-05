import React from 'react';
import { Shield, Sparkles, RefreshCw, Terminal, ExternalLink, Cpu } from 'lucide-react';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { useCredentialStore } from '../../context/CredentialStoreContext';

export const Footer: React.FC = () => {
  const { networkConfig, network } = useMidnightWallet();
  const { resetToSampleData } = useCredentialStore();

  const handleReset = () => {
    if (window.confirm('Reset all demo credentials, issuers, and verification history to initial defaults?')) {
      resetToSampleData();
    }
  };

  return (
    <footer className="mt-20 border-t border-midnight-800 bg-[#060813]/90 text-slate-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">ProofPass</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Privacy-first student verifiable credential layer powered by Midnight zero-knowledge smart contracts (Compact).
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-cyan-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Compact ZK-SNARK Engine v0.20</span>
            </div>
          </div>

          {/* Midnight Network Info */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Midnight Ledger State</h4>
            <ul className="space-y-1.5 text-[11px] font-mono">
              <li className="text-slate-400">
                Network: <span className="text-cyan-300">{network}</span>
              </li>
              <li className="truncate text-slate-400">
                Contract: <span className="text-slate-300">{networkConfig.contractAddress.slice(0, 14)}...</span>
              </li>
              <li className="text-slate-400">
                Indexer: <span className="text-slate-300">GraphQL / REST v1</span>
              </li>
              <li>
                <a
                  href={networkConfig.faucetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Midnight Faucet (tDUST)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Midnight Developer Tooling</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href="https://docs.midnight.network" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>Official Midnight Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.midnight.network/develop/tutorial/building/compact" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>Compact Smart Contract Language</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/midnight-ntwrk" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>Midnight Network GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Demo Utilities</h4>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-midnight-900 hover:bg-midnight-800 border border-midnight-700/80 rounded-lg text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Demo State</span>
            </button>
            <p className="text-[10px] text-slate-500">
              Restores initial MIT/Stanford credentials, commitments, and verification logs.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-midnight-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ProofPass. Built for the Midnight Zero-Knowledge Privacy Hackathon.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="flex items-center space-x-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Midnight Preprod Ready</span>
            </span>
            <span>Privacy Preserved (Zero PII on-chain)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
