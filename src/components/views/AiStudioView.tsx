'use client';

import React, { useState } from 'react';
import { Claim, Policy } from '../../lib/ruleEngine';
import { 
  Bot, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Terminal, 
  Save, 
  Check, 
  RefreshCw,
  Code2,
  FileCode,
  Layers
} from 'lucide-react';

interface AiStudioViewProps {
  claims: Claim[];
  policies: Policy[];
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({ claims, policies }) => {
  // Test claim state
  const [selectedClaimId, setSelectedClaimId] = useState<string>('KS-26-104234');
  
  // Model settings
  const [model, setModel] = useState<'claude-3-5-sonnet' | 'gpt-4o' | 'integral-rule-llm'>('integral-rule-llm');
  const [temperature, setTemperature] = useState<number>(0.1);
  const [maxTokens, setMaxTokens] = useState<number>(512);

  // System Prompt & Ground Truth Context
  const [systemContext, setSystemContext] = useState<string>(
`You are the autonomous claims intelligence engine for Kumulus Versicherungs AG, operating on behalf of senior claims handler Lena Huber.
You evaluate incoming catastrophe storm claims against the 7 mandatory rules of the Kumulus Claims Handbook (GoBD-compliant).

CRITICAL POLICY CONSTRAINTS:
1. HAFTFLICHT (Liability Only): NEVER confirm coverage for own-vehicle hail/storm damage under Haftpflicht. Route directly to empathetic rejection.
2. DEDUCTIBLES: Always specify the exact customer deductible (Teilkasko €150 / Vollkasko €300).
3. WORKSHOP QUOTES (KVA): Approval requires net KVA <= 110% of Dekra calculation. Quote Autohaus Brandl slot today 13:00 if deadline < 12:00 PM.
4. MOBILITY (Rental Car): Hard limit of 14 days under standard cover. Any extension request >14 days requires explicit Team Lead approval.
5. BROKEN GLASS: Broken windshields/windows render vehicle undrivable. Route to mobile partner Klarsicht Autoglas on-site repair.`);

  const [promptTemplate, setPromptTemplate] = useState<string>(
`Customer: {{customer_name}}
Policy: {{policy_id}} (Coverage: {{policy_coverage}}, Deductible: €{{deductible}})
Vehicle: {{vehicle}} (Plate: {{plate}})
Event: {{event_type}} on {{event_date}}
Reported Damage: {{intake_summary}}
Workshop Estimate: €{{repair_estimate}} net (Dekra benchmark: €{{dekra_estimate}})
Mobility Rental Requested: {{rental_days}} days

Evaluate claim against Kumulus handbook rules. If eligible, draft a concise, professional notification for Lena Huber to send. If breach detected, draft polite notice explaining handbook limits.`);

  // Guardrail Toggles
  const [strictLiabilityCheck, setStrictLiabilityCheck] = useState(true);
  const [enforceDeductible, setEnforceDeductible] = useState(true);
  const [strictMobilityCap, setStrictMobilityCap] = useState(true);
  const [autoInjectBookingLinks, setAutoInjectBookingLinks] = useState(true);

  // Test Execution State
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testOutput, setTestOutput] = useState<{
    injectedPrompt: string;
    generatedResponse: string;
    rulesPassed: { name: string; passed: boolean; message: string }[];
    tokensUsed: number;
    latencyMs: number;
  } | null>(null);

  const [isDeploySaved, setIsDeploySaved] = useState(false);

  // Find test claim
  const currentClaim = claims.find(c => c.claim_id === selectedClaimId) || claims[0];
  const currentPolicy = policies.find(p => p.policy_id === currentClaim?.resolved_policy_id);

