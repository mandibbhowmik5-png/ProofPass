import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ZkExplanationModal } from './components/common/ZkExplanationModal';
import { IssuerView } from './components/issuer/IssuerView';
import { HolderView } from './components/holder/HolderView';
import { VerifierView } from './components/verifier/VerifierView';
import { PlaygroundView } from './components/playground/PlaygroundView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { MidnightWalletProvider } from './context/MidnightWalletContext';
import { CredentialStoreProvider } from './context/CredentialStoreContext';
import { ZKProofPayload } from './lib/types';

export function ProofPassDashboard() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('issuer');
  const [isZkModalOpen, setIsZkModalOpen] = useState(false);
  const [proofForVerifier, setProofForVerifier] = useState<ZKProofPayload | null>(null);

  const handleNavigateToVerifier = (proof: ZKProofPayload) => {
    setProofForVerifier(proof);
    setActiveTab('verifier');
  };

  return (
    <div className="min-h-screen bg-[#071311] text-[#F1FFF9] flex selection:bg-[#4FFFC140] selection:text-[#4FFFC1]">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenZkModal={() => setIsZkModalOpen(true)} 
      />

      {/* 2. Main Desktop View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'issuer' && (
            <IssuerView 
              onNavigateToHolder={() => setActiveTab('holder')} 
              onNavigateToVerifier={() => setActiveTab('verifier')}
            />
          )}

          {activeTab === 'holder' && (
            <HolderView 
              onNavigateToVerifierWithProof={handleNavigateToVerifier} 
            />
          )}

          {activeTab === 'verifier' && (
            <VerifierView 
              initialProofToVerify={proofForVerifier} 
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}
        </main>

      </div>

      {/* Zero Knowledge Concept Explainer Modal */}
      <ZkExplanationModal 
        isOpen={isZkModalOpen} 
        onClose={() => setIsZkModalOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <MidnightWalletProvider>
      <CredentialStoreProvider>
        <ProofPassDashboard />
      </CredentialStoreProvider>
    </MidnightWalletProvider>
  );
}
