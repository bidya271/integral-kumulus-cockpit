'use client';

import React from 'react';
import { CheckCircle2, Zap, Clock, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface KPIMetricsBarProps {
  totalClaims: number;
  handledCount: number;
  hoursSaved: number;
  isAutohausApproved: boolean;
  isHaftpflichtQuarantined: boolean;
}

export const KPIMetricsBar: React.FC<KPIMetricsBarProps> = ({
  totalClaims,
  handledCount,
  hoursSaved,
  isAutohausApproved,
  isHaftpflichtQuarantined
}) => {
  const percentage = Math.round((handledCount / totalClaims) * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* KPI 1: TRIAGE COMPLETION */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Queue Triage</span>
          <span className="text-[11px] font-mono text-slate-500">Target: 100% by 12:00</span>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {handledCount} <span className="text-sm font-normal text-slate-400">/ {totalClaims}</span>
          </div>
          <span className="text-xs font-semibold font-mono text-sky-400">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* KPI 2: HOURS SAVED */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Hours Saved Today</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-emerald-400 font-mono">
            +{hoursSaved.toFixed(1)} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>{(hoursSaved / 8).toFixed(1)} days of manual review freed</span>
        </div>
      </div>

      {/* KPI 3: TICKING SLA COUNTDOWN */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Workshop Deadline</span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono">
            {isAutohausApproved ? 'Approved' : '03h 54m'}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
          {isAutohausApproved ? (
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Autohaus Brandl slot locked</span>
            </span>
          ) : (
            <span className="text-amber-400 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Expires at 12:00 PM for KS-26-104234</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI 4: COMPLIANCE RISKS BLOCKED */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Legal Hazards Blocked</span>
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {isHaftpflichtQuarantined ? '33 / 33' : '33 At Risk'}
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          {isHaftpflichtQuarantined ? (
            <span className="text-emerald-400">Haftpflicht drafts halted safely</span>
          ) : (
            <span className="text-rose-400">Haftpflicht storm claims pending halt</span>
          )}
        </div>
      </div>

    </div>
  );
};
