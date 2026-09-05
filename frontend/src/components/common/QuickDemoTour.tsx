import React from 'react';
import { ArrowRight, Sparkles, Building2, Wallet, CheckCircle2 } from 'lucide-react';

interface QuickDemoTourProps {
  activeTab: 'issuer' | 'holder' | 'verifier';
  setActiveTab: (tab: 'issuer' | 'holder' | 'verifier') => void;
}

export const QuickDemoTour: React.FC<QuickDemoTourProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-900 border border-midnight-700/80 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Interactive Midnight Credential Lifecycle Demo</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded-full">
                Pre-Loaded & Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow the 3-step privacy workflow: Issue → Hold & Create ZK Proof → Verify On-Chain without leaking PII.
            </p>
          </div>
        </div>

        {/* Right: Step Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('issuer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeTab === 'issuer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-midnight-800 text-slate-300 hover:bg-midnight-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Issue</span>
          </button>

          <ArrowRight className="w-3 h-3 text-slate-600" />

          <button
            onClick={() => setActiveTab('holder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeTab === 'holder'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-midnight-800 text-slate-300 hover:bg-midnight-700'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>2. Generate Proof</span>
          </button>

          <ArrowRight className="w-3 h-3 text-slate-600" />

          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeTab === 'verifier'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-midnight-800 text-slate-300 hover:bg-midnight-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Verify</span>
          </button>
        </div>

      </div>
    </div>
  );
};
