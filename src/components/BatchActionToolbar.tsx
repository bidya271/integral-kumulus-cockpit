'use client';

import React from 'react';
import { Merge, Sparkles, Send, CheckSquare, ShieldCheck, Archive, Zap } from 'lucide-react';

interface BatchActionToolbarProps {
  duplicatesCount: number;
  reopenedCount: number;
  glassCount: number;
  standardHailCount: number;
  isDuplicatesMerged: boolean;
  isReopenedArchived: boolean;
  isGlassDispatched: boolean;
  isDekraDispatched: boolean;
  onMergeDuplicates: () => void;
  onArchiveReopened: () => void;
  onDispatchGlass: () => void;
  onDispatchDekra: () => void;
}

export const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({
  duplicatesCount,
  reopenedCount,
  glassCount,
  standardHailCount,
  isDuplicatesMerged,
  isReopenedArchived,
  isGlassDispatched,
  isDekraDispatched,
  onMergeDuplicates,
  onArchiveReopened,
  onDispatchGlass,
  onDispatchDekra,
}) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">One-Click High-Conviction Batch Dispatches</span>
            <span className="text-[11px] text-slate-400 block">Automates deterministic handbook rules across 200+ claims simultaneously</span>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Rule-Engine Automated
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. DUPLICATE MERGING */}
        <button
          onClick={onMergeDuplicates}
          disabled={isDuplicatesMerged}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
            isDuplicatesMerged
              ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-indigo-950/30 border-indigo-500/40 hover:bg-indigo-900/40 hover:border-indigo-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-indigo-300 flex items-center space-x-1.5">
                <Merge className="w-3.5 h-3.5" />
                <span>Rule 4 Deduplication</span>
              </span>
              <span className="font-mono text-slate-400">{duplicatesCount} pairs</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Auto-merge 21 multi-channel duplicate pairs into older claim &amp; silence second reply.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 flex items-center justify-between">
            <span>{isDuplicatesMerged ? '✓ Merged (42 Claims Handled)' : '1-Click Merge All'}</span>
            <span className="text-[10px] text-slate-400">+10.5 hrs saved</span>
          </div>
        </button>

        {/* 2. ARCHIVE REOPENED COURTESY */}
        <button
          onClick={onArchiveReopened}
          disabled={isReopenedArchived}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
            isReopenedArchived
              ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-purple-950/30 border-purple-500/40 hover:bg-purple-900/40 hover:border-purple-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-purple-300 flex items-center space-x-1.5">
                <Archive className="w-3.5 h-3.5" />
                <span>Courtesy Noise Filter</span>
              </span>
              <span className="font-mono text-slate-400">{reopenedCount} claims</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Close false reopened claims where customer just said &quot;Thank you&quot; after full payout.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-semibold text-purple-400 flex items-center justify-between">
            <span>{isReopenedArchived ? '✓ Closed & Archived' : '1-Click Archive Noise'}</span>
            <span className="text-[10px] text-slate-400">+1.0 hrs saved</span>
          </div>
        </button>

        {/* 3. DISPATCH KLARSICHT GLASS LINKS */}
        <button
          onClick={onDispatchGlass}
          disabled={isGlassDispatched}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
            isGlassDispatched
              ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Rule 5 Glass Emergency</span>
              </span>
              <span className="font-mono text-slate-400">{glassCount} claims</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Batch send priority on-site mobile booking links for partner Klarsicht Autoglas.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center justify-between">
            <span>{isGlassDispatched ? '✓ Dispatched (117 Sent)' : 'Batch Dispatch Links'}</span>
            <span className="text-[10px] text-slate-400">+19.5 hrs saved</span>
          </div>
        </button>

        {/* 4. DISPATCH DEKRA MASS INSPECTION */}
        <button
          onClick={onDispatchDekra}
          disabled={isDekraDispatched}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
            isDekraDispatched
              ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-sky-950/30 border-sky-500/40 hover:bg-sky-900/40 hover:border-sky-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-sky-300 flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Rule 6 Dekra Drive-In</span>
              </span>
              <span className="font-mono text-slate-400">{standardHailCount} claims</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Batch invite drivable hail claims to Munich Mass Drive-In Assessment Center.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-semibold text-sky-400 flex items-center justify-between">
            <span>{isDekraDispatched ? '✓ Scheduled (39 Sent)' : 'Batch Schedule All'}</span>
            <span className="text-[10px] text-slate-400">+6.5 hrs saved</span>
          </div>
        </button>

      </div>
    </div>
  );
};
