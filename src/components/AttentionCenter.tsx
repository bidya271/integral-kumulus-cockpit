'use client';

import React from 'react';
import { 
  AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2, 
  Merge, Send, CheckSquare, Zap, ShieldCheck, UserCheck 
} from 'lucide-react';

interface AttentionCenterProps {
  onSelectClaim: (claimId: string) => void;
  isAutohausApproved: boolean;
  isTomClarkeEscalated: boolean;
  isHaftpflichtQuarantined: boolean;
  isDuplicatesMerged: boolean;
  isGlassDispatched: boolean;
  isDekraDispatched: boolean;
  onApproveAutohaus: () => void;
  onEscalateTomClarke: () => void;
  onQuarantineHaftpflicht: () => void;
  onMergeDuplicates: () => void;
  onDispatchGlass: () => void;
  onDispatchDekra: () => void;
}

export const AttentionCenter: React.FC<AttentionCenterProps> = ({
  onSelectClaim,
  isAutohausApproved,
  isTomClarkeEscalated,
  isHaftpflichtQuarantined,
  isDuplicatesMerged,
  isGlassDispatched,
  isDekraDispatched,
  onApproveAutohaus,
  onEscalateTomClarke,
  onQuarantineHaftpflicht,
  onMergeDuplicates,
  onDispatchGlass,
  onDispatchDekra,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Action &amp; Attention Queue</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">High-priority triage to complete before lunch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: THE 2 CRITICAL 1-ON-1 DECISIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* 1. AUTOHAUS BRANDL 12:00 DEADLINE */}
          <div className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            isAutohausApproved
              ? 'bg-slate-900/40 border-slate-800 opacity-60'
              : 'bg-amber-950/20 border-amber-500/40 shadow-xs'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isAutohausApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-white">KS-26-104234</span>
                    <span className="text-[11px] text-amber-400 block font-semibold">Autohaus Brandl 12:00 Deadline</span>
                  </div>
                </div>
                {!isAutohausApproved && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    Expires 12:00
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Estimate <strong>€3,860 net</strong> is under Dekra (€3,910). Reserved repair slot today at 13:00 expires at 12:00 without written approval.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectClaim('KS-26-104234')}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>Inspect</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {isAutohausApproved ? (
                <span className="text-emerald-400 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved &amp; Locked</span>
                </span>
              ) : (
                <button
                  onClick={onApproveAutohaus}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition"
                >
                  1-Click Approve (€3,860)
                </button>
              )}
            </div>
          </div>

          {/* 2. TOM CLARKE MOBILITY OVERAGE */}
          <div className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            isTomClarkeEscalated
              ? 'bg-slate-900/40 border-slate-800 opacity-60'
              : 'bg-rose-950/20 border-rose-500/40 shadow-xs'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isTomClarkeEscalated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-white">KS-26-104413</span>
                    <span className="text-[11px] text-rose-400 block font-semibold">Rule 7 Mobility Limit Breach</span>
                  </div>
                </div>
                {!isTomClarkeEscalated && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                    Illegal Promise
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Customer requested rental extension to July 22 (21 days). Naive AI promised free rental, violating 14-day limit without Team Lead sign-off.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectClaim('KS-26-104413')}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>Inspect Diff</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {isTomClarkeEscalated ? (
                <span className="text-emerald-400 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Escalated to Lead</span>
                </span>
              ) : (
                <button
                  onClick={onEscalateTomClarke}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition"
                >
                  Escalate to Lead
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-CONVICTION BATCH DISPATCHES (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Autonomous Batch Operations</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">198 Claims Eligible</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              
              {/* BATCH 1: DEDUPLICATION */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Merge className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Rule 4 Deduplication</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">21 Pairs</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Auto-merge 42 multi-channel duplicate submissions and silence redundant replies.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">+10.5 hrs</span>
                  <button
                    onClick={onMergeDuplicates}
                    disabled={isDuplicatesMerged}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                      isDuplicatesMerged
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isDuplicatesMerged ? 'Merged' : 'Merge All'}
                  </button>
                </div>
              </div>

              {/* BATCH 2: HAFTPFLICHT HALT */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                      <span>Halt Liability Drafts</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">33 Claims</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Stop false AI promises for policyholders with zero storm coverage.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">+8.25 hrs</span>
                  <button
                    onClick={onQuarantineHaftpflicht}
                    disabled={isHaftpflichtQuarantined}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                      isHaftpflichtQuarantined
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {isHaftpflichtQuarantined ? 'Quarantined' : 'Halt 33 Drafts'}
                  </button>
                </div>
              </div>

              {/* BATCH 3: KLARSICHT GLASS DISPATCH */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Rule 5 Glass Emergency</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">117 Claims</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Send on-site mobile booking links for partner Klarsicht Autoglas.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">+19.5 hrs</span>
                  <button
                    onClick={onDispatchGlass}
                    disabled={isGlassDispatched}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                      isGlassDispatched
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isGlassDispatched ? 'Dispatched' : 'Dispatch Links'}
                  </button>
                </div>
              </div>

              {/* BATCH 4: DEKRA MASS INSPECTION */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                      <span>Rule 6 Dekra Drive-In</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">39 Claims</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Batch schedule drivable hail claims into Munich Mass Drive-In Center.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">+6.5 hrs</span>
                  <button
                    onClick={onDispatchDekra}
                    disabled={isDekraDispatched}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                      isDekraDispatched
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    {isDekraDispatched ? 'Scheduled' : 'Schedule All'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
