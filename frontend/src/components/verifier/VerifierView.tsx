import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  QrCode, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  Trash2,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCredentialStore } from '../../context/CredentialStoreContext';
import { useMidnightWallet } from '../../context/MidnightWalletContext';
import { ZKProofPayload, VerificationResult } from '../../lib/types';
import { verifyProof, generateZKStudentProof } from '../../lib/crypto/zkEngine';
import { SAMPLE_CREDENTIALS } from '../../lib/sampleData';

interface VerifierViewProps {
  initialProofToVerify?: ZKProofPayload | null;
}

export const VerifierView: React.FC<VerifierViewProps> = ({ initialProofToVerify }) => {
  const { network } = useMidnightWallet();
  const { 
    registeredIssuers, 
    onChainCommitments, 
    spentNullifiers, 
    verificationHistory, 
    recordVerification,
    clearVerificationHistory,
    myCredentials
  } = useCredentialStore();

  const [proofInputText, setProofInputText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const qrScannerRef = useRef<any>(null);

  useEffect(() => {
    if (initialProofToVerify) {
      setProofInputText(JSON.stringify(initialProofToVerify, null, 2));
      executeVerification(initialProofToVerify);
    }
  }, [initialProofToVerify]);

  const executeVerification = async (proof: ZKProofPayload) => {
    setIsVerifying(true);
    setCurrentResult(null);
    try {
      const result = await verifyProof(
        proof,
        registeredIssuers,
        onChainCommitments,
        spentNullifiers,
        network
      );

      setCurrentResult(result);
      recordVerification(result);

      if (result.status === 'VERIFIED') {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      console.error(err);
      alert('Verification execution error: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofInputText.trim()) return;
    try {
      const parsed: ZKProofPayload = JSON.parse(proofInputText);
      executeVerification(parsed);
    } catch (err: any) {
      alert('Invalid JSON Proof format: ' + err.message);
    }
  };

  const handleLoadSampleProof = (type: 'active' | 'expired' | 'tampered') => {
    if (type === 'active') {
      const cred = myCredentials.find(c => c.expiresAt > Date.now()) || SAMPLE_CREDENTIALS[0];
      const proof = generateZKStudentProof(cred, 'Hackathon Check-in', undefined, { revealIssuerName: true, revealDepartment: true });
      setProofInputText(JSON.stringify(proof, null, 2));
      executeVerification(proof);
    } else if (type === 'expired') {
      const cred = myCredentials.find(c => c.expiresAt <= Date.now()) || SAMPLE_CREDENTIALS[2];
      const proof = generateZKStudentProof(cred, 'Hackathon Check-in', undefined, { revealIssuerName: true });
      setProofInputText(JSON.stringify(proof, null, 2));
      executeVerification(proof);
    } else {
      const cred = SAMPLE_CREDENTIALS[0];
      const proof = generateZKStudentProof(cred, 'Hackathon Check-in');
      proof.publicInputs.commitmentHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
      setProofInputText(JSON.stringify(proof, null, 2));
      executeVerification(proof);
    }
  };

  useEffect(() => {
    let html5QrCode: any = null;

    if (cameraActive) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode('qr-reader');
        qrScannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            try {
              const parsed = JSON.parse(decodedText);
              setProofInputText(decodedText);
              executeVerification(parsed);
              html5QrCode.stop().then(() => setCameraActive(false));
            } catch (e) {
              console.warn('QR code is not a JSON payload');
            }
          },
          () => {}
        ).catch((err: any) => {
          setCameraError('Camera access denied or unavailable: ' + err);
          setCameraActive(false);
        });
      });
    }

    return () => {
      if (qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
        } catch (e) {}
      }
    };
  }, [cameraActive]);

  return (
    <div className="space-y-7 pb-12">
      
      {/* Top Banner: Verifier Hub */}
      <div className="glass-card p-6 border border-[#1E2E4A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-[#0F1E38] border border-[#22D3EE40] flex items-center justify-center text-[#22D3EE] shadow-lg shadow-[#22D3EE20]">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-[#F8FAFC]">Verifier Hub & Inspection Engine</h1>
                <span className="badge-cyan px-2.5 py-0.5 text-[10px] font-semibold rounded-full">
                  Midnight Compact Verified
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Verify student credentials for hackathons, career fairs, or discounts with <strong className="text-[#F8FAFC]">zero personal identity exposure</strong>.
              </p>
            </div>
          </div>

          {/* Quick Test Presets */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLoadSampleProof('active')}
              className="px-3 py-1.5 text-xs font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#22D3EE] border border-[#22D3EE40] rounded-xl transition-all shadow-sm"
            >
              Test Valid Proof
            </button>
            <button
              onClick={() => handleLoadSampleProof('expired')}
              className="px-3 py-1.5 text-xs font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#f59e0b] border border-[#f59e0b40] rounded-xl transition-all shadow-sm"
            >
              Test Expired
            </button>
            <button
              onClick={() => handleLoadSampleProof('tampered')}
              className="px-3 py-1.5 text-xs font-semibold bg-[#0F1E38] hover:bg-[#142749] text-[#f43f5e] border border-[#f43f5e40] rounded-xl transition-all shadow-sm"
            >
              Test Tampered
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: QR Scanner & Verification Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left 5 Cols: QR Camera / Paste Proof */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="glass-card p-6 border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-[#22D3EE]" />
                <span>Scan or Paste Proof</span>
              </h2>

              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  cameraActive 
                    ? 'bg-[#f43f5e] text-white' 
                    : 'bg-[#0F1E38] hover:bg-[#142749] text-[#F8FAFC] border border-[#1E2E4A]'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>{cameraActive ? 'Stop Camera' : 'Live Camera Scan'}</span>
              </button>
            </div>

            {/* Live Camera Scanner Box */}
            {cameraActive && (
              <div className="p-3 bg-[#050B1A] rounded-xl border border-[#22D3EE40] space-y-2">
                <div id="qr-reader" className="w-full overflow-hidden rounded-lg"></div>
                <p className="text-[11px] text-center text-[#22D3EE] font-mono">
                  Align Student QR code in viewfinder
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-2.5 bg-[#f43f5e]/15 border border-[#f43f5e]/40 rounded-lg text-[#f43f5e] text-xs">
                {cameraError}
              </div>
            )}

            <form onSubmit={handleManualVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">
                  Zero-Knowledge Proof Payload (JSON)
                </label>
                <textarea
                  rows={8}
                  required
                  value={proofInputText}
                  onChange={(e) => setProofInputText(e.target.value)}
                  placeholder='Paste ZKProofPayload JSON generated by student holder...'
                  className="glass-input w-full p-3 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="gradient-btn-primary w-full py-3.5 px-4 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#050B1A] border-t-transparent rounded-full animate-spin"></div>
                    <span>Evaluating Compact Verification Circuit...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#050B1A]" />
                    <span>Run Midnight Zero-Knowledge Verification</span>
                  </>
                )}
              </button>
            </form>

          </div>

          <div className="glass-panel p-4 text-xs text-[#94A3B8] space-y-2 border border-[#1E2E4A]">
            <h4 className="font-semibold text-[#F8FAFC] text-xs flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Verifier Privacy Guarantee</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              As a verifier, you only receive mathematical certainty that the prover meets student enrollment & expiration criteria. You do not store or handle user PII.
            </p>
          </div>

        </div>

        {/* Right 7 Cols: Verification Result & Audit Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          
          {currentResult ? (
            <div className="space-y-4">
              
              {/* Verdict Hero Banner */}
              <div className={`p-6 rounded-2xl border transition-all ${
                currentResult.status === 'VERIFIED'
                  ? 'bg-[#0A1428] border-[#22D3EE] shadow-xl shadow-[#22D3EE20]'
                  : currentResult.status === 'EXPIRED'
                  ? 'bg-[#0A1428] border-[#f59e0b] shadow-xl shadow-[#f59e0b15]'
                  : 'bg-[#0A1428] border-[#f43f5e] shadow-xl shadow-[#f43f5e15]'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {currentResult.status === 'VERIFIED' ? (
                      <div className="w-12 h-12 rounded-xl bg-[#0F1E38] border border-[#22D3EE] flex items-center justify-center text-[#22D3EE]">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#0F1E38] border border-[#f43f5e] flex items-center justify-center text-[#f43f5e]">
                        <XCircle className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] block">
                        Midnight Ledger Verdict
                      </span>
                      <h3 className={`text-xl font-black tracking-tight ${
                        currentResult.status === 'VERIFIED' ? 'text-[#22D3EE]' : 'text-[#f43f5e]'
                      }`}>
                        {currentResult.status === 'VERIFIED' && 'VERIFIED ACTIVE STUDENT'}
                        {currentResult.status === 'EXPIRED' && 'CREDENTIAL EXPIRED'}
                        {currentResult.status === 'REVOKED' && 'CREDENTIAL REVOKED'}
                        {currentResult.status === 'INVALID' && 'INVALID PROOF / TAMPERED'}
                        {currentResult.status === 'UNREGISTERED_ISSUER' && 'UNAUTHORIZED ISSUER'}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#94A3B8] block">Execution Time</span>
                    <span className="text-xs font-mono text-[#22D3EE] font-bold">{currentResult.executionTimeMs} ms</span>
                  </div>
                </div>

                {/* Sub-Claims Proven */}
                {currentResult.provenClaims.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1E2E4A] space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#F8FAFC] uppercase tracking-wider block">
                      Cryptographically Proven Attributes:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.provenClaims.map((claim, idx) => (
                        <span key={idx} className="badge-cyan px-2.5 py-1 text-xs font-medium rounded-lg flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-[#22D3EE]" />
                          <span>{claim}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Side-by-Side: Proven in ZK vs Protected / Hidden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left: What Was Verified */}
                <div className="glass-panel p-4 space-y-3 border border-[#22D3EE30]">
                  <div className="flex items-center space-x-2 text-[#22D3EE] font-bold text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified in Zero-Knowledge</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                    <li className="flex items-center text-[#F8FAFC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4FFFC1] mr-2"></span>
                      Valid Enrollment Status: <strong className="text-[#4FFFC1] ml-1">True</strong>
                    </li>
                    <li className="flex items-center text-[#F8FAFC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] mr-2"></span>
                      Not Expired: <strong className="text-[#22D3EE] ml-1">{currentResult.status !== 'EXPIRED' ? 'True' : 'Expired'}</strong>
                    </li>
                    <li className="flex items-center text-[#F8FAFC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mr-2"></span>
                      Accredited Issuer: <strong className="text-[#F8FAFC] ml-1">{currentResult.issuerDetails?.name || 'Accredited'}</strong>
                    </li>
                  </ul>
                </div>

                {/* Right: What Was Kept 100% Private */}
                <div className="glass-panel p-4 space-y-3 border border-[#f43f5e30]">
                  <div className="flex items-center space-x-2 text-[#f43f5e] font-bold text-xs">
                    <EyeOff className="w-4 h-4" />
                    <span>Kept 100% Private & Redacted</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                    <li className="flex items-center">
                      <Lock className="w-3 h-3 text-[#f43f5e] mr-2" />
                      Student Full Name: <span className="text-[#f43f5e] font-mono ml-1">[REDACTED]</span>
                    </li>
                    <li className="flex items-center">
                      <Lock className="w-3 h-3 text-[#f43f5e] mr-2" />
                      Student ID Number: <span className="text-[#f43f5e] font-mono ml-1">[REDACTED]</span>
                    </li>
                    <li className="flex items-center">
                      <Lock className="w-3 h-3 text-[#f43f5e] mr-2" />
                      Date of Birth: <span className="text-[#f43f5e] font-mono ml-1">[REDACTED]</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Step-by-Step Circuit Check Audit */}
              <div className="glass-card p-5 border border-[#1E2E4A] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-[#22D3EE]" />
                    <span>Compact Circuit Verification Steps</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#22D3EE]">Midnight Ledger Checks</span>
                </div>

                <div className="space-y-2">
                  {currentResult.checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-3 flex items-start justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#F8FAFC] flex items-center space-x-1.5">
                          {chk.passed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-[#4FFFC1]" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
                          )}
                          <span>{chk.name}</span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8]">{chk.description}</p>
                        <p className="text-[11px] font-mono text-[#22D3EE]">{chk.detail}</p>
                      </div>

                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        chk.passed ? 'badge-cyan' : 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40'
                      }`}>
                        {chk.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 text-center border border-[#1E2E4A] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1E38] border border-[#1E2E4A] mx-auto flex items-center justify-center text-[#22D3EE]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Awaiting Credential Proof</h3>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                Scan a student QR code with your camera or paste a proof JSON payload to execute zero-knowledge verification on the Midnight network.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Verification History Table */}
      {verificationHistory.length > 0 && (
        <div className="glass-card p-6 border border-[#1E2E4A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#22D3EE]" />
              <span>Recent Verification Audit Trail ({verificationHistory.length})</span>
            </h3>

            <button
              onClick={clearVerificationHistory}
              className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#f43f5e] flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#94A3B8]">
              <thead className="bg-[#050B1A] text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold border-b border-[#1E2E4A]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Proof / Nullifier</th>
                  <th className="py-2.5 px-4">Issuing Authority</th>
                  <th className="py-2.5 px-4">Latency</th>
                  <th className="py-2.5 px-4 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E4A]/60 font-mono">
                {verificationHistory.map((v, i) => (
                  <tr key={i} className="hover:bg-[#0F1E38]/50 transition-colors">
                    <td className="py-2.5 px-4 font-sans text-[#94A3B8] text-[11px]">
                      {new Date(v.verifiedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-[#22D3EE]">
                      {v.proofPayload?.publicInputs?.proofNullifier.slice(0, 16)}...
                    </td>
                    <td className="py-2.5 px-4 font-sans text-[#F8FAFC]">
                      {v.issuerDetails?.name || 'Registered Authority'}
                    </td>
                    <td className="py-2.5 px-4 text-[#94A3B8] text-[11px]">
                      {v.executionTimeMs} ms
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        v.status === 'VERIFIED'
                          ? 'badge-cyan'
                          : 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
