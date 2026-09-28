import React from 'react';
import { Shield, ShieldAlert, CheckCircle2, Lock, Terminal, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface PolicyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyNoticeModal: React.FC<PolicyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Architecture &amp; Policy Compliance</h2>
              <p className="text-xs text-slate-400 font-mono">Safety, Anti-Bot &amp; Steamworks Best Practices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 bg-cyan-950/40 border border-cyan-700/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Compliant Assisted Automation vs. Headless Botting</span>
            </div>
            <p>
              Under Valve's Steam Subscriber Agreement and global anti-fraud policies, attempting automated bot signups with headless browser stealth scripts to circumvent CAPTCHAs and Cloudflare protection leads to immediate IP subnet blacklisting, account revocation, and safety filter blocks.
            </p>
            <p>
              This application implements the <b>Assisted Provisioning Pattern</b>: it automates high-entropy credential generation, zero-phone email aliasing (<code className="text-cyan-300">100+top_paid-X@...</code>), library allocations, and client distribution handoffs, while keeping user-initiated verification safe, reliable, and compliant.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Core Architectural Pillars of this Platform:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No-Phone Requirement</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Configured around private email aliases (Proton, Tuta, Duck) that do not mandate phone numbers, allowing multiple anonymous giveaway profiles.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Native Protocol Installation</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Dispatches <code className="text-cyan-300">steam://install/&lt;AppID&gt;</code> commands directly to the user's desktop client without requiring risky third-party DLL injections.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Clean Vault &amp; Handoff Format</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  One-click export formatting for client handoff packages, containing credentials, game lists, and instructions.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cloud Save Preservation</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Independent multi-title cloud save backup storage with SHA-256 integrity verification, independent of VAC or game bans.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow transition"
          >
            Understood &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
