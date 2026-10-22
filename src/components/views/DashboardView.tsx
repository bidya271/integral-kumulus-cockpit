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
  Bot
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

      {/* 2. PRIORITY ACTION TILES & EMERGENCY TRIAGE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Priority Action Tiles (Before Midday)</h2>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">Critical items requiring handler decision</span>
          </div>
          <button 
            onClick={() => onNavigateToCases('urgent')}
            className="text-xs font-semibold text-integral-copper-600 hover:text-integral-copper-700 flex items-center space-x-1"
          >
            <span>View All in Case Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Tile 1: Autohaus Brandl (5 cols) */}
          <div className="lg:col-span-6 bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-950">KS-26-104234 · Ursula Popescu</span>
                    <span className="text-[11px] text-amber-800 block font-semibold">Autohaus Brandl 12:00 Slot Expiry</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded">
                  {isAutohausApproved ? 'Approved' : 'Ticking 03h 54m'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                Estimate <strong>€3,860 net</strong> is under Dekra benchmark (€3,910). Reserved repair slot today at 13:00 will be forfeited if not approved in writing before 12:00 PM.
              </p>
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
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved &amp; Slot Locked</span>
                </span>
              ) : (
                <button
                  onClick={onApproveAutohaus}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  1-Click Approve Freigabe (€3,860)
                </button>
              )}
            </div>
          </div>

          {/* Tile 2: Tom Clarke (6 cols) */}
          <div className="lg:col-span-6 bg-rose-50/70 border border-rose-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-950">KS-26-104413 · Tom Clarke</span>
                    <span className="text-[11px] text-rose-800 block font-semibold">Rule 7 Mobility Limit Breach (Rental Day 13/14)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded">
                  {isTomClarkeEscalated ? 'Escalated' : 'Illegal AI Promise'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                Customer requested extension through July 22 (21 days). Naive AI drafted an illegal promise of free rental, violating handbook 14-day limit without Team Lead sign-off.
              </p>
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
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Escalated to Team Lead</span>
                </span>
              ) : (
                <button
                  onClick={onEscalateTomClarke}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Escalate to Team Lead
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. AUTONOMOUS BULK TILES & CHANNEL INTAKE PULSE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: 4 Autonomous Execution Tiles (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-integral-copper-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950">Autonomous Batch Operations</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-[#cf5f09]">198 Claims Handled Zero-Touch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              
              {/* Batch 1: Duplicates */}
              <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Merge className="w-3.5 h-3.5 text-integral-copper-600" />
                      <span>Rule 4 Deduplication</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">21 Pairs</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Auto-merge 42 multi-channel duplicate submissions and silence redundant replies.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">+10.5 hrs</span>
                  <button
                    onClick={onMergeDuplicates}
                    disabled={isDuplicatesMerged}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                      isDuplicatesMerged
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-integral-copper-600 hover:bg-integral-copper-700 text-white shadow-xs'
                    }`}
                  >
                    {isDuplicatesMerged ? 'Merged (42)' : 'Merge All'}
                  </button>
                </div>
              </div>

              {/* Batch 2: Halt Drafts */}
              <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Halt Liability Drafts</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">33 Claims</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Stop false AI promises for policyholders with zero storm coverage (€132k saved).
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">+8.25 hrs</span>
                  <button
                    onClick={onQuarantineHaftpflicht}
                    disabled={isHaftpflichtQuarantined}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                      isHaftpflichtQuarantined
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    }`}
                  >
                    {isHaftpflichtQuarantined ? 'Quarantined (33)' : 'Halt 33 Drafts'}
                  </button>
                </div>
              </div>

              {/* Batch 3: Glass */}
              <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rule 5 Glass Emergency</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">117 Claims</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Send on-site mobile booking links for partner Klarsicht Autoglas.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">+19.5 hrs</span>
                  <button
                    onClick={onDispatchGlass}
                    disabled={isGlassDispatched}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                      isGlassDispatched
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isGlassDispatched ? 'Dispatched (117)' : 'Dispatch Links'}
                  </button>
                </div>
              </div>

              {/* Batch 4: Dekra */}
              <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                      <span>Rule 6 Dekra Drive-In</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">39 Claims</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Batch schedule drivable hail claims into Munich Mass Assessment Center.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">+6.5 hrs</span>
                  <button
                    onClick={onDispatchDekra}
                    disabled={isDekraDispatched}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                      isDekraDispatched
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {isDekraDispatched ? 'Scheduled (39)' : 'Schedule Dekra'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right: Omnichannel Ingestion Pulse (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950">Omnichannel Intake Streams</h3>
              <span className="text-[11px] text-gray-500 font-mono">270 Ingested</span>
            </div>

            <div className="space-y-2.5 pt-3 text-xs">
              
              <div 
                onClick={() => onNavigateToCases('app')}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-gray-800">Mobile App Ingestion</span>
                </div>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {channelCounts.app} claims (55%)
                </span>
              </div>

              <div 
                onClick={() => onNavigateToCases('email')}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-integral-copper-600" />
                  <span className="font-semibold text-gray-800">Inbound Email Dispatch</span>
                </div>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {channelCounts.email} claims (17%)
                </span>
              </div>

              <div 
                onClick={() => onNavigateToCases('voice')}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-800">Overnight Voice Agent</span>
                </div>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {channelCounts.voice} claims (15%)
                </span>
              </div>

              <div 
                onClick={() => onNavigateToCases('whatsapp')}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-gray-800">WhatsApp Self-Service</span>
                </div>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {channelCounts.whatsapp} claims (9%)
                </span>
              </div>

              <div 
                onClick={() => onNavigateToCases('desk')}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-gray-800">Direct Broker / Service Desk</span>
                </div>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {channelCounts.desk} claims (5%)
                </span>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Deterministic Policy Match Rate:</span>
            <span className="text-emerald-700 font-bold font-mono">100% (69/69 resolved)</span>
          </div>
        </div>

      </section>

    </div>
  );
};