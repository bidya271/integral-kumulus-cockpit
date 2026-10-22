'use client';

import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, AlertTriangle, ShieldX, Bot, UserCheck, ArrowRight } from 'lucide-react';

interface RuleEngineSandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleEngineSandbox: React.FC<RuleEngineSandboxProps> = ({ isOpen, onClose }) => {
  const [coverage, setCoverage] = useState<'Haftpflicht' | 'Teilkasko' | 'Vollkasko'>('Teilkasko');
  const [eventType, setEventType] = useState<'Hail' | 'Collision' | 'Vandalism'>('Hail');
  const [hasGlassDamage, setHasGlassDamage] = useState(false);
  const [isUndrivable, setIsUndrivable] = useState(false);
  const [kvaNet, setKvaNet] = useState(3860);
  const [dekraNet, setDekraNet] = useState(3910);
  const [rentalDays, setRentalDays] = useState(14);
  const [hasMobilityCover, setHasMobilityCover] = useState(true);

  if (!isOpen) return null;

  // Live evaluation logic
  const rulesEvaluated: Array<{
    rule: string;
    passed: boolean;
    status: 'PASSED' | 'FAILED' | 'TRIGGERED';
    explanation: string;
  }> = [];

  let overallDecision: 'AUTONOMOUS' | 'HUMAN_REVIEW_REQUIRED' | 'URGENT_DEADLINE' = 'AUTONOMOUS';
  let primaryAction = '';
  let generatedDraft = '';

  // Rule 1: Haftpflicht Check
  if (eventType === 'Hail' && coverage === 'Haftpflicht') {
    rulesEvaluated.push({
      rule: 'Rule 1: Coverage Check (Haftpflicht)',
      passed: false,
      status: 'FAILED',
      explanation: 'Haftpflicht does NOT cover own-car weather damage. Hail is not covered under German insurance law.'
    });
    overallDecision = 'HUMAN_REVIEW_REQUIRED';
    primaryAction = 'Quarantine & Draft Empathetic Rejection Letter';
    generatedDraft = `Dear Policyholder,\n\nThank you for reaching out. Upon reviewing your policy, it is currently registered for third-party liability (Haftpflicht) only. Regrettably, environmental storm damage requires partial cover (Teilkasko). We are therefore unable to cover these repair costs.\n\nKind regards,\nLena Huber\nKumulus Claims`;
  } else {
    rulesEvaluated.push({
      rule: 'Rule 1: Coverage Check',
      passed: true,
      status: 'PASSED',
      explanation: `Coverage ${coverage} includes weather events under Teilkasko conditions.`
    });
  }

  // Rule 3: Workshop Estimate check
  const kvaRatio = dekraNet > 0 ? (kvaNet / dekraNet) : 1;
  if (kvaNet > 0 && dekraNet > 0) {
    if (kvaRatio <= 1.10) {
      rulesEvaluated.push({
        rule: 'Rule 3: Workshop KVA <= 110% Dekra',
        passed: true,
        status: 'PASSED',
        explanation: `Estimate (€${kvaNet}) is ${(kvaRatio * 100).toFixed(1)}% of Dekra (€${dekraNet}), which is within the 110% limit.`
      });
      if (overallDecision !== 'HUMAN_REVIEW_REQUIRED') {
        overallDecision = 'AUTONOMOUS';
        primaryAction = 'Issue Written Repair Approval (Reparaturfreigabe)';
      }
    } else {
      rulesEvaluated.push({
        rule: 'Rule 3: Workshop KVA <= 110% Dekra',
        passed: false,
        status: 'FAILED',
        explanation: `Estimate (€${kvaNet}) exceeds Dekra (€${dekraNet}) by more than 10%. Requires manual renegotiation.`
      });
      overallDecision = 'HUMAN_REVIEW_REQUIRED';
      primaryAction = 'Request Workshop Justification / Re-assessment';
    }
  }

