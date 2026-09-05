import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  FileCheck, 
  CheckCircle2, 
  Copy, 
  Download, 
  Sparkles, 
  Hash, 
  ChevronRight, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Shield 
} from 'lucide-react';
import { useCredentialStore } from '../../context/CredentialStoreContext';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { AccreditationTier, StudentCredential } from '../../lib/types';

interface IssuerViewProps {
  onNavigateToHolder: () => void;
  onNavigateToVerifier?: () => void;
}

export const IssuerView: React.FC<IssuerViewProps> = ({ onNavigateToHolder, onNavigateToVerifier }) => {
  const { network } = useMidnightWallet();
  const { 
    issuedCredentials, 
    registeredIssuers, 
    issueNewCredential, 
    revokeCredential, 
    registerNewIssuer 
  } = useCredentialStore();

  const issuersList = Object.values(registeredIssuers);
  const [selectedIssuerId, setSelectedIssuerId] = useState<string>(issuersList[0]?.id || 'org-mit');

  // Form State
  const [studentName, setStudentName] = useState('Elena Rostova');
  const [studentId, setStudentId] = useState('MIT-CS-2025-4109');
  const [studentEmail, setStudentEmail] = useState('elena.r@mit.edu');
  const [dateOfBirth, setDateOfBirth] = useState('2003-08-19');
  const [department, setDepartment] = useState('Computer Science & Artificial Intelligence');
  const [degree, setDegree] = useState('Bachelor of Science (B.S.)');
  const [gpa, setGpa] = useState('3.95');
  const [expiryYears, setExpiryYears] = useState(2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastIssuedCred, setLastIssuedCred] = useState<StudentCredential | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Issuer Modal
  const [showNewIssuerModal, setShowNewIssuerModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgTier, setNewOrgTier] = useState<AccreditationTier>(1);
  const [newOrgCountry, setNewOrgCountry] = useState('United States');

  const selectedIssuer = issuersList.find(i => i.id === selectedIssuerId) || issuersList[0];

  const handleApplyPreset = (type: 'cs' | 'ee' | 'med') => {
    if (type === 'cs') {
      setStudentName('Lucas Chen');
      setStudentId('STAN-CS-2024-8831');
      setStudentEmail('lchen@stanford.edu');
      setDateOfBirth('2003-02-11');
      setDepartment('Computer Science');
      setDegree('Bachelor of Science (B.S.)');
      setGpa('3.91');
      setExpiryYears(3);
    } else if (type === 'ee') {
      setStudentName('Sarah Jenkins');
      setStudentId('MIT-EE-2023-5521');
      setStudentEmail('sjenkins@mit.edu');
      setDateOfBirth('2001-09-30');
      setDepartment('Electrical Engineering');
      setDegree('Master of Engineering (M.Eng)');
      setGpa('3.87');
      setExpiryYears(1);
    } else {
      setStudentName('Devon Marcus');
      setStudentId('CAM-BIO-2024-1104');
      setStudentEmail('d.marcus@cam.ac.uk');
      setDateOfBirth('2002-12-05');
      setDepartment('Biomedical Sciences');
      setDegree('Bachelor of Medicine (MB)');
      setGpa('3.98');
      setExpiryYears(2);
    }
  };

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const expiresAt = Date.now() + expiryYears * 365 * 24 * 60 * 60 * 1000;
      const cred = await issueNewCredential({
        studentName,
        studentId,
        studentEmail,
        dateOfBirth,
        department,
        degree,
        gpa,
        expiresAt,
        issuerOrgId: selectedIssuer.id
      });
      setLastIssuedCred(cred);
    } catch (err) {
      console.error(err);
      alert('Failed to issue credential on Midnight network');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgDomain) return;
    try {
      const issuer = await registerNewIssuer(newOrgName, newOrgDomain, newOrgTier, newOrgCountry);
      setSelectedIssuerId(issuer.id);
      setShowNewIssuerModal(false);
      setNewOrgName('');
      setNewOrgDomain('');
    } catch (err) {
      console.error(err);
      alert('Failed to register issuer on Midnight');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const downloadCredentialJson = (cred: StudentCredential) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cred, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ProofPass_VC_${cred.studentId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* 1. Gradient Lifecycle Banner with 3D Artwork */}
      <div className="glass-card p-6 relative overflow-hidden bg-[#0A1428] border border-[#1E2E4A]">
        {/* Abstract 3D Futuristic Crypto Artwork positioned on right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-85 mix-blend-screen hidden md:block">
          <img 
            src="/assets/zk_midnight_crypto_hero.jpg" 
            alt="Midnight ZK 3D Artwork" 
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1428] via-[#0A1428]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="flex items-start space-x-4 max-w-xl">
            <div className="w-11 h-11 rounded-2xl bg-[#0F1E38] border border-[#22D3EE50] flex items-center justify-center text-[#22D3EE] shrink-0 shadow-lg shadow-[#22D3EE25]">
              <Sparkles className="w-5 h-5 text-[#22D3EE] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-[#F8FAFC]">
                  Interactive Midnight Credential Lifecycle
                </h2>
                <span className="badge-mint px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full">
                  ZK Active
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Self-sovereign cryptographic workflow: Issue commitment on Midnight → Student generates selective-disclosure ZK Proof → Enterprise Verification without PII.
              </p>
            </div>
          </div>

          {/* 3 Step Interactive Process Pills */}
          <div className="flex items-center space-x-2 shrink-0 bg-[#050B1A]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#1E2E4A]">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0F1E38] to-[#142749] border border-[#22D3EE60] text-[#22D3EE] text-xs font-semibold rounded-xl shadow-sm shadow-[#22D3EE20]">
              <span className="w-4 h-4 rounded-full bg-[#22D3EE] text-[#050B1A] text-[10px] font-bold flex items-center justify-center">1</span>
              <span>Issue</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />

            <button
              onClick={onNavigateToHolder}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#8B5CF650] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium rounded-xl transition-all"
            >
              <span className="w-4 h-4 rounded-full bg-[#1E2E4A] text-[#94A3B8] text-[10px] font-bold flex items-center justify-center">2</span>
              <span>Generate Proof</span>
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />

            <button
              onClick={() => onNavigateToVerifier && onNavigateToVerifier()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A1428] hover:bg-[#0F1E38] border border-[#1E2E4A] hover:border-[#8B5CF650] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium rounded-xl transition-all"
            >
              <span className="w-4 h-4 rounded-full bg-[#1E2E4A] text-[#94A3B8] text-[10px] font-bold flex items-center justify-center">3</span>
              <span>Verify</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. University Credential Issuer Authority Card */}
      <div className="glass-card p-6 border border-[#1E2E4A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-[#0F1E38] border border-[#8B5CF640] flex items-center justify-center text-[#8B5CF6] shadow-lg shadow-[#8B5CF620]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-[#F8FAFC]">University Credential Issuer Authority</h1>
                <span className="badge-cyan px-2.5 py-0.5 text-[10px] font-semibold rounded-full">
                  Midnight Compact Verified
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Active Organization: <span className="text-[#F8FAFC] font-medium">{selectedIssuer.name}</span> ({selectedIssuer.domain})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Institution Selector */}
            <select
              value={selectedIssuerId}
              onChange={(e) => setSelectedIssuerId(e.target.value)}
              className="glass-input px-3.5 py-2 text-xs text-[#F8FAFC] font-medium"
            >
              {issuersList.map(i => (
                <option key={i.id} value={i.id} className="bg-[#0A1428] text-[#F8FAFC]">
                  {i.name} (Tier {i.accreditationTier})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowNewIssuerModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#22D3EE] bg-[#0F1E38] hover:bg-[#142749] border border-[#22D3EE40] rounded-xl flex items-center space-x-1.5 transition-all shadow-sm shadow-[#22D3EE15]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register University</span>
            </button>

            {/* University Crest / ZK Seal Graphic */}
            <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-[#050B1A] border border-[#8B5CF640] shadow-sm shadow-[#8B5CF620] p-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#22D3EE15] to-[#8B5CF620]"></div>
              <svg className="w-full h-full text-[#8B5CF6] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#22D3EE" fillOpacity="0.2"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <circle cx="12" cy="12" r="2" fill="#4FFFC1" />
              </svg>
            </div>
          </div>

        </div>

        {/* Authority State Pills */}
        <div className="mt-5 pt-4 border-t border-[#1E2E4A] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="glass-panel p-3">
            <span className="text-[#94A3B8] text-[11px] block">Issuer Midnight Public Key</span>
            <span className="font-mono text-[11px] text-[#22D3EE] truncate block mt-0.5">
              {selectedIssuer.publicKey}
            </span>
          </div>
          <div className="glass-panel p-3">
            <span className="text-[#94A3B8] text-[11px] block">Accreditation Tier</span>
            <span className="font-medium text-[#F8FAFC] block mt-0.5">
              Tier {selectedIssuer.accreditationTier} (National Regional Accreditation)
            </span>
          </div>
          <div className="glass-panel p-3">
            <span className="text-[#94A3B8] text-[11px] block">Midnight Compact Circuit</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#4FFFC1] animate-pulse"></span>
              <span className="font-mono text-[#4FFFC1] text-[11px]">issue_credential() [Active]</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Grid: Large Issuance Form & Elegant Informational Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left 7 Cols: Large Issue Verifiable Student Credential Form */}
        <div className="lg:col-span-7 glass-card p-6 border border-[#1E2E4A]">
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
                <FileCheck className="w-4.5 h-4.5 text-[#22D3EE]" />
                <span>Issue Verifiable Student Credential</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Issue a signed student credential. Only the cryptographic commitment hash is posted to Midnight.
              </p>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-[#94A3B8] mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('cs')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#22D3EE] rounded-lg border border-[#1E2E4A] hover:border-[#22D3EE50] transition-all"
              >
                CS
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('ee')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#22D3EE] rounded-lg border border-[#1E2E4A] hover:border-[#22D3EE50] transition-all"
              >
                EE
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('med')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#22D3EE] rounded-lg border border-[#1E2E4A] hover:border-[#22D3EE50] transition-all"
              >
                BioMed
              </button>
            </div>
          </div>

          <form onSubmit={handleIssueCredential} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="glass-input w-full px-3.5 py-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Student ID / Roll Number</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. MIT-CS-2025-4109"
                  className="glass-input w-full px-3.5 py-2.5 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">University Email</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Department / Major</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Degree Program</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">
                  Cumulative GPA <span className="text-[10px] text-[#4FFFC1] font-normal">(Private)</span>
                </label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g. 3.95"
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">Credential Expiry Period</label>
                <select
                  value={expiryYears}
                  onChange={(e) => setExpiryYears(Number(e.target.value))}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                >
                  <option value={1} className="bg-[#0A1428]">1 Year (Expires in {new Date().getFullYear() + 1})</option>
                  <option value={2} className="bg-[#0A1428]">2 Years (Expires in {new Date().getFullYear() + 2})</option>
                  <option value={3} className="bg-[#0A1428]">3 Years (Expires in {new Date().getFullYear() + 3})</option>
                  <option value={4} className="bg-[#0A1428]">4 Years (Expires in {new Date().getFullYear() + 4})</option>
                </select>
              </div>
            </div>

            {/* Privacy Invariant Banner */}
            <div className="glass-panel p-3.5 flex items-start space-x-3 text-xs text-[#94A3B8]">
              <Lock className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#F8FAFC]">Zero PII on Midnight:</strong> Student Name, Student ID, DOB, and GPA are hashed into a 32-byte cryptographic commitment preimage. No raw PII is ever exposed publicly on-chain.
              </span>
            </div>

            {/* Gradient Primary Button (Mint -> Cyan -> Blue -> Violet) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-btn-primary w-full py-3.5 px-5 text-xs flex items-center justify-center space-x-2 mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#050B1A] border-t-transparent rounded-full animate-spin"></div>
                  <span>Computing Witness & Posting to Midnight Ledger...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#050B1A]" />
                  <span>Issue Verifiable Student Credential & Post to Midnight</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right 5 Cols: Informational Cards & Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Live Issued Credential Preview */}
          {lastIssuedCred ? (
            <div className="glass-card-glow p-5 space-y-3.5">
              <div className="flex items-center space-x-2 text-[#4FFFC1]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Credential Issued Successfully!</span>
              </div>

              <div className="glass-panel p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Student Subject:</span>
                  <span className="font-bold text-[#F8FAFC]">{lastIssuedCred.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Student ID:</span>
                  <span className="font-mono text-[#22D3EE]">{lastIssuedCred.studentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Department:</span>
                  <span className="text-[#F8FAFC]">{lastIssuedCred.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Valid Until:</span>
                  <span className="text-[#4FFFC1] font-medium">
                    {new Date(lastIssuedCred.expiresAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1E2E4A]">
                  <span className="text-[10px] text-[#94A3B8] block mb-1">On-Chain Commitment Hash:</span>
                  <div className="flex items-center justify-between p-1.5 bg-[#050B1A] rounded-lg border border-[#1E2E4A] font-mono text-[10px] text-[#22D3EE]">
                    <span className="truncate">{lastIssuedCred.commitmentHash}</span>
                    <button 
                      onClick={() => copyToClipboard(lastIssuedCred.commitmentHash, 'last-comm')}
                      className="ml-2 text-[#94A3B8] hover:text-[#F8FAFC]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => downloadCredentialJson(lastIssuedCred)}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#F8FAFC] bg-[#0F1E38] hover:bg-[#142749] border border-[#1E2E4A] rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Download VC JSON</span>
                </button>

                <button
                  onClick={onNavigateToHolder}
                  className="gradient-btn-primary w-full py-2 px-3 text-xs flex items-center justify-center space-x-1"
                >
                  <span>Student Vault</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#050B1A]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#22D3EE]">
                <ShieldCheck className="w-4.5 h-4.5" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Digital Credential Architecture</h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                When an institution issues a credential, Midnight records a 32-byte Poseidon/SHA commitment on the public ledger. The private student attributes stay exclusively in the student's encrypted device vault.
              </p>
            </div>
          )}

          {/* Card 2: Zero-Knowledge Privacy Guarantees */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#8B5CF6]">
              <Lock className="w-4 h-4" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Zero-Knowledge Privacy Invariant
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4FFFC1] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#F8FAFC]">Witness Confidentiality:</strong> The secret salt (<code className="text-[#4FFFC1] font-mono">secretSalt</code>) never touches any server.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#F8FAFC]">Selective Disclosure:</strong> Students can mathematically prove active enrollment while completely hiding their full name and student ID.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#F8FAFC]">Replay Protection:</strong> Proof nullifiers prevent double-spending or unauthorized proof recycling.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Midnight Compact Circuit Status */}
          <div className="glass-panel p-4 space-y-2 border border-[#1E2E4A]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F8FAFC] flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>ProofPass Compact Circuit</span>
              </span>
              <span className="badge-violet px-2 py-0.5 text-[9px] font-mono rounded">
                v0.20
              </span>
            </div>
            <code className="block p-2 bg-[#050B1A] rounded-lg border border-[#1E2E4A] font-mono text-[10px] text-[#22D3EE] overflow-x-auto">
              circuit issue_credential(commitment_hash, issuer_pk, issued_at, expires_at)
            </code>
          </div>

        </div>

      </div>

      {/* 4. Four Bottom Statistic Cards with Colorful Gradient Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Mint Highlight */}
        <div className="glass-card p-5 border border-[#1E2E4A] relative overflow-hidden group hover:border-[#4FFFC150]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#4FFFC110] rounded-full blur-xl group-hover:bg-[#4FFFC120] transition-colors"></div>
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold">
            <span>Credentials Issued</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F1E38] flex items-center justify-center text-[#4FFFC1]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#F8FAFC]">1,428</span>
            <span className="text-[11px] font-semibold text-[#4FFFC1] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14%
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">Recorded on Midnight Ledger</p>
        </div>

        {/* Stat 2: Cyan Highlight */}
        <div className="glass-card p-5 border border-[#1E2E4A] relative overflow-hidden group hover:border-[#22D3EE50]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#22D3EE10] rounded-full blur-xl group-hover:bg-[#22D3EE20] transition-colors"></div>
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold">
            <span>Partner Universities</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F1E38] flex items-center justify-center text-[#22D3EE]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#F8FAFC]">42</span>
            <span className="text-[11px] font-semibold text-[#22D3EE]">Global</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">Accredited Tier 1-3 Authorities</p>
        </div>

        {/* Stat 3: Violet Highlight */}
        <div className="glass-card p-5 border border-[#1E2E4A] relative overflow-hidden group hover:border-[#8B5CF650]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF610] rounded-full blur-xl group-hover:bg-[#8B5CF620] transition-colors"></div>
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold">
            <span>Privacy Preserving</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F1E38] flex items-center justify-center text-[#8B5CF6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#F8FAFC]">100%</span>
            <span className="text-[11px] font-semibold text-[#8B5CF6]">Zero PII</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">SNARK Witness Isolation</p>
        </div>

        {/* Stat 4: Electric Blue Highlight */}
        <div className="glass-card p-5 border border-[#1E2E4A] relative overflow-hidden group hover:border-[#3B82F650]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#3B82F610] rounded-full blur-xl group-hover:bg-[#3B82F620] transition-colors"></div>
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold">
            <span>On-Chain Verification</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F1E38] flex items-center justify-center text-[#3B82F6]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#F8FAFC]">&lt; 240ms</span>
            <span className="text-[11px] font-semibold text-[#3B82F6]">Compact</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">Real-time ZK Evaluation</p>
        </div>

      </div>

      {/* 5. Bottom Table: Issued Credentials on Midnight Ledger */}
      <div className="glass-card p-6 border border-[#1E2E4A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
              <Hash className="w-4 h-4 text-[#22D3EE]" />
              <span>Issued Credentials & On-Chain Commitments ({issuedCredentials.length})</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Live registry of credentials issued under Midnight ledger contracts.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Network: <span className="text-[#22D3EE] font-semibold">{network}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#94A3B8]">
            <thead className="bg-[#050B1A] text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold border-b border-[#1E2E4A]">
              <tr>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">University</th>
                <th className="py-3 px-4">Commitment Hash (On-Chain)</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]/60 font-mono">
              {issuedCredentials.map((cred) => {
                const isExpired = cred.expiresAt <= Date.now();
                return (
                  <tr key={cred.id} className="hover:bg-[#0F1E38]/50 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-[#F8FAFC]">{cred.studentName}</div>
                      <div className="text-[11px] font-mono text-[#22D3EE]">{cred.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-[#F8FAFC]">
                      <div>{cred.issuerName}</div>
                      <div className="text-[10px] text-[#94A3B8]">Tier {cred.accreditationTier}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[#F8FAFC]">{cred.commitmentHash.slice(0, 10)}...{cred.commitmentHash.slice(-8)}</span>
                        <button
                          onClick={() => copyToClipboard(cred.commitmentHash, cred.id)}
                          className="text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
                          title="Copy commitment hash"
                        >
                          {copiedHash === cred.id ? <CheckCircle2 className="w-3 h-3 text-[#4FFFC1]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={isExpired ? 'text-[#f43f5e]' : 'text-[#F8FAFC]'}>
                        {new Date(cred.expiresAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {cred.isRevoked ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40 rounded-md">
                          REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40 rounded-md">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="badge-mint px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center space-x-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4FFFC1] animate-pulse"></span>
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans space-x-2">
                      <button
                        onClick={() => downloadCredentialJson(cred)}
                        className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"
                        title="Download Verifiable Credential JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {!cred.isRevoked && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Revoke credential for ${cred.studentName}?`)) {
                              revokeCredential(cred.commitmentHash);
                            }
                          }}
                          className="text-[#f43f5e] hover:text-[#fb7185] text-[11px] underline"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New University */}
      {showNewIssuerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-card p-6 border border-[#1E2E4A]">
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Register New Institution Authority</h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Registers an accredited college/organization on the Midnight smart contract registry.
            </p>

            <form onSubmit={handleRegisterIssuer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-medium mb-1.5">Institution Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford University"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-medium mb-1.5">Official Domain</label>
                <input
                  type="text"
                  required
                  placeholder="ox.ac.uk"
                  value={newOrgDomain}
                  onChange={(e) => setNewOrgDomain(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F8FAFC] font-medium mb-1.5">Accreditation Tier</label>
                  <select
                    value={newOrgTier}
                    onChange={(e) => setNewOrgTier(Number(e.target.value) as AccreditationTier)}
                    className="glass-input w-full px-3.5 py-2.5 text-xs"
                  >
                    <option value={1} className="bg-[#0A1428]">Tier 1 (National/Global)</option>
                    <option value={2} className="bg-[#0A1428]">Tier 2 (Regional College)</option>
                    <option value={3} className="bg-[#0A1428]">Tier 3 (Accredited Bootcamp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-medium mb-1.5">Country</label>
                  <input
                    type="text"
                    value={newOrgCountry}
                    onChange={(e) => setNewOrgCountry(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewIssuerModal(false)}
                  className="px-4 py-2 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0F1E38] rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn-primary px-4 py-2 text-xs font-bold"
                >
                  Register on Midnight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
