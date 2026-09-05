import React from 'react';
import { X, Shield, Lock, EyeOff, CheckCircle2, FileCode, Key, Building2 } from 'lucide-react';

interface ZkExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZkExplanationModal: React.FC<ZkExplanationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl cyber-card p-6 sm:p-8 my-8 border border-[#24423B]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#91AAA3] hover:text-[#F1FFF9] bg-[#12332D] hover:bg-[#18423a] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#12332D] border border-[#4FFFC140] flex items-center justify-center text-[#4FFFC1] shadow-lg shadow-[#4FFFC115]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F1FFF9] flex items-center space-x-2">
              <span>How Midnight Zero-Knowledge Verification Works</span>
              <span className="cyber-badge-mint px-2 py-0.5 text-[10px] font-mono rounded-full">
                Compact zk-SNARK
              </span>
            </h2>
            <p className="text-xs text-[#91AAA3] mt-0.5">
              Complete privacy: Verify claims without disclosing personal identifying information (PII).
            </p>
          </div>
        </div>

        {/* 3 Step Visual Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          <div className="cyber-panel p-4 space-y-2 border border-[#24423B]">
            <div className="w-8 h-8 rounded-xl bg-[#0D211E] border border-[#28D7C030] flex items-center justify-center text-[#28D7C0]">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#28D7C0] uppercase tracking-wider">1. Issuer (University)</h3>
            <p className="text-xs text-[#91AAA3] leading-relaxed">
              Issues the digital credential to student. Computes a cryptographic commitment:
            </p>
            <code className="block p-2 text-[10px] font-mono bg-[#071311] rounded-lg border border-[#24423B] text-[#4FFFC1] break-all">
              H(studentId || salt || issuerPK || expiry)
            </code>
            <p className="text-[11px] text-[#91AAA3]">
              Only this commitment hash is posted to Midnight ledger. <strong className="text-[#F1FFF9]">Zero PII touches the blockchain.</strong>
            </p>
          </div>

          <div className="cyber-panel p-4 space-y-2 border border-[#24423B]">
            <div className="w-8 h-8 rounded-xl bg-[#0D211E] border border-[#4FFFC130] flex items-center justify-center text-[#4FFFC1]">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#4FFFC1] uppercase tracking-wider">2. Holder (Student)</h3>
            <p className="text-xs text-[#91AAA3] leading-relaxed">
              Stores credential in device vault. When asked for proof, student generates a zk-SNARK proof:
            </p>
            <div className="p-2.5 text-[11px] bg-[#071311] rounded-lg border border-[#24423B] space-y-1">
              <div className="flex items-center text-[#4FFFC1]">
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                <span>"I am an enrolled student"</span>
              </div>
              <div className="flex items-center text-[#4FFFC1]">
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                <span>"Expiry &gt; Today"</span>
              </div>
              <div className="flex items-center text-[#f43f5e]">
                <EyeOff className="w-3 h-3 mr-1.5" />
                <span>Name, ID, DOB 100% hidden</span>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 space-y-2 border border-[#24423B]">
            <div className="w-8 h-8 rounded-xl bg-[#0D211E] border border-[#B7F34A30] flex items-center justify-center text-[#B7F34A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#B7F34A] uppercase tracking-wider">3. Verifier (Partner / Co)</h3>
            <p className="text-xs text-[#91AAA3] leading-relaxed">
              Scans proof QR code. Verifies Compact circuit logic and checks Midnight state:
            </p>
            <div className="p-2.5 text-[11px] bg-[#071311] rounded-lg border border-[#24423B] space-y-1">
              <div className="text-[#F1FFF9]">1. Issuer active on Midnight</div>
              <div className="text-[#F1FFF9]">2. Commitment exists on-chain</div>
              <div className="text-[#F1FFF9]">3. Nullifier fresh (no replay)</div>
            </div>
          </div>

        </div>

        {/* Compact Contract Code Box */}
        <div className="cyber-panel p-4 border border-[#24423B] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-[#4FFFC1]" />
              <span className="text-xs font-semibold text-[#F1FFF9] font-mono">contracts/proofpass.compact</span>
            </div>
            <span className="text-[10px] text-[#91AAA3] font-mono">Midnight zk-Ledger Circuit</span>
          </div>
          <pre className="p-3 bg-[#071311] rounded-xl text-[11px] font-mono text-[#4FFFC1] overflow-x-auto border border-[#24423B]">
{`export circuit verify_student_proof(
  commitment_hash: Bytes<32>,
  proof_nullifier: Bytes<32>,
  current_timestamp: Uint<64>,
  min_accreditation_tier: Uint<8>
): Boolean {
  assert commitments.member(commitment_hash) "Commitment not on-chain";
  assert !revoked_nullifiers.member(proof_nullifier) "Nullifier reused";
  assert metadata.expires_at > current_timestamp "Credential expired";
  assert issuer_info.status == IssuerStatus.ACTIVE "Issuer inactive";
  return true;
}`}
          </pre>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="cyber-button-mint px-6 py-2.5 text-xs font-bold"
          >
            Got It, Let's Build!
          </button>
        </div>

      </div>
    </div>
  );
};
