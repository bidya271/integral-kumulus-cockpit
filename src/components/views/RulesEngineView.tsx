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
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';

export interface HeuristicRule {
  id: string;
  code: string;
  name: string;
  decisionMode: 'AUTONOMOUS' | 'HUMAN_REVIEW_REQUIRED' | 'URGENT_DEADLINE' | 'AUTO-MERGE' | 'AUTO-DISPATCH' | 'BATCH SCHEDULE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  isActive: boolean;
  conditionText: string;
  actionText: string;
  financialImpact?: string;
  category: 'coverage' | 'workshop' | 'mobility' | 'intake' | 'partner' | 'custom';
  isCustom?: boolean;
}

const INITIAL_RULES: HeuristicRule[] = [
  {
    id: 'rule-1',
    code: 'RULE_1_HAFTPFLICHT_HAZARD',
    name: 'Rule 1: Haftpflicht Storm Damage Exclusion',
    decisionMode: 'HUMAN_REVIEW_REQUIRED',
    severity: 'CRITICAL',
    isActive: true,
    conditionText: 'Event == "Hail" AND Policy Coverage == "Haftpflicht"',
    actionText: 'Halt outgoing payment promises. Route claim to polite rejection letter with comprehensive upgrade options. Prevents €132k unapproved leakage across 33 claims.',
    financialImpact: '€132,000 Leakage Prevented (33 Claims)',
    category: 'coverage'
  },
  {
    id: 'rule-2',
    code: 'RULE_2_DEDUCTIBLE_ENFORCEMENT',
    name: 'Rule 2: Policy Deductible Auto-Enforcement',
    decisionMode: 'AUTONOMOUS',
    severity: 'MEDIUM',
    isActive: true,
    conditionText: 'Coverage is Teilkasko (€150) or Vollkasko (€300)',
    actionText: 'Automatically subtract customer deductible from repair calculation and explicitly state customer share in all settlement drafts.',
    financialImpact: '€31,500 Collected Deductibles',
    category: 'coverage'
  },
  {
    id: 'rule-3',
    code: 'RULE_3_WORKSHOP_DEADLINE',
    name: 'Rule 3: Workshop Estimate <= 110% Benchmark',
    decisionMode: 'URGENT_DEADLINE',
    severity: 'CRITICAL',
    isActive: true,
    conditionText: 'Workshop Net KVA <= 110% of Dekra Benchmark',
    actionText: 'Automatically issue written Freigabe. Protects Autohaus Brandl 12:00 PM slot for today 13:00 (€3,860 <= €3,910).',
    financialImpact: '€3,860 Repair Slot Locked (Avoid €350 delay)',
    category: 'workshop'
  },
  {
    id: 'rule-4',
    code: 'RULE_4_DUPLICATE_MERGE',
    name: 'Rule 4: Multi-Channel Deduplication Engine',
    decisionMode: 'AUTO-MERGE',
    severity: 'MEDIUM',
    isActive: true,
    conditionText: 'Same license plate reported across multiple channels within 24h',
    actionText: 'Merge newer submission into master record. Silences 42 redundant outbound emails and prevents double-payouts.',
    financialImpact: '+10.5 Handler Hours Saved',
    category: 'intake'
  },
  {
    id: 'rule-5',
    code: 'RULE_5_GLASS_EMERGENCY',
    name: 'Rule 5: Broken Glass Vehicle Undrivability (StVZO)',
    decisionMode: 'AUTO-DISPATCH',
    severity: 'HIGH',
    isActive: true,
    conditionText: 'Glass damage detected (windshield / mirrors / windows)',
    actionText: 'Do NOT allow customer to drive to inspection. Send Klarsicht Autoglas on-site mobile booking link directly (117 claims).',
    financialImpact: '+19.5 Handler Hours Saved (StVZO Compliant)',
    category: 'partner'
  },
  {
    id: 'rule-6',
    code: 'RULE_6_DEKRA_MASS_ASSESSMENT',
    name: 'Rule 6: Dents Only Mass Assessment Center',
    decisionMode: 'BATCH SCHEDULE',
    severity: 'INFO',
    isActive: true,
    conditionText: 'Bodywork hail dents only AND vehicle is drivable',
    actionText: 'Route to Dekra Munich Mass Assessment Drive-in center with dedicated 15-minute drive-through slots (39 claims).',
    financialImpact: '+6.5 Handler Hours Saved',
    category: 'partner'
  },
  {
    id: 'rule-7',
    code: 'RULE_7_MOBILITY_LIMIT',
    name: 'Rule 7: Mobility Rental Duration Cap (14 Days)',
    decisionMode: 'HUMAN_REVIEW_REQUIRED',
    severity: 'CRITICAL',
    isActive: true,
    conditionText: 'Requested rental duration > 14 days',
    actionText: 'Hard freeze on automated confirmation. Require written approval from Claims Team Lead before booking extra days (e.g. Tom Clarke KS-26-104413).',
    financialImpact: '€450 Unapproved Rental Liability Blocked',
    category: 'mobility'
  }
];

