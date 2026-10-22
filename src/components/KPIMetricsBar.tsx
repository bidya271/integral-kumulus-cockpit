'use client';

import React from 'react';
import { 
  CheckCircle2, Zap, Clock, ShieldCheck, TrendingUp, 
  AlertTriangle, DollarSign, Activity, Users, Truck 
} from 'lucide-react';

interface KPIMetricsBarProps {
  totalClaims: number;
  handledCount: number;
  hoursSaved: number;
  isAutohausApproved: boolean;
  isHaftpflichtQuarantined: boolean;
  isGlassDispatched: boolean;
  isDekraDispatched: boolean;
}

export const KPIMetricsBar: React.FC<KPIMetricsBarProps> = ({
  totalClaims,
  handledCount,
  hoursSaved,
  isAutohausApproved,
  isHaftpflichtQuarantined,
  isGlassDispatched,
  isDekraDispatched,
}) => {
  const percentage = Math.round((handledCount / totalClaims) * 100);
  // Calculate financial leakage prevented (33 claims * avg €4,000 hail damage estimate = €132,000)
  const leakagePreventedEur = isHaftpflichtQuarantined ? 132000 : 0;
  const partnerDispatchesCount = (isGlassDispatched ? 117 : 0) + (isDekraDispatched ? 39 : 0);

  return (
    <div className="space-y-3">
      {/* Metrics Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-integral-copper-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Operations Command &amp; Capacity Ledger
          </span>
        </div>
        <div className="text-[11px] text-gray-500 font-mono">
          Queue Clearance Velocity: <span className="text-gray-900 font-semibold">85 claims/hr</span> · <span className="text-emerald-700 font-semibold">ETA 11:35 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: TRIAGE COMPLETION & VELOCITY */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Queue Clearance</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
              ETA 11:35
            </span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-gray-950 font-mono">
              {handledCount} <span className="text-xs font-normal text-gray-400">/ {totalClaims}</span>
            </div>
            <span className="text-xs font-semibold font-mono text-integral-copper-600">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-integral-copper-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* KPI 2: FINANCIAL LEAKAGE PREVENTED */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Leakage Prevented</span>
            <ShieldCheck className="w-3.5 h-3.5 text-integral-copper-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-emerald-700 font-mono">
              €{(leakagePreventedEur / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-400">saved</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500">
            {isHaftpflichtQuarantined ? (
              <span className="text-emerald-700 font-medium">33 liability payouts blocked</span>
            ) : (
              <span className="text-rose-600 font-medium">33 uncovered claims pending halt</span>
            )}
          </div>
        </div>

        {/* KPI 3: PARTNER NETWORK FULFILLMENT */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Partner Dispatches</span>
            <Truck className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-gray-950 font-mono">
              {partnerDispatchesCount} <span className="text-xs font-normal text-gray-400">/ 156 slots</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center space-x-1">
            <span>Klarsicht (117)</span>
            <span>·</span>
            <span>Dekra (39)</span>
          </div>
        </div>

        {/* KPI 4: CAPACITY SAVED */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">FTE Capacity Freed</span>
            <Zap className="w-3.5 h-3.5 text-integral-copper-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-integral-copper-600 font-mono">
              +{hoursSaved.toFixed(1)} <span className="text-xs font-normal text-gray-400">hrs</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{(hoursSaved / 8).toFixed(1)} handler workdays recovered</span>
          </div>
        </div>

        {/* KPI 5: WORKSHOP SLA DEADLINE */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Critical SLA Clock</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-amber-600 font-mono">
              {isAutohausApproved ? 'Approved' : '03h 54m'}
            </div>
          </div>
          <div className="text-[11px] text-gray-500">
            {isAutohausApproved ? (
              <span className="text-emerald-700 font-medium">Autohaus slot locked today 13:00</span>
            ) : (
              <span className="text-amber-700 font-medium">Expires 12:00 for KS-26-104234</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
