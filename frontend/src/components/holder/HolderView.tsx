import React, { useState } from 'react';
import { 
  Wallet, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  Download, 
  EyeOff, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  School, 
  Upload, 
  ArrowRight, 
  Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCredentialStore } from '../../context/CredentialStoreContext';
import { StudentCredential, ZKProofPayload } from '../../lib/types';
import { generateZKStudentProof } from '../../lib/crypto/zkEngine';

interface HolderViewProps {
  onNavigateToVerifierWithProof: (proof: ZKProofPayload) => void;
}

export const HolderView: React.FC<HolderViewProps> = ({ onNavigateToVerifierWithProof }) => {
  const { myCredentials, importCredential } = useCredentialStore();

  const [selectedCredId, setSelectedCredId] = useState<string>(myCredentials[0]?.id || '');
  
  // ZK Proof Options
  const [verifierPurpose, setVerifierPurpose] = useState('Hackathon / Career Fair Verification');
  const [revealDepartment, setRevealDepartment] = useState(false);
  const [revealIssuerName, setRevealIssuerName] = useState(true);
  const [revealGraduationYear, setRevealGraduationYear] = useState(false);

  // Generated Proof State
  const [generatedProof, setGeneratedProof] = useState<ZKProofPayload | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const activeCred = myCredentials.find(c => c.id === selectedCredId) || myCredentials[0];

  const handleGenerateProof = () => {
    if (!activeCred) return;
    setIsGeneratingProof(true);
    setTimeout(() => {
      const proof = generateZKStudentProof(activeCred, verifierPurpose, undefined, {
        revealDepartment,
        revealIssuerName,
        revealGraduationYear
      });
      setGeneratedProof(proof);
      setIsGeneratingProof(false);
    }, 500);
  };

  const handleCopyProof = () => {
    if (!generatedProof) return;
    navigator.clipboard.writeText(JSON.stringify(generatedProof, null, 2));
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  const handleDownloadProof = () => {
    if (!generatedProof) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedProof, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Midnight_ZKProof_${generatedProof.proofId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.commitmentHash || !parsed.studentId) {
        throw new Error('Invalid credential structure');
      }
      importCredential(parsed);
      setSelectedCredId(parsed.id || 'imported-' + Date.now());
      setShowImportModal(false);
      setImportJsonText('');
    } catch (err: any) {
      alert('Failed to parse credential JSON: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importCredential(parsed);
        setSelectedCredId(parsed.id || 'imported-' + Date.now());
        setShowImportModal(false);
      } catch (err: any) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* Top Banner: Student Vault */}
      <div className="glass-card p-6 border border-[#1E2E4A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-[#0F1E38] border border-[#22D3EE40] flex items-center justify-center text-[#22D3EE] shadow-lg shadow-[#22D3EE20]">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-[#F8FAFC]">Student Self-Sovereign Identity Vault</h1>
                <span className="badge-cyan px-2.5 py-0.5 text-[10px] font-semibold rounded-full">
                  Locally Encrypted
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Your credentials and private witness keys stay strictly in your device storage. Zero PII is ever leaked.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#F8FAFC] bg-[#0F1E38] hover:bg-[#142749] border border-[#1E2E4A] hover:border-[#22D3EE40] rounded-xl flex items-center space-x-2 transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Import Credential JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: My Cards on Left, ZK Proof Studio on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left 5 Cols: Credential Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#22D3EE]" />
              <span>Held Credentials ({myCredentials.length})</span>
            </h2>
            <span className="text-[11px] text-[#94A3B8]">Click card to prove</span>
          </div>

          {myCredentials.length === 0 ? (
            <div className="glass-card p-8 text-center text-[#94A3B8] text-xs">
              No credentials held yet. Issue one in the Issuer Portal or import a credential JSON.
            </div>
          ) : (
            <div className="space-y-3">
              {myCredentials.map((cred) => {
                const isSelected = cred.id === (activeCred?.id || selectedCredId);
                const isExpired = cred.expiresAt <= Date.now();
                return (
                  <div
                    key={cred.id}
                    onClick={() => {
                      setSelectedCredId(cred.id);
                      setGeneratedProof(null);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#0A1428] border-[#22D3EE] shadow-lg shadow-[#22D3EE15] ring-1 ring-[#22D3EE40]'
                        : 'bg-[#0A1428]/80 border-[#1E2E4A] hover:border-[#22D3EE40] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-[#0F1E38] border border-[#1E2E4A] flex items-center justify-center text-[#22D3EE]">
                          <School className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#F8FAFC] leading-tight">{cred.issuerName}</h3>
                          <span className="text-[10px] text-[#94A3B8] font-mono">Tier {cred.accreditationTier} Accredited</span>
                        </div>
                      </div>

                      {cred.isRevoked ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40 rounded">
                          REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40 rounded">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="badge-mint px-2 py-0.5 text-[9px] font-bold rounded flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4FFFC1] animate-pulse"></span>
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1E2E4A] space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Student:</span>
                        <span className="font-bold text-[#F8FAFC]">{cred.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Department:</span>
                        <span className="text-[#F8FAFC]">{cred.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Student ID:</span>
                        <span className="font-mono text-[#22D3EE] text-[11px]">{cred.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Valid Until:</span>
                        <span className={`font-medium ${isExpired ? 'text-[#f43f5e]' : 'text-[#4FFFC1]'}`}>
                          {new Date(cred.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1E2E4A]/60 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span className="truncate max-w-[180px]">Comm: {cred.commitmentHash.slice(0, 14)}...</span>
                      <span className="text-[#22D3EE] font-sans font-semibold flex items-center">
                        Select to Prove <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy Box */}
          <div className="glass-panel p-4 text-xs text-[#94A3B8] space-y-2 border border-[#1E2E4A]">
            <div className="flex items-center space-x-2 text-[#F8FAFC] font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Self-Sovereign Witness Principle</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your secret salt (<code className="text-[#22D3EE] font-mono">secretSalt</code>) is stored only on this browser. Midnight Compact circuits verify that your proof was constructed by someone holding this preimage without revealing what it is.
            </p>
          </div>

        </div>

        {/* Right 7 Cols: ZK Proof Generator & QR Code Studio */}
        <div className="lg:col-span-7 space-y-6">
          
          {activeCred ? (
            <div className="glass-card p-6 border border-[#1E2E4A] space-y-6">
              
              <div>
                <h2 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                  <span>Zero-Knowledge Proof Generator</span>
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Configure your selective disclosure policy. Choose what verifiers can see.
                </p>
              </div>

              {/* Proving Subject Card Summary */}
              <div className="glass-panel p-3.5 flex items-center justify-between text-xs border border-[#1E2E4A]">
                <div>
                  <span className="text-[#94A3B8] text-[11px] block">Active Credential Subject:</span>
                  <span className="font-bold text-[#F8FAFC]">{activeCred.studentName} — {activeCred.issuerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#94A3B8] text-[11px] block">Status:</span>
                  <span className="text-[#4FFFC1] font-mono text-[11px]">Enrolled & Accredited</span>
                </div>
              </div>

              {/* Purpose / Nonce */}
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">
                  Verifier Purpose / Event Nonce
                </label>
                <input
                  type="text"
                  value={verifierPurpose}
                  onChange={(e) => setVerifierPurpose(e.target.value)}
                  placeholder="e.g. Midnight Global Hackathon 2026 Student Track"
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              {/* Selective Disclosure Toggles */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider">
                  Selective Disclosure Policy
                </h3>

                {/* Guaranteed Private Predicates */}
                <div className="glass-panel p-3.5 space-y-2 border border-[#1E2E4A]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center text-[#4FFFC1] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#4FFFC1]" />
                      Prove Active Student Standing
                    </span>
                    <span className="badge-mint px-2 py-0.5 text-[10px] font-mono rounded">
                      Zero-Knowledge Predicate
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center text-[#4FFFC1] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#4FFFC1]" />
                      Prove Credential Not Expired
                    </span>
                    <span className="badge-mint px-2 py-0.5 text-[10px] font-mono rounded">
                      Zero-Knowledge Predicate
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1.5 border-t border-[#1E2E4A]">
                    <span className="flex items-center text-[#94A3B8]">
                      <EyeOff className="w-3.5 h-3.5 mr-1.5 text-[#f43f5e]" />
                      Full Name, Student ID, DOB, GPA
                    </span>
                    <span className="text-[10px] font-bold text-[#f43f5e] uppercase">
                      100% Redacted & Hidden
                    </span>
                  </div>
                </div>

                {/* Optional Disclosures */}
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-3 bg-[#050B1A] rounded-xl border border-[#1E2E4A] cursor-pointer hover:border-[#22D3EE40]">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={revealIssuerName}
                        onChange={(e) => setRevealIssuerName(e.target.checked)}
                        className="rounded bg-[#0A1428] border-[#1E2E4A] text-[#22D3EE] focus:ring-0"
                      />
                      <span className="text-[#F8FAFC]">Reveal University Name ({activeCred.issuerName})</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">Optional</span>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#050B1A] rounded-xl border border-[#1E2E4A] cursor-pointer hover:border-[#22D3EE40]">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={revealDepartment}
                        onChange={(e) => setRevealDepartment(e.target.checked)}
                        className="rounded bg-[#0A1428] border-[#1E2E4A] text-[#22D3EE] focus:ring-0"
                      />
                      <span className="text-[#F8FAFC]">Reveal Department ({activeCred.department})</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">Optional</span>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#050B1A] rounded-xl border border-[#1E2E4A] cursor-pointer hover:border-[#22D3EE40]">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={revealGraduationYear}
                        onChange={(e) => setRevealGraduationYear(e.target.checked)}
                        className="rounded bg-[#0A1428] border-[#1E2E4A] text-[#22D3EE] focus:ring-0"
                      />
                      <span className="text-[#F8FAFC]">Reveal Expiration Year ({new Date(activeCred.expiresAt).getFullYear()})</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">Optional</span>
                  </label>
                </div>

              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateProof}
                disabled={isGeneratingProof}
                className="gradient-btn-primary w-full py-3.5 px-5 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isGeneratingProof ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#050B1A] border-t-transparent rounded-full animate-spin"></div>
                    <span>Computing ZK-SNARK Witness & Proof...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#050B1A]" />
                    <span>Generate Midnight Zero-Knowledge Proof</span>
                  </>
                )}
              </button>

              {/* Generated Proof & QR Code Presentation */}
              {generatedProof && (
                <div className="pt-6 border-t border-[#1E2E4A] space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-[#050B1A] rounded-2xl border border-[#22D3EE40]">
                    
                    {/* QR Code */}
                    <div className="p-3 bg-white rounded-xl shadow-2xl shrink-0">
                      <QRCodeSVG
                        value={JSON.stringify(generatedProof)}
                        size={155}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* QR Info & Actions */}
                    <div className="space-y-3 w-full">
                      <div className="flex items-center space-x-2 text-[#22D3EE]">
                        <QrCode className="w-4 h-4" />
                        <span className="text-xs font-bold font-mono">Proof ID: {generatedProof.proofId}</span>
                      </div>
                      
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                        Present this QR code to the verifier camera scanner or share the proof JSON payload.
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCopyProof}
                          className="py-2 px-3 text-xs font-semibold text-[#F8FAFC] bg-[#0F1E38] hover:bg-[#142749] border border-[#1E2E4A] rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#22D3EE]" />
                          <span>{copiedProof ? 'Copied!' : 'Copy JSON'}</span>
                        </button>

                        <button
                          onClick={handleDownloadProof}
                          className="py-2 px-3 text-xs font-semibold text-[#F8FAFC] bg-[#0F1E38] hover:bg-[#142749] border border-[#1E2E4A] rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>Download</span>
                        </button>
                      </div>

                      {/* Instant Bridge Button to Verifier Tab */}
                      <button
                        onClick={() => onNavigateToVerifierWithProof(generatedProof)}
                        className="gradient-btn-primary w-full py-2.5 px-3 text-xs flex items-center justify-center space-x-2"
                      >
                        <span>Test this Proof in Verifier Hub</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#050B1A]" />
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-8 text-center text-[#94A3B8] text-xs">
              Select a credential from the vault on the left to configure your Zero-Knowledge proof.
            </div>
          )}

        </div>

      </div>

      {/* Modal: Import Credential */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-card p-6 border border-[#1E2E4A]">
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Import Verifiable Credential</h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Paste credential JSON or upload a VC JSON file issued by an accredited institution.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-2">Upload File (.json)</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#94A3B8] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0F1E38] file:text-[#22D3EE] hover:file:bg-[#142749] cursor-pointer"
              />
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <textarea
                  rows={6}
                  required
                  placeholder='{ "studentName": "...", "commitmentHash": "0x..." }'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="glass-input w-full p-3 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0F1E38] rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn-primary px-4 py-2 text-xs font-bold"
                >
                  Import to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
