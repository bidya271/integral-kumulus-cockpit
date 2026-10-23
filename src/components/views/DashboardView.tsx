'use client';

import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Truck, 
  AlertCircle, 
  ShieldAlert, 
  Merge, 
  Send, 
  CheckSquare, 
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Headphones,
  Bot,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { Claim, ClaimAssessment } from '../../lib/ruleEngine';
import { NavTab } from '../Sidebar';

interface DashboardViewProps {
  claims: Claim[];
  assessments: Map<string, ClaimAssessment>;
  stats: { handledCount: number; hoursSaved: number };
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
  onNavigateToCases: (filter?: string) => void;
  onSelectClaim: (claimId: string) => void;
  onOpenBulkReplyModal?: (cluster: 'glass' | 'haftpflicht' | 'duplicates' | 'dekra') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  claims,
  assessments,
  stats,
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
  onNavigateToCases,
  onSelectClaim,
  onOpenBulkReplyModal
}) => {
  const totalClaims = claims.length;
  const percentage = Math.round((stats.handledCount / totalClaims) * 100);
  const leakagePreventedEur = isHaftpflichtQuarantined ? 132000 : 0;
  const partnerDispatchesCount = (isGlassDispatched ? 117 : 0) + (isDekraDispatched ? 39 : 0);

  // Channels count
  const channelCounts = {
    app: claims.filter(c => c.channel === 'app').length,
    email: claims.filter(c => c.channel === 'email').length,
    voice: claims.filter(c => c.channel === 'voice').length,
    whatsapp: claims.filter(c => c.channel === 'whatsapp').length,
    desk: claims.filter(c => c.channel === 'service_desk').length,
  };

  // Landmine counts
  const glassClaimsCount = claims.filter(c => c.is_storm_claim && c.has_glass && c.policy_coverage !== 'Haftpflicht').length;
  const haftpflichtClaimsCount = claims.filter(c => c.is_storm_claim && c.policy_coverage === 'Haftpflicht').length;
  const duplicateClaimsCount = claims.filter(c => c.is_duplicate).length;
  const dekraClaimsCount = claims.filter(c => c.is_storm_claim && !c.has_glass && c.policy_coverage !== 'Haftpflicht' && !c.is_duplicate).length;

  return (
    <div className="space-y-6">
      
      {/* 1. OPERATIONS COMMAND & CAPACITY LEDGER (5 CARDS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-integral-copper-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Operations Command &amp; Capacity Ledger
            </h2>
          </div>
          <div className="text-[11px] text-gray-500 font-mono">
            Queue Clearance Velocity: <span className="text-gray-950 font-bold">85 claims/hr</span> · <span className="text-emerald-700 font-bold">ETA 11:35 AM</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1 */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">Queue Clearance</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">ETA 11:35</span>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-gray-950 font-mono">
                {stats.handledCount} <span className="text-xs font-normal text-gray-400">/ {totalClaims}</span>
              </div>
              <span className="text-xs font-semibold font-mono text-[#cf5f09]">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-integral-copper-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Card 2 */}
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

          {/* Card 3 */}
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
            <div className="text-[11px] text-gray-500">
              Klarsicht (117) · Dekra (39)
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">FTE Capacity Freed</span>
              <Zap className="w-3.5 h-3.5 text-integral-copper-600" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold tracking-tight text-integral-copper-600 font-mono">
                +{stats.hoursSaved.toFixed(1)} <span className="text-xs font-normal text-gray-400">hrs</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>{(stats.hoursSaved / 8).toFixed(1)} handler workdays recovered</span>
            </div>
          </div>

          {/* Card 5 */}
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
      </section>

      {/* 2. ALL 5 OPERATIONAL LANDMINES & MASS TRIAGE MATRIX */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-[#cf5f09]/10 text-integral-copper-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950">
              The 5 Critical Operational Landmines (08:00 CEST Urgent Matrix)
            </h2>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">Uncovered in the 270 claim dataset · Triaged to Case Management</span>
          </div>
          <button 
            onClick={() => onNavigateToCases('urgent')}
            className="text-xs font-semibold text-integral-copper-600 hover:text-integral-copper-700 flex items-center space-x-1"
          >
            <span>Open Triage Queue in Case Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* LANDMINE 1: Autohaus Brandl Slot Expiry */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isAutohausApproved ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/70 border-amber-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isAutohausApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Landmine #1 · SLA Deadline</span>
                    <span className="text-xs font-mono font-bold text-gray-950">KS-26-104234 · Ursula Popescu</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isAutohausApproved 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                }`}>
                  {isAutohausApproved ? '✅ Approved' : '⏳ Ticking 03h 54m'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Estimate <strong>€3,860 net</strong> is under Dekra benchmark (€3,910). Reserved repair slot today at 13:00 will be forfeited if not approved in writing before 12:00 PM.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Financial Impact:</span>
                <span>€3,860 authorized (Save €350 rental delay)</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectClaim('KS-26-104234')}
                className="text-gray-600 hover:text-gray-950 font-medium flex items-center space-x-1"
              >
                <span>Inspect Case</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              {isAutohausApproved ? (
                <div className="flex items-center space-x-1.5">
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Slot Locked</span>
                  </span>
                  <button
                    onClick={onApproveAutohaus}
                    className="px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:text-gray-950 bg-white border border-gray-200 rounded shadow-2xs hover:bg-gray-50 transition"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <button
                  onClick={onApproveAutohaus}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition text-xs"
                >
                  1-Click Approve (€3,860)
                </button>
              )}
            </div>
          </div>

          {/* LANDMINE 2: Tom Clarke Rule 7 Mobility Breach */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isTomClarkeEscalated ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/70 border-rose-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isTomClarkeEscalated ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">Landmine #2 · Rule 7 Mobility</span>
                    <span className="text-xs font-mono font-bold text-gray-950">KS-26-104413 · Tom Clarke</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isTomClarkeEscalated 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                }`}>
                  {isTomClarkeEscalated ? '✅ Escalated' : '🚨 Illegal AI Promise'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Customer requested rental extension to 21 days (hits day 13 tomorrow). Naive AI draft falsely promised free rental, violating 14-day policy cap without Team Lead approval.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Financial Impact:</span>
                <span>€450 unapproved rental liability blocked</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectClaim('KS-26-104413')}
                className="text-gray-600 hover:text-gray-950 font-medium flex items-center space-x-1"
              >
                <span>Inspect Case</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              {isTomClarkeEscalated ? (
                <div className="flex items-center space-x-1.5">
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lead Escalated</span>
                  </span>
                  <button
                    onClick={onEscalateTomClarke}
                    className="px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:text-gray-950 bg-white border border-gray-200 rounded shadow-2xs hover:bg-gray-50 transition"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <button
                  onClick={onEscalateTomClarke}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs transition text-xs"
                >
                  Escalate to Team Lead
                </button>
              )}
            </div>
          </div>

          {/* LANDMINE 3: 33 Haftpflicht Claims (€132,000 Leakage) */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isHaftpflichtQuarantined ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/70 border-red-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isHaftpflichtQuarantined ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 block">Landmine #3 · €132k Leakage</span>
                    <span className="text-xs font-mono font-bold text-gray-950">33 Haftpflicht Claims</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isHaftpflichtQuarantined 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                }`}>
                  {isHaftpflichtQuarantined ? '✅ Quarantined' : '🚨 High Leakage Risk'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Naive AI generated coverage promises for 33 third-party liability policies with zero hail damage coverage. At ~€4,000 avg damage = <strong>€132,000 unrecoverable loss</strong>.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Financial Impact:</span>
                <span className="text-emerald-700 font-bold">€132,000 leakage prevented</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-red-200/60 flex items-center justify-between text-xs gap-2">
              <button
                onClick={() => onOpenBulkReplyModal ? onOpenBulkReplyModal('haftpflicht') : onNavigateToCases('haftpflicht')}
                className="px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-lg shadow-xs transition flex items-center space-x-1 text-[11px]"
                title="Review templatized rejection notice and bulk send to 33 policyholders"
              >
                <Mail className="w-3 h-3" />
                <span>Review &amp; Bulk Send (33)</span>
              </button>

              <button
                onClick={onQuarantineHaftpflicht}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition shadow-2xs ${
                  isHaftpflichtQuarantined
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isHaftpflichtQuarantined ? 'Quarantined · Undo' : '1-Click Halt'}
              </button>
            </div>
          </div>

          {/* LANDMINE 4: 21 Duplicate Pairs (42 Claims) */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isDuplicatesMerged ? 'bg-emerald-50/60 border-emerald-200' : 'bg-purple-50/70 border-purple-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isDuplicatesMerged ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                    <Merge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">Landmine #4 · Channel Flood</span>
                    <span className="text-xs font-mono font-bold text-gray-950">21 Pairs · 42 Duplicates</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isDuplicatesMerged 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-purple-100 text-purple-800 border-purple-300'
                }`}>
                  {isDuplicatesMerged ? '✅ Merged' : '⚠️ Redundant Queue'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Overnight callers panicked and submitted across Voice, App, and WhatsApp. Individual replies waste 10.5 handler hours and trigger conflicting status updates.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Capacity Impact:</span>
                <span className="text-emerald-700 font-bold">+10.5 handler hours saved</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-purple-200/60 flex items-center justify-between text-xs gap-2">
              <button
                onClick={() => onOpenBulkReplyModal ? onOpenBulkReplyModal('duplicates') : onNavigateToCases('duplicates')}
                className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-xs transition flex items-center space-x-1 text-[11px]"
                title="Review consolidation template and bulk merge with confirmation notice"
              >
                <Merge className="w-3 h-3" />
                <span>Review &amp; Merge (42)</span>
              </button>

              <button
                onClick={onMergeDuplicates}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition shadow-2xs ${
                  isDuplicatesMerged
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isDuplicatesMerged ? 'Merged · Undo' : '1-Click Merge'}
              </button>
            </div>
          </div>

          {/* LANDMINE 5: 117 Broken Glass Claims (StVZO Safety Breach) */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isGlassDispatched ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-50/70 border-emerald-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isGlassDispatched ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-100 text-emerald-800'}`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">Landmine #5 · StVZO Safety</span>
                    <span className="text-xs font-mono font-bold text-gray-950">117 Broken Glass Claims</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isGlassDispatched 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {isGlassDispatched ? '✅ Partner Dispatched' : '⚠️ Unroadworthy (Klarsicht)'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Vehicles cannot legally be driven to Dekra appraisal hubs under StVZO. Naive AI told them to drive; must be routed to <strong>Klarsicht Autoglas</strong> on-site mobile vans.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Capacity Impact:</span>
                <span className="text-emerald-700 font-bold">+19.5 handler hours saved</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs gap-2">
              <button
                onClick={() => onOpenBulkReplyModal ? onOpenBulkReplyModal('glass') : onNavigateToCases('glass')}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs transition flex items-center space-x-1 text-[11px]"
                title="Review Klarsicht booking link template and bulk dispatch to 117 policyholders"
              >
                <Send className="w-3 h-3" />
                <span>Review &amp; Dispatch (117)</span>
              </button>

              <button
                onClick={onDispatchGlass}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition shadow-2xs ${
                  isGlassDispatched
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isGlassDispatched ? 'Dispatched · Undo' : '1-Click Dispatch'}
              </button>
            </div>
          </div>

          {/* LANDMINE 6 / MASS ROUTE: 39 Dekra Drive-In Assessments */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all ${
            isDekraDispatched ? 'bg-emerald-50/60 border-emerald-200' : 'bg-sky-50/70 border-sky-200/90'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isDekraDispatched ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block">Mass Routing · Drive-In</span>
                    <span className="text-xs font-mono font-bold text-gray-950">39 Dekra Drive-In Claims</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isDekraDispatched 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}>
                  {isDekraDispatched ? '✅ Hub Scheduled' : '🚗 Drivable Bodywork'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2.5 leading-relaxed">
                Vehicles are drivable with bodywork hail dents. Batch schedule into Munich Olympic Park Mass Assessment Hub for automated laser appraisal.
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-mono flex items-center space-x-1.5">
                <span className="font-semibold text-gray-700">Capacity Impact:</span>
                <span className="text-emerald-700 font-bold">+6.5 handler hours saved</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-xs gap-2">
              <button
                onClick={() => onOpenBulkReplyModal ? onOpenBulkReplyModal('dekra') : onNavigateToCases('dekra')}
                className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg shadow-xs transition flex items-center space-x-1 text-[11px]"
                title="Review Dekra Drive-In booking template and bulk schedule 39 claims"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Review &amp; Schedule (39)</span>
              </button>

              <button
                onClick={onDispatchDekra}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition shadow-2xs ${
                  isDekraDispatched
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                {isDekraDispatched ? 'Scheduled · Undo' : '1-Click Schedule'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. OMNICHANNEL INGESTION STREAMS & DATA VERIFICATION */}
      <section className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950">Omnichannel Intake Streams (Munich Hail Storm Event)</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">270 FNOL submissions ingested between 22:00 (13 Jul) and 07:30 (14 Jul)</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            100% Policy Resolution Rate (69/69 policies matched)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 text-xs">
          
          <div 
            onClick={() => onNavigateToCases('app')}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-gray-800">Mobile App</span>
            </div>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {channelCounts.app} (55%)
            </span>
          </div>

          <div 
            onClick={() => onNavigateToCases('email')}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-integral-copper-600" />
              <span className="font-semibold text-gray-800">Inbound Email</span>
            </div>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {channelCounts.email} (17%)
            </span>
          </div>

          <div 
            onClick={() => onNavigateToCases('voice')}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-800">Overnight Voice</span>
            </div>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {channelCounts.voice} (15%)
            </span>
          </div>

          <div 
            onClick={() => onNavigateToCases('whatsapp')}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-800">WhatsApp</span>
            </div>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {channelCounts.whatsapp} (9%)
            </span>
          </div>

          <div 
            onClick={() => onNavigateToCases('desk')}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-800">Service Desk</span>
            </div>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {channelCounts.desk} (5%)
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};
