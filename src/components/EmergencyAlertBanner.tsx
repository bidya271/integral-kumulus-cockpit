'use client';

import React from 'react';
import { AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EmergencyAlertBannerProps {
  onSelectClaim: (claimId: string) => void;
  isAutohausApproved: boolean;
  isTomClarkeEscalated: boolean;
  isHaftpflichtQuarantined: boolean;
  onApproveAutohaus: () => void;
  onEscalateTomClarke: () => void;
  onQuarantineHaftpflicht: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  onSelectClaim,
  isAutohausApproved,
  isTomClarkeEscalated,
  isHaftpflichtQuarantined,
  onApproveAutohaus,
  onEscalateTomClarke,
  onQuarantineHaftpflicht,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Priority Triage & Regulatory Landmines Detected (Morning Kickoff)</span>
        </h2>
        <span className="text-xs text-slate-400">Must be handled before standard batch dispatch</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* CARD 1: AUTOHAUS BRANDL 12:00 DEADLINE */}
        <div className={`p-4 rounded-xl border transition ${
          isAutohausApproved
            ? 'bg-slate-900/60 border-slate-800 opacity-60'
            : 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${isAutohausApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {isAutohausApproved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-200">KS-26-104234</span>
                <span className="text-[11px] text-amber-400 block font-semibold">12:00 PM Workshop Deadline</span>
              </div>
            </div>
            {!isAutohausApproved && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
                4h Remaining
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Autohaus Brandl submitted KVA <code className="text-white">€3,860 net</code> (below Dekra €3,910). Reserved repair slot today at 13:00 expires at 12:00 PM.
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onSelectClaim('KS-26-104234')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition"
            >
              <span>Inspect Claim</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {isAutohausApproved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approval Sent</span>
              </span>
            ) : (
              <button
                onClick={onApproveAutohaus}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                1-Click Approve
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: TOM CLARKE MOBILITY BREACH */}
        <div className={`p-4 rounded-xl border transition ${
          isTomClarkeEscalated
            ? 'bg-slate-900/60 border-slate-800 opacity-60'
            : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${isTomClarkeEscalated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isTomClarkeEscalated ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-200">KS-26-104413</span>
                <span className="text-[11px] text-rose-400 block font-semibold">Rule 7: Mobility Limit &gt;14d</span>
              </div>
            </div>
            {!isTomClarkeEscalated && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded uppercase">
                AI Violation
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Customer requested rental through July 22 (21 days). Naive AI drafted illegal promise of free rental without Team Lead sign-off.
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onSelectClaim('KS-26-104413')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition"
            >
              <span>Inspect Diff</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {isTomClarkeEscalated ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Escalated to Lead</span>
              </span>
            ) : (
              <button
                onClick={onEscalateTomClarke}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Escalate to Lead
              </button>
            )}
          </div>
        </div>

        {/* CARD 3: 33 HAFTPFLICHT HALLUCINATIONS */}
        <div className={`p-4 rounded-xl border transition ${
          isHaftpflichtQuarantined
            ? 'bg-slate-900/60 border-slate-800 opacity-60'
            : 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-500/5'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${isHaftpflichtQuarantined ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isHaftpflichtQuarantined ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-200">33 Hail Claims</span>
                <span className="text-[11px] text-red-400 block font-semibold">Liability-Only (Haftpflicht)</span>
              </div>
            </div>
            {!isHaftpflichtQuarantined && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 rounded uppercase">
                Legal Hazard
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Hail is NOT covered under Haftpflicht. Naive AI drafted: <em>“Good news: hail damage is covered...”</em> Halting drafts prevents legal liability.
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Rule 1 Protected</span>

            {isHaftpflichtQuarantined ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>33 Drafts Halted</span>
              </span>
            ) : (
              <button
                onClick={onQuarantineHaftpflicht}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Halt 33 Drafts
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
