import React from 'react';
import { 
  Building2, 
  Wallet, 
  CheckCircle2, 
  HelpCircle, 
  BarChart3, 
  Terminal, 
  Shield, 
  RefreshCw, 
  Cpu, 
  Radio
} from 'lucide-react';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { useCredentialStore } from '../../context/CredentialStoreContext';

export type NavigationTab = 'issuer' | 'holder' | 'verifier' | 'how-zk-works' | 'playground' | 'analytics';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenZkModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenZkModal }) => {
  const { network } = useMidnightWallet();
  const { resetToSampleData } = useCredentialStore();

  const navItems = [
    { id: 'issuer' as NavigationTab, label: 'Issuer Portal', icon: Building2, tag: 'Authority' },
    { id: 'holder' as NavigationTab, label: 'Student Vault', icon: Wallet, tag: 'Holder' },
    { id: 'verifier' as NavigationTab, label: 'Verifier Hub', icon: CheckCircle2, tag: 'Verifier' },
    { id: 'how-zk-works' as NavigationTab, label: 'How ZK Works', icon: HelpCircle, tag: 'Explainer' },
    { id: 'playground' as NavigationTab, label: 'ZK Playground', icon: Terminal, tag: 'Sandbox' },
    { id: 'analytics' as NavigationTab, label: 'Analytics & Logs', icon: BarChart3, tag: 'Metrics' },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all demo credentials, issuers, and verification history to initial defaults?')) {
      resetToSampleData();
    }
  };

  return (
    <aside className="w-64 bg-[#050B1A] border-r border-[#1E2E4A] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 shadow-2xl shadow-black/80 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen">
        <img 
          src="/assets/sidebar_futuristic_bg.jpg" 
          alt="Sidebar Background Graphic" 
          className="w-full h-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050B1A]/60 to-[#050B1A]/95"></div>
      </div>

      {/* Top Header & Branding */}
      <div className="relative z-10">
        
        {/* Brand Container */}
        <div className="p-5 border-b border-[#1E2E4A] bg-gradient-to-b from-[#0A1428]/80 to-transparent backdrop-blur-[4px]">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('issuer')}
          >
            {/* Modern Shield Logo with Mint-to-Cyan-to-Violet Neon Glow */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#4FFFC1] via-[#22D3EE] via-[#3B82F6] to-[#8B5CF6] p-[1.5px] shadow-lg shadow-[#22D3EE30] group-hover:shadow-[#4FFFC140] transition-all duration-300">
              <div className="w-full h-full bg-[#050B1A] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#4FFFC115] to-[#8B5CF625]"></div>
                <Shield className="w-5 h-5 text-[#22D3EE] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4FFFC1] rounded-full border-2 border-[#050B1A] animate-pulse"></div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-tight gradient-text-full">
                  ProofPass
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-[#0F1E38] border border-[#8B5CF650] text-[#C084FC] rounded-md shadow-sm shadow-[#8B5CF620]">
                  ZK
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-medium tracking-wide">
                Midnight Privacy Layer
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center justify-between">
            <span>Modules</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]"></span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'how-zk-works') {
                    onOpenZkModal();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F1E38] via-[#142749] to-[#0A1428] text-[#22D3EE] border border-[#22D3EE50] shadow-md shadow-[#22D3EE20]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0A1428] border border-transparent'
                }`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-[#4FFFC1] via-[#22D3EE] to-[#8B5CF6] rounded-r-full shadow-sm shadow-[#22D3EE]"></div>
                )}

                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#22D3EE]' : 'text-[#94A3B8] group-hover:text-[#22D3EE]'
                  }`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                  isActive 
                    ? 'bg-[#050B1A] text-[#4FFFC1] border border-[#4FFFC140]' 
                    : 'bg-[#0A1428] text-[#64748B] group-hover:text-[#94A3B8]'
                }`}>
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Midnight Network Status Card */}
      <div className="p-4 border-t border-[#1E2E4A] space-y-3 bg-[#050B1A]/90 backdrop-blur-[6px] relative z-10">
        
        {/* Network Status Card */}
        <div className="p-3 bg-[#0A1428] border border-[#1E2E4A] rounded-2xl shadow-lg space-y-2.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#22D3EE10] to-[#8B5CF610] rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#94A3B8] tracking-wider flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-[#22D3EE] animate-pulse" />
              <span>Midnight Network</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#0F1E38] border border-[#22D3EE40] text-[#22D3EE] rounded-full shadow-sm shadow-[#22D3EE15]">
              {network === 'midnight-preprod' ? 'Preprod' : network === 'midnight-preview' ? 'Preview' : 'Local'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1.5 border-t border-[#1E2E4A]/80">
            <span className="flex items-center space-x-1 text-[#F8FAFC]">
              <Cpu className="w-3 h-3 text-[#8B5CF6]" />
              <span>Compact v0.20</span>
            </span>
            <span className="text-[#4FFFC1] font-mono font-semibold">Sync: 100%</span>
          </div>
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#22D3EE40] rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Reset Demo State</span>
        </button>

      </div>

    </aside>
  );
};
