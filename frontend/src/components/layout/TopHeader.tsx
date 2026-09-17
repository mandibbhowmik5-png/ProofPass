import React, { useState } from 'react';
import { 
  Search, 
  Radio, 
  ChevronDown, 
  Sparkles, 
  Wallet, 
  Bell, 
  CheckCircle2 
} from 'lucide-react';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { NetworkType } from '../../lib/types';
import { ConnectWalletButton } from '../wallet/ConnectWalletButton';

interface TopHeaderProps {
  onSearchQuery?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearchQuery }) => {
  const { 
    address, 
    network, 
    setNetwork, 
    isDemoMode,
    toggleDemoMode 
  } = useMidnightWallet();

  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const networks: { id: NetworkType; label: string; tag: string }[] = [
    { id: 'midnight-preprod', label: 'Midnight Preprod', tag: 'Testnet' },
    { id: 'midnight-preview', label: 'Midnight Preview', tag: 'Staging' },
    { id: 'midnight-local', label: 'Midnight Local Devnet', tag: 'Sandbox' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-[#050B1A]/85 backdrop-blur-xl border-b border-[#1E2E4A] px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        
        {/* Top Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search credentials, institutions, commitments, or circuits..."
              className="glass-input w-full pl-10 pr-12 py-2 text-xs placeholder-[#64748B]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 px-1.5 py-0.5 bg-[#0A1428] border border-[#1E2E4A] rounded text-[10px] text-[#94A3B8] font-mono">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Network Selector, Demo Sandbox, Wallet, & Profile Picture Badge */}
        <div className="flex items-center space-x-3">
          
          {/* Network Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-medium text-[#F8FAFC] bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#22D3EE50] rounded-xl transition-all shadow-sm"
            >
              <Radio className="w-3 h-3 text-[#22D3EE] animate-pulse" />
              <span className="hidden sm:inline">
                {network === 'midnight-preprod' ? 'Preprod' : network === 'midnight-preview' ? 'Preview' : 'Local'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {isNetworkDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 py-2 bg-[#0A1428] border border-[#1E2E4A] rounded-2xl shadow-2xl backdrop-blur-xl z-50">
                <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                  Target Midnight Network
                </div>
                {networks.map(net => (
                  <button
                    key={net.id}
                    onClick={() => {
                      setNetwork(net.id);
                      setIsNetworkDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                      network === net.id
                        ? 'bg-[#0F1E38] text-[#22D3EE] border-l-2 border-[#22D3EE]'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1E38]/60'
                    }`}
                  >
                    <span>{net.label}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-[#050B1A] text-[#94A3B8] rounded border border-[#1E2E4A]">
                      {net.tag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Demo Sandbox Button */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isDemoMode
                ? 'bg-[#0F1E38] border-[#8B5CF650] text-[#C084FC] shadow-sm shadow-[#8B5CF620]'
                : 'bg-[#0F1E38] border-[#4FFFC150] text-[#4FFFC1] shadow-sm shadow-[#4FFFC120]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isDemoMode ? 'Demo Sandbox' : 'Live Midnight'}</span>
          </button>

          {/* Prominent Official Midnight Connect Wallet Button */}
          <ConnectWalletButton />

          {/* Notification Bell */}
          <button 
            className="relative p-2 bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#22D3EE50] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
            title="ZK Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22D3EE] rounded-full border-2 border-[#050B1A] animate-pulse"></span>
          </button>

          {/* Top Right Profile Picture / Identity Badge */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2.5 pl-1.5 pr-2.5 py-1 bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#8B5CF650] rounded-xl transition-all group shadow-sm"
            >
              {/* Futuristic Cyber Avatar Picture */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4FFFC1] via-[#22D3EE] via-[#3B82F6] to-[#8B5CF6] p-[1.5px] shadow-sm shadow-[#22D3EE25]">
                  <div className="w-full h-full bg-[#0A1428] rounded-[7px] flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full text-[#22D3EE]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="36" fill="#0A1428"/>
                      <circle cx="18" cy="14" r="6" fill="url(#avatar-grad-m)" />
                      <path d="M7 32C7 26.4772 11.4772 22 17 22H19C24.5228 22 29 26.4772 29 32V34H7V32Z" fill="url(#avatar-grad-m2)" />
                      <circle cx="18" cy="14" r="2.5" fill="#050B1A" />
                      <path d="M14 6L18 2L22 6" stroke="#4FFFC1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="avatar-grad-m" x1="12" y1="8" x2="24" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#4FFFC1"/>
                          <stop offset="0.5" stopColor="#22D3EE"/>
                          <stop offset="1" stopColor="#8B5CF6"/>
                        </linearGradient>
                        <linearGradient id="avatar-grad-m2" x1="7" y1="22" x2="29" y2="34" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#3B82F6"/>
                          <stop offset="1" stopColor="#0F1E38"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                {/* Active Status Badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4FFFC1] rounded-full border-2 border-[#050B1A]"></div>
              </div>

              {/* Text Info */}
              <div className="text-left hidden xl:block">
                <div className="text-[11px] font-bold text-[#F8FAFC] leading-tight flex items-center space-x-1">
                  <span>Dr. Aris Thorne</span>
                  <CheckCircle2 className="w-3 h-3 text-[#22D3EE]" />
                </div>
                <div className="text-[10px] text-[#22D3EE] font-mono leading-tight">
                  MIT Registrar • Tier 1
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 p-3.5 bg-[#0A1428] border border-[#1E2E4A] rounded-2xl shadow-2xl backdrop-blur-xl z-50 text-xs">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#1E2E4A]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4FFFC1] via-[#22D3EE] to-[#8B5CF6] p-[1.5px]">
                    <div className="w-full h-full bg-[#050B1A] rounded-[10px] flex items-center justify-center font-bold text-[#22D3EE]">
                      MIT
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[#F8FAFC]">Dr. Aris Thorne</div>
                    <div className="text-[11px] text-[#94A3B8]">Credential Authority Lead</div>
                    <div className="text-[10px] text-[#22D3EE] font-mono">MIT Registrar Dept</div>
                  </div>
                </div>

                <div className="py-2.5 space-y-1">
                  <div className="p-2.5 rounded-xl bg-[#0F1E38]/70 text-[11px] font-mono text-[#94A3B8]">
                    <span className="text-[#F8FAFC] block font-semibold mb-0.5">Midnight Identity:</span>
                    <span className="text-[#22D3EE] truncate block">{address || 'Not connected'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E2E4A] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>Role: Authority Admin</span>
                  <span className="badge-mint px-2 py-0.5 text-[9px] font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