  // Rule 5: Glass Damage
  if (hasGlassDamage || isUndrivable) {
    rulesEvaluated.push({
      rule: 'Rule 5: Broken Glass / Undrivable Vehicle',
      passed: true,
      status: 'TRIGGERED',
      explanation: 'Vehicle cannot be safely operated. Trigger priority Klarsicht Autoglas on-site mobile booking.'
    });
    if (coverage !== 'Haftpflicht') {
      overallDecision = 'AUTONOMOUS';
      primaryAction = 'Dispatch Klarsicht Mobile Booking Link';
      generatedDraft = `Hello,\n\nDue to broken glass, your vehicle must not be driven. We have reserved an on-site mobile repair appointment with Klarsicht Autoglas to fix your vehicle at your location. Please confirm your address:\n\n👉 https://partner.klarsicht-autoglas.de/book\n\nKind regards,\nLena Huber`;
    }
  }

  // Rule 7: Mobility Cover
  if (rentalDays > 14) {
    rulesEvaluated.push({
      rule: 'Rule 7: Mobility Limit (14 Days)',
      passed: false,
      status: 'FAILED',
      explanation: `Rental duration of ${rentalDays} days exceeds maximum standard 14 days. Requires written Team Lead sign-off.`
    });
    overallDecision = 'HUMAN_REVIEW_REQUIRED';
    primaryAction = 'Escalate to Team Lead for Written Extension Approval';
    generatedDraft = `Hello,\n\nUnder policy guidelines, mobility cover directly covers up to 14 days. For an extension through ${rentalDays} days, I have submitted an approval request to the claims team lead and will confirm back shortly.\n\nKind regards,\nLena Huber`;
  }

  if (!primaryAction) {
    primaryAction = 'Schedule Munich Dekra Drive-In Assessment';
    generatedDraft = `Hello,\n\nYour hail claim has been verified under Teilkasko. Please choose a 15-minute slot at the Munich Dekra Drive-In Center:\n\n👉 https://dekra-termine.de/kumulus-muenchen\n\nKind regards,\nLena Huber`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Business Rule Engine Simulator</h2>
              <p className="text-xs text-slate-400">Test how the 7 Claims Handbook rules evaluate edge cases in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/90 text-sm">
          
          {/* Controls */}
          <div className="space-y-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Simulate Claim Parameters</h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Policy Coverage</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Haftpflicht', 'Teilkasko', 'Vollkasko'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCoverage(c)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      coverage === c
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Event Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Hail', 'Collision', 'Vandalism'] as const).map(e => (
                  <button
                    key={e}
                    onClick={() => setEventType(e)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      eventType === e
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={hasGlassDamage}
                  onChange={(e) => setHasGlassDamage(e.target.checked)}
                  className="rounded text-sky-500 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Broken Glass (Rule 5)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={isUndrivable}
                  onChange={(e) => setIsUndrivable(e.target.checked)}
                  className="rounded text-sky-500 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Undrivable Vehicle</span>
              </label>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Workshop KVA (€ Net)</label>
                  <input
                    type="number"
                    value={kvaNet}
                    onChange={(e) => setKvaNet(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dekra Report (€ Net)</label>
                  <input
                    type="number"
                    value={dekraNet}
                    onChange={(e) => setDekraNet(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Rental Car Days: {rentalDays} {rentalDays > 14 && <span className="text-rose-400 font-semibold">(&gt;14 days requires approval)</span>}</label>
                <input
                  type="range"
                  min="1"
                  max="28"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>

          </div>

          {/* Evaluation Results */}
          <div className="space-y-4">
            
            {/* Outcome Badge */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              overallDecision === 'AUTONOMOUS'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center space-x-3">
                {overallDecision === 'AUTONOMOUS' ? (
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Bot className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                    <UserCheck className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider opacity-75">Decision Mode</div>
                  <div className="text-base font-bold">
                    {overallDecision === 'AUTONOMOUS' ? 'AUTONOMOUS (Zero-Touch / 1-Click)' : 'HUMAN REVIEW REQUIRED'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Recommended Action</span>
              <span className="text-sm font-semibold text-white">{primaryAction}</span>
            </div>

            {/* Rule Trace */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">Handbook Rule Trace</span>
              {rulesEvaluated.map((r, i) => (
                <div key={i} className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-start space-x-2 text-xs">
                  {r.status === 'PASSED' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {r.status === 'TRIGGERED' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {r.status === 'FAILED' && <ShieldX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold text-slate-200">{r.rule}</div>
                    <div className="text-slate-400 mt-0.5">{r.explanation}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliant Generated Draft */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Rule-Engine Generated Message</span>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {generatedDraft}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end text-xs text-slate-400">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition">
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
};
