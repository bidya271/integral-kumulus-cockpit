'use client';

import React, { useState } from 'react';
import { Claim, Policy } from '../../lib/ruleEngine';
import { 
  Scale, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Play, 
  RefreshCw, 
  Layers, 
  Save, 
  Check, 
  FileCheck,
  UserCheck,
  Ban,
  Zap,
  ArrowRight
} from 'lucide-react';

interface RulesEngineViewProps {
  claims: Claim[];
  policies: Policy[];
}

export const RulesEngineView: React.FC<RulesEngineViewProps> = ({ claims, policies }) => {
  // Operational Heuristic Thresholds
  const [kvaThresholdPercent, setKvaThresholdPercent] = useState<number>(110);
  const [mobilityMaxDays, setMobilityMaxDays] = useState<number>(14);
  const [autoApprovalCapEur, setAutoApprovalCapEur] = useState<number>(5000);

  // Active Rule Toggles
  const [isRule1Active, setIsRule1Active] = useState<boolean>(true); // Haftpflicht Exclusion
  const [isRule2Active, setIsRule2Active] = useState<boolean>(true); // Deductible Enforcement
  const [isRule3Active, setIsRule3Active] = useState<boolean>(true); // Workshop KVA Approval
  const [isRule4Active, setIsRule4Active] = useState<boolean>(true); // Duplicate Deduplication
  const [isRule5Active, setIsRule5Active] = useState<boolean>(true); // Glass Emergency Mobile
  const [isRule6Active, setIsRule6Active] = useState<boolean>(true); // Dekra Drive-In Mass Center
  const [isRule7Active, setIsRule7Active] = useState<boolean>(true); // Mobility 14-day limit

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResults, setSimulationResults] = useState<{
    autonomousCount: number;
    humanReviewCount: number;
    urgentDeadlineCount: number;
    preventedLeakageEur: number;
    hoursSaved: number;
    simulationRunAt: string;
  }>({
    autonomousCount: 198,
    humanReviewCount: 35,
    urgentDeadlineCount: 2,
    preventedLeakageEur: 132000,
    hoursSaved: 46.5,
    simulationRunAt: '08:00 CEST'
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Run Real-Time Impact Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let auto = 0;
      let review = 0;
      let urgent = 0;
      let leakage = 0;
      let hours = 0;

      for (const c of claims) {
        // Rule 1: Haftpflicht check
        if (c.is_storm_claim && c.policy_coverage === 'Haftpflicht') {
          if (isRule1Active) {
            leakage += 4000;
            hours += 0.25;
            review += 1;
          } else {
            auto += 1; // dangerous leak!
          }
          continue;
        }

        // Rule 3: Workshop approval
        if (c.claim_id === 'KS-26-104234') {
          urgent += 1;
          hours += 0.5;
          continue;
        }

        // Rule 7: Mobility check
        if (c.claim_id === 'KS-26-104413') {
          if (mobilityMaxDays < 21) {
            urgent += 1;
            hours += 0.5;
          } else {
            auto += 1;
          }
          continue;
        }

        // Rule 4: Duplicates
        if (c.is_duplicate) {
          if (isRule4Active) {
            auto += 1;
            hours += 0.25;
          } else {
            review += 1;
          }
          continue;
        }

        // Rule 5: Glass
        if (c.has_glass) {
          if (isRule5Active) {
            auto += 1;
            hours += 0.16;
          } else {
            review += 1;
          }
          continue;
        }

        // Pre-storm or drive-in
        if (isRule6Active && c.is_storm_claim) {
          auto += 1;
          hours += 0.16;
        } else {
          review += 1;
        }
      }

      setSimulationResults({
        autonomousCount: auto,
        humanReviewCount: review,
        urgentDeadlineCount: urgent,
        preventedLeakageEur: leakage,
        hoursSaved: Number(hours.toFixed(1)),
        simulationRunAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' CEST'
      });

      setIsSimulating(false);
    }, 350);
  };

  const handleSavePolicy = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Header with Active Version & Deploy */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-integral-copper-600" />
            <h2 className="text-sm font-bold text-gray-950">Business Rule Engine: Handbook Heuristic Policy Studio</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#cf5f09] border border-orange-200">
              GoBD Ruleset v2.4
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Define deterministic business rules codifying when to autonomously approve, reject, or escalate claims to handlers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isSaved && (
            <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Policy Rules Saved &amp; Active</span>
            </span>
          )}
          <button
            onClick={handleSavePolicy}
            className="px-4 py-2 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Ruleset v2.4</span>
          </button>
        </div>
      </div>

      {/* 1. SIMULATION COMMAND & IMPACT PROJECTION */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-950">Real-Time Impact Simulation (270 Claims Dataset)</span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Simulates rule firing across all Munich hailstorm claims with current threshold settings.
            </p>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-2"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-integral-copper-400" />
                <span>Running Simulation...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-integral-copper-400 fill-current" />
                <span>Run Simulation on 270 Claims</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Impact Projection Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-xs font-semibold text-emerald-800 block">Autonomous Clearance</span>
            <div className="text-2xl font-bold font-mono text-emerald-900 my-1">
              {simulationResults.autonomousCount} <span className="text-xs font-normal">claims</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {Math.round((simulationResults.autonomousCount / 270) * 100)}% of queue cleared zero-touch
            </span>
          </div>

          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
            <span className="text-xs font-semibold text-rose-800 block">Human Review / Escalated</span>
            <div className="text-2xl font-bold font-mono text-rose-900 my-1">
              {simulationResults.humanReviewCount} <span className="text-xs font-normal">claims</span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">
              Protected against erroneous payouts
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-xs font-semibold text-amber-800 block">Ticking Urgent Deadlines</span>
            <div className="text-2xl font-bold font-mono text-amber-900 my-1">
              {simulationResults.urgentDeadlineCount} <span className="text-xs font-normal">cases</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Autohaus Brandl (12:00) &amp; Clarke mobility
            </span>
          </div>

          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl">
            <span className="text-xs font-semibold text-integral-copper-800 block">Financial Leakage Blocked</span>
            <div className="text-2xl font-bold font-mono text-[#cf5f09] my-1">
              €{(simulationResults.preventedLeakageEur / 1000).toFixed(0)}k <span className="text-xs font-normal">saved</span>
            </div>
            <span className="text-[11px] text-[#cf5f09] font-medium">
              Zero unapproved liability promises
            </span>
          </div>
        </div>
      </div>

      {/* 2. HEURISTIC POLICY THRESHOLD SLIDERS */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Adjustable Operational Thresholds</span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Threshold 1: KVA ratio */}
          <div className="space-y-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900">Rule 3: Workshop KVA Cap vs Dekra</label>
              <span className="font-mono font-bold text-integral-copper-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {kvaThresholdPercent}%
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="125"
              step="1"
              value={kvaThresholdPercent}
              onChange={(e) => setKvaThresholdPercent(Number(e.target.value))}
              className="w-full accent-integral-copper-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500">
              Quotes $\le$ {kvaThresholdPercent}% Dekra are approved automatically. Autohaus Brandl is at 98.7% (€3,860 / €3,910).
            </p>
          </div>

          {/* Threshold 2: Mobility days */}
          <div className="space-y-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900">Rule 7: Mobility Rental Duration Cap</label>
              <span className="font-mono font-bold text-integral-copper-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {mobilityMaxDays} days
              </span>
            </div>
            <input
              type="range"
              min="7"
              max="21"
              step="1"
              value={mobilityMaxDays}
              onChange={(e) => setMobilityMaxDays(Number(e.target.value))}
              className="w-full accent-integral-copper-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500">
              Requests exceeding {mobilityMaxDays} days are frozen and routed to Team Lead (e.g. Tom Clarke 21 days).
            </p>
          </div>

          {/* Threshold 3: Auto-approval cap */}
          <div className="space-y-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900">Max Autonomous Value Ceiling</label>
              <span className="font-mono font-bold text-integral-copper-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                €{autoApprovalCapEur.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={autoApprovalCapEur}
              onChange={(e) => setAutoApprovalCapEur(Number(e.target.value))}
              className="w-full accent-integral-copper-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500">
              Any estimate over €{autoApprovalCapEur.toLocaleString()} requires secondary adjuster sign-off.
            </p>
          </div>

        </div>
      </div>

      {/* 3. HEURISTIC RULE REGISTRY (THE 7 HANDBOOK RULES) */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">7 Codified Claims Handbook Rules</span>
          <span className="text-xs text-gray-400 font-mono">GoBD Audited Criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Rule 1 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>Rule 1: Haftpflicht Storm Damage Exclusion</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded">REJECT / QUARANTINE</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Event == &quot;Hail&quot; AND Policy Coverage == &quot;Haftpflicht&quot;<br />
              <strong>THEN:</strong> Halt outgoing payment promises. Route claim to polite rejection letter. Prevents €132k unapproved leakage across 33 claims.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Rule 2: Policy Deductible Auto-Enforcement</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">AUTONOMOUS</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Coverage is Teilkasko (€150) or Vollkasko (€300)<br />
              <strong>THEN:</strong> Automatically subtract deductible from repair calculation and explicitly state customer share in all settlement drafts.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-integral-copper-600" />
                <span>Rule 3: Workshop Estimate $\le$ {kvaThresholdPercent}% Benchmark</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">AUTONOMOUS APPROVAL</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Workshop Net KVA $\le$ {kvaThresholdPercent}% of Dekra Benchmark<br />
              <strong>THEN:</strong> Automatically issue written Freigabe. Protects Autohaus Brandl 12:00 PM slot for today 13:00 (€3,860 $\le$ €3,910).
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-integral-copper-600" />
                <span>Rule 4: Multi-Channel Deduplication Engine</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-integral-copper-800 rounded">AUTO-MERGE</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Same license plate reported across multiple channels within 24h<br />
              <strong>THEN:</strong> Merge newer submission into master record. Silences 42 redundant outbound emails.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Rule 5: Broken Glass Vehicle Undrivability</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">AUTO-DISPATCH</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Glass damage detected (windshield / mirrors / windows)<br />
              <strong>THEN:</strong> Do NOT allow customer to drive to inspection. Send Klarsicht Autoglas on-site mobile booking link directly (117 claims).
            </p>
          </div>

          {/* Rule 6 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Rule 6: Dents Only Mass Assessment Center</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded">BATCH SCHEDULE</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Bodywork hail dents only AND vehicle is drivable<br />
              <strong>THEN:</strong> Route to Dekra Munich Mass Assessment Drive-in center with dedicated 15-minute drive-through slots (39 claims).
            </p>
          </div>

          {/* Rule 7 */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-950 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Rule 7: Mobility Rental Duration Cap ({mobilityMaxDays} Days)</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">MANUAL ESCALATION</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>IF:</strong> Requested rental duration &gt; {mobilityMaxDays} days<br />
              <strong>THEN:</strong> Hard freeze on automated confirmation. Require written approval from Claims Team Lead before booking extra days (e.g. Tom Clarke KS-26-104413).
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};