  // Run Test Function
  const handleRunTest = () => {
    setIsRunningTest(true);

    setTimeout(() => {
      if (!currentClaim) {
        setIsRunningTest(false);
        return;
      }

      // Variable Replacement
      const injected = promptTemplate
        .replace('{{customer_name}}', currentClaim.holder_name || currentClaim.reported_name || 'Customer')
        .replace('{{policy_id}}', currentClaim.resolved_policy_id || 'UNLINKED')
        .replace('{{policy_coverage}}', currentClaim.policy_coverage || 'None')
        .replace('{{deductible}}', String(currentClaim.deductible_teilkasko_eur ?? 150))
        .replace('{{vehicle}}', currentClaim.vehicle || 'Vehicle')
        .replace('{{plate}}', currentClaim.reported_plate || 'N/A')
        .replace('{{event_type}}', currentClaim.event_type || 'Hail Storm')
        .replace('{{event_date}}', currentClaim.event_date || '13 July 2026')
        .replace('{{intake_summary}}', currentClaim.intake_summary || 'Hail storm dent damage')
        .replace('{{repair_estimate}}', currentClaim.claim_id === 'KS-26-104234' ? '3,860.00' : '0.00')
        .replace('{{dekra_estimate}}', currentClaim.claim_id === 'KS-26-104234' ? '3,910.00' : '3,910.00')
        .replace('{{rental_days}}', currentClaim.claim_id === 'KS-26-104413' ? '21' : '5');

      let response = '';
      const rules: { name: string; passed: boolean; message: string }[] = [];

      // Evaluation Logic based on claim
      if (currentClaim.claim_id === 'KS-26-104234') {
        response = `Dear Autohaus Brandl Team,\n\nWe hereby confirm repair approval (Reparaturfreigabe) for claim KS-26-104234 (VW Passat Variant, plate M-F 8000, Ursula Popescu).\n\nYour net estimate of €3,860.00 is approved in accordance with our Dekra benchmark (€3,910.00). Please proceed with the repair scheduled for today at 13:00.\n\nBest regards,\nLena Huber\nKumulus Claims Operations`;
        rules.push(
          { name: 'Rule 3: KVA <= 110% Dekra', passed: true, message: 'Estimate €3,860 is within €3,910 Dekra benchmark.' },
          { name: 'Workshop Deadline Protection', passed: true, message: 'Approved before 12:00 PM slot forfeiture deadline.' },
          { name: 'Rule 1: Coverage Check', passed: true, message: 'Vollkasko policy verified active.' }
        );
      } else if (currentClaim.claim_id === 'KS-26-104413') {
        response = `Dear Mr. Clarke,\n\nThank you for reaching out regarding your Ford Focus (claim KS-26-104413). Under your policy terms, mobility rental car costs are covered up to a standard maximum of 14 days (ending tomorrow, July 15).\n\nRegarding your request to extend through July 22 (21 days), I have escalated this request to our Claims Team Lead for written sign-off and will confirm back to you by 14:00 today.\n\nKind regards,\nLena Huber\nKumulus Claims Operations`;
        rules.push(
          { name: 'Rule 7: Mobility 14-Day Limit', passed: true, message: 'Blocked illegal free extension; routed to Team Lead sign-off.' },
          { name: 'Anti-Hallucination Guardrail', passed: true, message: 'Prevented naive AI false payment promise.' }
        );
      } else if (currentClaim.policy_coverage === 'Haftpflicht' && currentClaim.is_storm_claim) {
        response = `Dear ${currentClaim.holder_name || currentClaim.reported_name},\n\nThank you for reporting the hail damage to your vehicle. Upon reviewing your policy (${currentClaim.resolved_policy_id}), your contract is registered for third-party liability (Haftpflicht) only.\n\nUnder German insurance regulations, environmental storm and hail damage can only be claimed under partial comprehensive cover (Teilkasko). We are therefore unable to cover the repair costs for this event.\n\nKind regards,\nLena Huber\nKumulus Claims Operations`;
        rules.push(
          { name: 'Rule 1: Liability Exclusion', passed: true, message: 'Correctly halted naive AI payout; prevented €4,000 leakage.' },
          { name: 'Empathetic Rejection', passed: true, message: 'Compliant with Claims Handbook polite denial protocol.' }
        );
      } else if (currentClaim.has_glass) {
        response = `Hello ${currentClaim.holder_name || currentClaim.reported_name},\n\nYour storm damage claim (${currentClaim.claim_id}) has been registered under Teilkasko (deductible: €${currentClaim.deductible_teilkasko_eur ?? 150}).\n\nBecause your vehicle has glass damage, it is deemed undrivable for safety reasons. We have arranged on-site mobile glass replacement with our certified partner Klarsicht Autoglas. Please book your mobile appointment here: https://partner.klarsicht-autoglas.de/book\n\nBest regards,\nLena Huber`;
        rules.push(
          { name: 'Rule 5: Glass Safety Standard', passed: true, message: 'Identified undrivable state; dispatched mobile on-site booking link.' },
          { name: 'Rule 2: Deductible Stated', passed: true, message: `Included exact deductible €${currentClaim.deductible_teilkasko_eur ?? 150}.` }
        );
      } else {
        response = `Hello ${currentClaim.holder_name || currentClaim.reported_name},\n\nYour hail damage claim (${currentClaim.claim_id}) has been approved under your Teilkasko cover (deductible €${currentClaim.deductible_teilkasko_eur ?? 150}).\n\nPlease select a convenient 15-minute slot at the Munich Dekra Drive-In Mass Assessment Center: https://dekra-termine.de/kumulus-muenchen\n\nKind regards,\nLena Huber`;
        rules.push(
          { name: 'Rule 6: Drive-In Assessment', passed: true, message: 'Scheduled drivable vehicle into partner inspection facility.' },
          { name: 'Rule 2: Deductible Stated', passed: true, message: `Included exact deductible €${currentClaim.deductible_teilkasko_eur ?? 150}.` }
        );
      }

      setTestOutput({
        injectedPrompt: injected,
        generatedResponse: response,
        rulesPassed: rules,
        tokensUsed: Math.floor(injected.length / 4) + Math.floor(response.length / 4),
        latencyMs: 185
      });

      setIsRunningTest(false);
    }, 400);
  };

