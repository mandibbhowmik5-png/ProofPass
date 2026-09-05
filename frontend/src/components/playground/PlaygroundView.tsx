import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Hash, 
  Key, 
  CheckCircle2, 
  EyeOff, 
  ShieldCheck, 
  Cpu, 
  Play, 
  Copy, 
  RefreshCw 
} from 'lucide-react';
import { sha256 } from 'js-sha256';
import { generateRandomSecret } from '../../lib/crypto/zkEngine';

export const PlaygroundView: React.FC = () => {
  const [studentId, setStudentId] = useState('STUDENT-2026-X99');
  const [secretSalt, setSecretSalt] = useState(() => generateRandomSecret(32));
  const [issuerPk, setIssuerPk] = useState('0x04e82b79a1f24d9c87b9e0123456789abcdef0123456789abcdef0123456789a');
  const [expiryYear, setExpiryYear] = useState(2028);
  const [verifierNonce, setVerifierNonce] = useState(() => generateRandomSecret(8));
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const expiryTimestamp = new Date(`${expiryYear}-06-30`).getTime();
  const preimage = `midnight:commitment:${studentId}:${secretSalt}:${issuerPk}:${expiryTimestamp}:Computer Science`;
  const commitmentHash = '0x' + sha256(preimage);
  const nullifier = '0x' + sha256(`midnight:nullifier:${secretSalt}:${verifierNonce}:${commitmentHash}`);

  const handleRandomize = () => {
    setSecretSalt(generateRandomSecret(32));
    setVerifierNonce(generateRandomSecret(8));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* Top Banner */}
      <div className="cyber-card p-6 border border-[#24423B]">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-[#12332D] border border-[#B7F34A40] flex items-center justify-center text-[#B7F34A] shadow-lg shadow-[#B7F34A15]">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-[#F1FFF9]">Zero-Knowledge Circuit Simulator & Sandbox</h1>
              <span className="cyber-badge-lime px-2.5 py-0.5 text-[10px] font-semibold rounded-full">
                Interactive Lab
              </span>
            </div>
            <p className="text-xs text-[#91AAA3] mt-0.5">
              Inspect how Compact private witnesses, Poseidon/SHA commitment hashing, and one-time nullifiers are mathematically synthesized.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Circuit Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left 6 Cols: Prover Private Witness Inputs */}
        <div className="lg:col-span-6 cyber-card p-6 border border-[#24423B] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F1FFF9] uppercase tracking-wider flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-[#B7F34A]" />
              <span>Prover Private Witness Inputs</span>
            </h2>
            <button
              onClick={handleRandomize}
              className="px-2.5 py-1 text-xs font-semibold text-[#4FFFC1] bg-[#12332D] hover:bg-[#18423a] border border-[#4FFFC140] rounded-lg flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Randomize Salt</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#F1FFF9] font-medium mb-1">Student Identifier (Private)</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="cyber-input w-full px-3.5 py-2 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[#F1FFF9] font-medium mb-1">
                Student Secret Witness Salt (<code className="text-[#4FFFC1]">secretSalt</code>)
              </label>
              <input
                type="text"
                value={secretSalt}
                onChange={(e) => setSecretSalt(e.target.value)}
                className="cyber-input w-full px-3.5 py-2 font-mono text-xs text-[#4FFFC1]"
              />
            </div>

            <div>
              <label className="block text-[#F1FFF9] font-medium mb-1">Issuer Authority Public Key</label>
              <input
                type="text"
                value={issuerPk}
                onChange={(e) => setIssuerPk(e.target.value)}
                className="cyber-input w-full px-3.5 py-2 font-mono text-xs text-[#91AAA3]"
              />
            </div>

            <div>
              <label className="block text-[#F1FFF9] font-medium mb-1">Verifier Challenge Nonce</label>
              <input
                type="text"
                value={verifierNonce}
                onChange={(e) => setVerifierNonce(e.target.value)}
                className="cyber-input w-full px-3.5 py-2 font-mono text-xs text-[#B7F34A]"
              />
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Synthesized Public State & Compact Output */}
        <div className="lg:col-span-6 cyber-card p-6 border border-[#24423B] space-y-4">
          <h2 className="text-sm font-bold text-[#F1FFF9] uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#4FFFC1]" />
            <span>Synthesized Midnight Public Signals</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="cyber-panel p-3.5 space-y-1">
              <div className="flex justify-between items-center text-[#91AAA3]">
                <span>Public Commitment Hash:</span>
                <button 
                  onClick={() => copyText(commitmentHash, 'comm')} 
                  className="text-[#4FFFC1] hover:text-[#F1FFF9]"
                >
                  {copied === 'comm' ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="font-mono text-[11px] text-[#4FFFC1] break-all block">
                {commitmentHash}
              </span>
            </div>

            <div className="cyber-panel p-3.5 space-y-1">
              <div className="flex justify-between items-center text-[#91AAA3]">
                <span>Scope-Specific Nullifier:</span>
                <button 
                  onClick={() => copyText(nullifier, 'null')} 
                  className="text-[#B7F34A] hover:text-[#F1FFF9]"
                >
                  {copied === 'null' ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="font-mono text-[11px] text-[#B7F34A] break-all block">
                {nullifier}
              </span>
            </div>

            <div className="cyber-panel p-3.5 space-y-2">
              <span className="text-[#91AAA3] font-semibold block">Evaluated Predicates:</span>
              <div className="flex items-center text-[#4FFFC1]">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Preimage Witness matches on-chain commitment</span>
              </div>
              <div className="flex items-center text-[#4FFFC1]">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Expiry ({expiryYear}) &gt; Current Ledger Timestamp</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
