'use client';

import React from 'react';
import { X, Copy, Check, Printer, ShieldAlert, Sparkles, FileText } from 'lucide-react';

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveMemoModal: React.FC<MemoModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = document.getElementById('memo-content')?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">One-Page Executive Memo</h2>
              <p className="text-xs text-slate-400">Deliverable 2: Answers to the 4 Case Questions for Lukas & Integral</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Memo Body */}
        <div id="memo-content" className="p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/90 font-sans">
          
          <div className="border-b border-slate-800 pb-4">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">KUMULUS VERSICHERUNG · PRODUCT MEMORANDUM</span>
              <span className="text-xs text-slate-400">Tuesday, 14 July 2026, 08:00 CEST</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lena’s Morning Triage & Dispatch Cockpit</h1>
            <p className="text-xs text-slate-400 mt-1">Author: Bidya Bhushan Bibhu · Senior Product Builder Candidate</p>
          </div>

          {/* Question 1 */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-sky-400 flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-xs font-mono">Q1</span>
              <span>What does your tool do for Lena this morning, and what in the data made you choose that?</span>
            </h3>
            <p>
              Lena arrives at 08:00 AM facing a <strong>30x surge (9,140 total storm claims; 270 in her queue)</strong>. If she handles claims sequentially, she faces 40+ hours of manual processing while urgent deadlines expire.
            </p>
            <p>
              Rather than an inbox or chatbot, the tool is a <strong>Rules-Driven Action Cockpit</strong> that segments her 270 claims into high-conviction batch operations and protects critical deadlines:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong>Ticking Clock Protected:</strong> Claim <code className="text-sky-300">KS-26-104234</code> (Ursula Popescu) has a workshop quote of €3,860 net (&lt; Dekra's €3,910) with a <strong>12:00 PM approval deadline</strong> to keep today's 13:00 repair slot. The tool surfaces a 1-click <em>Reparaturfreigabe</em> right at 08:00 AM.
              </li>
              <li>
                <strong>AI Hallucination Quarantined:</strong> 33 storm claims hold <em>Haftpflicht</em> only (zero hail cover under German law). The naive AI drafted false promises of coverage. The tool halts all 33 drafts immediately.
              </li>
              <li>
                <strong>Deterministic Auto-Linking:</strong> 69 claims lacked a <code className="text-slate-400">policy_id</code> at intake. The engine instantly resolved <strong>100% of them (69/69)</strong> via license plate (39), phone (55), and email (14), eliminating hours of CRM searching.
              </li>
              <li>
                <strong>Multi-Channel Deduplication:</strong> 21 duplicate claim pairs (42 claims) arose because overnight callers who received no instant SMS confirmation submitted again via app or WhatsApp. The tool merges them with 1 click, keeping the older claim.
              </li>
              <li>
                <strong>Automated Dispatch Batches:</strong> Dispatches 117 urgent glass claims (Rule 5) directly to mobile partner <em>Klarsicht Autoglas</em>, and routes 39 drivable body-dent claims to the Munich <em>Dekra Sammelbesichtigung</em> (mass inspection drive-in).
              </li>
            </ul>
          </div>

          {/* Question 2 */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-sky-400 flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-xs font-mono">Q2</span>
              <span>What did you leave out, and why?</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong>Left out automated monetary payouts:</strong> Claims Handbook Rule 1 &amp; 6 prohibit confirming cover or paying amounts over €2,000 without an official Dekra assessment. Auto-payouts in a storm environment invite catastrophic leakage.
              </li>
              <li>
                <strong>Left out automated liability/coverage rejections:</strong> Denying coverage for the 33 <em>Haftpflicht</em> policyholders has severe legal and BaFin regulatory ramifications under the German Insurance Contract Act (VVG). An AI must never unilaterally reject coverage without human oversight.
              </li>
              <li>
                <strong>Left out conversational chat interfaces:</strong> Conversing with an LLM takes 3–5 minutes per claim. Lena needs instant, deterministic batch buttons that clear 50 claims a minute, not conversational back-and-forth.
              </li>
              <li>
                <strong>Left out intake redesign:</strong> Intake already occurred overnight. Lena's job this morning is triage and dispatch.
              </li>
            </ul>
          </div>

          {/* Question 3 */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-sky-400 flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-xs font-mono">Q3</span>
              <span>Which messages may the AI send without a human, and which never?</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">✓ AI May Send Without Human</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                  <li><strong>Standard Intake Acknowledgements:</strong> Confirming receipt, quoting claim number, and stating the specific policy deductible with no liability admission.</li>
                  <li><strong>Klarsicht Glass Mobile Booking Links:</strong> For verified Teilkasko/Vollkasko with shattered glass (Rule 5).</li>
                  <li><strong>Dekra Drive-In Scheduling Invitations:</strong> Self-service time-slot selection for Munich mass hail inspections.</li>
                  <li><strong>Assessor &amp; Workshop Reminder Chasers:</strong> Automated nudges for documents already overdue.</li>
                </ul>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">✕ AI May NEVER Send Without Human</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                  <li><strong>Coverage Denials / Repudiations:</strong> E.g., telling Haftpflicht holders they are uncovered.</li>
                  <li><strong>Formal Repair Approvals (Reparaturfreigabe):</strong> Rule 3 authorizes third-party money expenditure.</li>
                  <li><strong>Mobility Extensions &gt;14 Days:</strong> E.g., Tom Clarke's request (<code className="text-rose-300">KS-26-104413</code>) requires written Team Lead approval.</li>
                  <li><strong>Any Bodily Injury (Personenschaden):</strong> Rule 2 mandates immediate 24h escalation to the injury squad with strict prohibition against discussing fault.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Question 4 */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-sky-400 flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-xs font-mono">Q4</span>
              <span>Which one number would tell Kumulus that the tool works?</span>
            </h3>
            <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-lg">
              <div className="text-lg font-bold text-white mb-1">
                Primary North Star: <span className="text-sky-300">Percentage of Kumul Claims Fully Triaged with Inspection or Glass Repair Booked within 4 Hours of Shift Start (&gt;90% by 12:00 PM)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In a catastrophe event, customer NPS and operational loss depend entirely on cycle time to first physical intervention. Measuring vanity metrics like "AI drafts generated" is useless if drafts contain errors. By 12:00 PM, Kumulus must have 100% of duplicates merged, 100% of unlinked policies resolved, 0% illegal liability promises, and 90%+ of customers booked into either Klarsicht on-site mobile glass repair or Dekra drive-in assessment slots.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <span>Submitted for Senior Product Builder Role @ Integral</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition"
          >
            Close Memo
          </button>
        </div>

      </div>
    </div>
  );
};