  const handleDeploy = () => {
    setIsDeploySaved(true);
    setTimeout(() => setIsDeploySaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Context Header and Deploy Action */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-integral-copper-600" />
            <h2 className="text-sm font-bold text-gray-950">AI Studio: Prompt Engineering &amp; Context Bench</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              v2.4 Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure system context, guardrails, and test how LLMs evaluate real Munich catastrophe claims before production dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isDeploySaved && (
            <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Deployed to Production</span>
            </span>
          )}
          <button
            onClick={handleDeploy}
            className="px-4 py-2 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Deploy Prompt v2.4</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Prompt Definition & Context (Left) vs Live Test Bench (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTEXT DEFINITION & PROMPT CONFIG (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* System Context Box */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-integral-copper-600" />
                <span>1. System Prompt &amp; Claims Handbook Context</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">Injected as system instructions</span>
            </div>
            <textarea
              rows={8}
              value={systemContext}
              onChange={(e) => setSystemContext(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-900 leading-relaxed focus:bg-white focus:outline-none focus:border-integral-copper-500"
            />
          </div>

          {/* User Prompt Template Box */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-sky-600" />
                <span>2. Ingestion Template with Claim Variables</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">Supports &#123;&#123;variables&#125;&#125;</span>
            </div>
            <textarea
              rows={7}
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-900 leading-relaxed focus:bg-white focus:outline-none focus:border-integral-copper-500"
            />
          </div>

          {/* Guardrails Configuration */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">3. Safety &amp; Policy Guardrails</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictLiabilityCheck}
                  onChange={(e) => setStrictLiabilityCheck(e.target.checked)}
                  className="rounded text-integral-copper-600 focus:ring-0"
                />
                <span className="font-semibold text-gray-800">Strict Haftpflicht Check</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceDeductible}
                  onChange={(e) => setEnforceDeductible(e.target.checked)}
                  className="rounded text-integral-copper-600 focus:ring-0"
                />
                <span className="font-semibold text-gray-800">Enforce Exact Deductible</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictMobilityCap}
                  onChange={(e) => setStrictMobilityCap(e.target.checked)}
                  className="rounded text-integral-copper-600 focus:ring-0"
                />
                <span className="font-semibold text-gray-800">Cap Rental at 14 Days</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoInjectBookingLinks}
                  onChange={(e) => setAutoInjectBookingLinks(e.target.checked)}
                  className="rounded text-integral-copper-600 focus:ring-0"
                />
                <span className="font-semibold text-gray-800">Inject Partner Links</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE TEST BENCH ON REAL CLAIMS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Test Claim Selector & Execution Header */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-integral-copper-600" />
                <span>Test Bench: Select Real Claim</span>
              </span>
              <span className="text-[11px] text-gray-500 font-mono">270 claims in queue</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Pick Benchmark Claim</label>
                <select
                  value={selectedClaimId}
                  onChange={(e) => setSelectedClaimId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-mono font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-integral-copper-500"
                >
                  <option value="KS-26-104234">KS-26-104234 · Ursula Popescu (12:00 Deadline)</option>
                  <option value="KS-26-104413">KS-26-104413 · Tom Clarke (21-Day Rental Breach)</option>
                  <option value="KS-26-104112">KS-26-104112 · Max Weber (Haftpflicht Zero Cover)</option>
                  <option value="KS-26-104199">KS-26-104199 · Sophie Bauer (Broken Glass Undrivable)</option>
                  <option value="KS-26-104205">KS-26-104205 · Elena Schmidt (Dents Drive-in Dekra)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Model Engine</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-integral-copper-500"
                >
                  <option value="integral-rule-llm">Kumulus Rule-LLM (Deterministic)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">GPT-4o (Standard Intake Bot)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-integral-copper-400" />
                  <span>Evaluating Claim against Rules...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-integral-copper-400 fill-current" />
                  <span>Execute Live Test on {selectedClaimId}</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Output */}
          {testOutput ? (
            <div className="bg-white border border-gray-200/80 rounded-xl p-5 space-y-4 shadow-xs">
              
              {/* Benchmark Metrics Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">Inference Complete</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-mono text-gray-500">{testOutput.tokensUsed} tokens</span>
                </div>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  {testOutput.latencyMs}ms Latency
                </span>
              </div>

              {/* Policy Compliance Checks */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Handbook Compliance Checklist</span>
                <div className="space-y-1.5">
                  {testOutput.rulesPassed.map((r, i) => (
                    <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-200/80 flex items-start space-x-2 text-xs">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        <div className="text-gray-600 text-[11px] mt-0.5">{r.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Response */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Generated Notification Output</span>
                  <span className="text-[10px] font-mono text-gray-400">Ready for Lena's dispatch</span>
                </div>
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                  {testOutput.generatedResponse}
                </div>
              </div>

              {/* Injected Prompt Payload (Collapsible) */}
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-medium hover:text-gray-800">View Injected Prompt Context</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-[11px] font-mono whitespace-pre-wrap text-gray-700">
                  {testOutput.injectedPrompt}
                </pre>
              </details>

            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center text-xs text-gray-400 shadow-xs">
              Click &quot;Execute Live Test&quot; above to run the prompt engine and inspect policy compliance on real claim records.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};