interface RulesEngineViewProps {
  claims: Claim[];
  policies: Policy[];
}

export const RulesEngineView: React.FC<RulesEngineViewProps> = ({ claims, policies }) => {
  // Rules State (Dynamic: allows editing & additions)
  const [rules, setRules] = useState<HeuristicRule[]>(INITIAL_RULES);
  const [rulesetVersion, setRulesetVersion] = useState<string>('v2.4');

  // Operational Heuristic Thresholds
  const [kvaThresholdPercent, setKvaThresholdPercent] = useState<number>(110);
  const [mobilityMaxDays, setMobilityMaxDays] = useState<number>(14);
  const [autoApprovalCapEur, setAutoApprovalCapEur] = useState<number>(5000);

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

  // Modals for Editing and Adding Rules
  const [editingRule, setEditingRule] = useState<HeuristicRule | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState<Partial<HeuristicRule>>({
    code: 'RULE_8_CUSTOM_SURGE_POLICY',
    name: 'Rule 8: Fast-Track Smart Repair under €1,500',
    decisionMode: 'AUTONOMOUS',
    severity: 'MEDIUM',
    isActive: true,
    conditionText: 'Damage == "Hail Dents" AND Net Estimate <= €1,500 AND No Glass',
    actionText: 'Direct autonomous payment authorization without physical Dekra hub booking.',
    financialImpact: '+12 Handler Hours Saved',
    category: 'custom'
  });

  // Toggle single rule on/off
  const toggleRuleActive = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
    bumpVersion();
  };

  const bumpVersion = () => {
    const parts = rulesetVersion.replace('v', '').split('.');
    const minor = parseInt(parts[1] || '4', 10) + 1;
    setRulesetVersion(`v${parts[0]}.${minor}`);
  };

  // Run Real-Time Impact Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let auto = 0;
      let review = 0;
      let urgent = 0;
      let leakage = 0;
      let hours = 0;

      const rule1 = rules.find(r => r.code === 'RULE_1_HAFTPFLICHT_HAZARD');
      const rule4 = rules.find(r => r.code === 'RULE_4_DUPLICATE_MERGE');
      const rule5 = rules.find(r => r.code === 'RULE_5_GLASS_EMERGENCY');
      const rule6 = rules.find(r => r.code === 'RULE_6_DEKRA_MASS_ASSESSMENT');

      for (const c of claims) {
        // Rule 1: Haftpflicht check
        if (c.is_storm_claim && c.policy_coverage === 'Haftpflicht') {
          if (rule1?.isActive) {
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
          if (rule4?.isActive) {
            auto += 1;
            hours += 0.25;
          } else {
            review += 1;
          }
          continue;
        }

        // Rule 5: Glass
        if (c.has_glass) {
          if (rule5?.isActive) {
            auto += 1;
            hours += 0.16;
          } else {
            review += 1;
          }
          continue;
        }

        // Pre-storm or drive-in
        if (rule6?.isActive && c.is_storm_claim) {
          auto += 1;
          hours += 0.16;
        } else {
          review += 1;
        }
      }

      // Add impact of custom active rules
      const activeCustomCount = rules.filter(r => r.isCustom && r.isActive).length;
      if (activeCustomCount > 0) {
        hours += activeCustomCount * 4.5;
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

  // Save edited rule
  const handleSaveEditedRule = () => {
    if (!editingRule) return;
    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
    setEditingRule(null);
    bumpVersion();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Add new rule
  const handleAddNewRule = () => {
    if (!newRule.name || !newRule.conditionText) return;
    const ruleToAdd: HeuristicRule = {
      id: `rule-custom-${Date.now()}`,
      code: newRule.code || `RULE_${rules.length + 1}_CUSTOM`,
      name: newRule.name,
      decisionMode: newRule.decisionMode || 'AUTONOMOUS',
      severity: newRule.severity || 'MEDIUM',
      isActive: true,
      conditionText: newRule.conditionText,
      actionText: newRule.actionText || 'Process according to defined operational handbook protocol.',
      financialImpact: newRule.financialImpact || '+5.0 Handler Hours Saved',
      category: 'custom',
      isCustom: true
    };

    setRules(prev => [...prev, ruleToAdd]);
    setIsAddModalOpen(false);
    bumpVersion();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Delete custom rule
  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    bumpVersion();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Header with Active Version & Deploy */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-integral-copper-600" />
            <h2 className="text-sm font-bold text-gray-950">Business Rule Engine: Handbook Heuristic Policy Studio</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#cf5f09] border border-orange-200 font-mono">
              GoBD Ruleset {rulesetVersion} (Active)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Author, edit, test, and activate deterministic business rules governing when claims are cleared autonomously vs. escalated.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Add Rule Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
            title="Author a new business rule for this storm event"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Business Rule</span>
          </button>

          {isSaved && (
            <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Ruleset {rulesetVersion} Deployed</span>
            </span>
          )}
          
          <button
            onClick={handleSavePolicy}
            className="px-4 py-2 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Deploy {rulesetVersion}</span>
          </button>
        </div>
      </div>

      {/* Enterprise Governance & Separation of Duties Info Box */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Enterprise Role Separation (Dual-Control / Vier-Augen-Prinzip):</strong> Lena Huber (Adjuster Desk #4) operates on active rules with real-time feedback. Rule authoring, threshold tuning, and policy additions are staged with pre-commit simulation before deployment to meet strict BaFin and GoBD compliance standards.
        </div>
      </div>

      {/* 1. SIMULATION COMMAND & IMPACT PROJECTION */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-950">Real-Time Impact Simulation (270 Claims Dataset)</span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Simulates rule firing across all Munich hailstorm claims with current threshold settings and active ruleset.
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
              onChange={(e) => {
                setKvaThresholdPercent(Number(e.target.value));
                bumpVersion();
              }}
              className="w-full accent-integral-copper-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500">
              Quotes &le; {kvaThresholdPercent}% Dekra are approved automatically. Autohaus Brandl is at 98.7% (€3,860 / €3,910).
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
              onChange={(e) => {
                setMobilityMaxDays(Number(e.target.value));
                bumpVersion();
              }}
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
              onChange={(e) => {
                setAutoApprovalCapEur(Number(e.target.value));
                bumpVersion();
              }}
              className="w-full accent-integral-copper-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500">
              Any estimate over €{autoApprovalCapEur.toLocaleString()} requires secondary adjuster sign-off.
            </p>
          </div>

        </div>
      </div>

      {/* 3. DYNAMIC HEURISTIC RULE REGISTRY (EDITABLE & EXTENSIBLE) */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
              Active Heuristic Rules Registry ({rules.length} Rules in {rulesetVersion})
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Click &quot;Edit Rule&quot; to calibrate conditions or &quot;+ Add New Rule&quot; to author disaster-specific heuristics.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {rules.filter(r => r.isActive).length} Active · {rules.filter(r => !r.isActive).length} Disabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const getSeverityBadge = (sev: string) => {
              switch (sev) {
                case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-300';
                case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-300';
                case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-300';
                default: return 'bg-gray-100 text-gray-800 border-gray-300';
              }
            };

            const getModeBadge = (mode: string) => {
              switch (mode) {
                case 'AUTONOMOUS': return 'bg-emerald-100 text-emerald-800';
                case 'HUMAN_REVIEW_REQUIRED': return 'bg-amber-100 text-amber-800';
                case 'URGENT_DEADLINE': return 'bg-rose-100 text-rose-800';
                case 'AUTO-MERGE': return 'bg-purple-100 text-purple-800';
                case 'AUTO-DISPATCH': return 'bg-emerald-100 text-emerald-800';
                default: return 'bg-sky-100 text-sky-800';
              }
            };

            return (
              <div 
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  rule.isActive ? 'bg-gray-50/80 border-gray-200' : 'bg-gray-100/50 border-gray-200/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="font-bold text-xs text-gray-950 truncate">
                        {rule.name}
                      </span>
                      {rule.isCustom && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      {rule.code}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getModeBadge(rule.decisionMode)}`}>
                      {rule.decisionMode}
                    </span>
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                        rule.isActive 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-gray-200 text-gray-600 border-gray-300'
                      }`}
                      title={rule.isActive ? 'Click to disable rule' : 'Click to enable rule'}
                    >
                      {rule.isActive ? 'Active' : 'Off'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-700 space-y-1 bg-white/70 p-2.5 rounded-lg border border-gray-200/60 font-sans">
                  <div>
                    <strong className="text-gray-900">IF:</strong> {rule.conditionText}
                  </div>
                  <div>
                    <strong className="text-gray-900">THEN:</strong> {rule.actionText}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-gray-500">
                    {rule.financialImpact && (
                      <span className="text-emerald-700 font-semibold">{rule.financialImpact}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-semibold rounded border border-gray-300 shadow-2xs transition flex items-center space-x-1"
                    >
                      <Pencil className="w-3 h-3 text-gray-500" />
                      <span>Edit</span>
                    </button>

                    {rule.isCustom && (
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 hover:bg-rose-100 text-gray-400 hover:text-rose-700 rounded transition"
                        title="Delete custom rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-4 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-integral-copper-600" />
                <h3 className="text-sm font-bold text-gray-950">Edit Business Rule ({editingRule.code})</h3>
              </div>
              <button 
                onClick={() => setEditingRule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Decision Mode</label>
                  <select
                    value={editingRule.decisionMode}
                    onChange={(e) => setEditingRule({ ...editingRule, decisionMode: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500"
                  >
                    <option value="AUTONOMOUS">AUTONOMOUS</option>
                    <option value="HUMAN_REVIEW_REQUIRED">HUMAN_REVIEW_REQUIRED</option>
                    <option value="URGENT_DEADLINE">URGENT_DEADLINE</option>
                    <option value="AUTO-MERGE">AUTO-MERGE</option>
                    <option value="AUTO-DISPATCH">AUTO-DISPATCH</option>
                    <option value="BATCH SCHEDULE">BATCH SCHEDULE</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Severity</label>
                  <select
                    value={editingRule.severity}
                    onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">IF Condition Logic</label>
                <textarea
                  rows={2}
                  value={editingRule.conditionText}
                  onChange={(e) => setEditingRule({ ...editingRule, conditionText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-integral-copper-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">THEN Operational Action &amp; Routing</label>
                <textarea
                  rows={2}
                  value={editingRule.actionText}
                  onChange={(e) => setEditingRule({ ...editingRule, actionText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Projected Financial / Capacity Impact</label>
                <input
                  type="text"
                  value={editingRule.financialImpact || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, financialImpact: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500 font-mono"
                  placeholder="e.g. €25,000 Leakage Prevented"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => setEditingRule(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedRule}
                className="px-4 py-1.5 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Save Changes to {rulesetVersion}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW RULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-4 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-integral-copper-600" />
                <h3 className="text-sm font-bold text-gray-950">Author New Business Rule</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Rule Code (Unique ID)</label>
                  <input
                    type="text"
                    value={newRule.code || ''}
                    onChange={(e) => setNewRule({ ...newRule, code: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-integral-copper-500"
                    placeholder="RULE_8_CUSTOM_SURGE"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Decision Mode</label>
                  <select
                    value={newRule.decisionMode}
                    onChange={(e) => setNewRule({ ...newRule, decisionMode: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500"
                  >
                    <option value="AUTONOMOUS">AUTONOMOUS (Zero-Touch)</option>
                    <option value="HUMAN_REVIEW_REQUIRED">HUMAN_REVIEW_REQUIRED</option>
                    <option value="URGENT_DEADLINE">URGENT_DEADLINE (Ticking Clock)</option>
                    <option value="AUTO-MERGE">AUTO-MERGE (Duplicates)</option>
                    <option value="AUTO-DISPATCH">AUTO-DISPATCH (Partners)</option>
                    <option value="BATCH SCHEDULE">BATCH SCHEDULE (Dekra)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500 font-semibold"
                  placeholder="e.g. Rule 8: Fast-Track Smart Repair under €1,500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">IF Condition Trigger</label>
                <textarea
                  rows={2}
                  value={newRule.conditionText || ''}
                  onChange={(e) => setNewRule({ ...newRule, conditionText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-integral-copper-500"
                  placeholder="e.g. Damage == 'Hail Dents' AND Net Estimate <= €1,500 AND No Glass"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">THEN Operational Action &amp; Routing</label>
                <textarea
                  rows={2}
                  value={newRule.actionText || ''}
                  onChange={(e) => setNewRule({ ...newRule, actionText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500"
                  placeholder="e.g. Issue autonomous payment authorization without physical Dekra hub booking."
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Projected Impact / Leakage Metric</label>
                <input
                  type="text"
                  value={newRule.financialImpact || ''}
                  onChange={(e) => setNewRule({ ...newRule, financialImpact: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none focus:border-integral-copper-500 font-mono"
                  placeholder="e.g. +12 Handler Hours Saved · Faster Customer Payout"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewRule}
                className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Add Rule &amp; Increment Version
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
