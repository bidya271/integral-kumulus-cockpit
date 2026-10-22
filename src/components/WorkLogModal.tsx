'use client';

import React from 'react';
import { X, Terminal, Cpu, Code2, Database, GitCommit, CheckCircle2 } from 'lucide-react';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkLogModal: React.FC<WorkLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Engineering Work Log & Tooling Audit</h2>
              <p className="text-xs text-slate-400">Deliverable 3: Transparent breakdown of tools, data analysis scripts, and AI-assisted workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed font-sans bg-slate-900/90">
          
          {/* Toolchain Used */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <span>1. Technical Toolchain & AI Stack</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="text-xs font-semibold text-white block mb-1">Cursor & Claude Max</span>
                <p className="text-xs text-slate-400">Used as the core builder agent for rapid prototyping, schema design, script generation, and UI architecture.</p>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="text-xs font-semibold text-white block mb-1">Python, uv & openpyxl</span>
                <p className="text-xs text-slate-400">Used for instant parsing and deterministic reconciliation across the 8 sheets of the 4MB Excel data pack.</p>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="text-xs font-semibold text-white block mb-1">Next.js 14, React & Tailwind</span>
                <p className="text-xs text-slate-400">Full-stack React framework with stateful in-memory dispatch engine and Lucide icon system.</p>
              </div>
            </div>
          </div>

          {/* Workflow Chronology */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>2. Discovery & Development Chronology</span>
            </h3>
            
            <div className="space-y-3">
              
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Phase 1: Ingesting & Verifying the 4 Data Files</span>
                  </span>
                  <span className="text-slate-500">20 min</span>
                </div>
                <p className="text-xs text-slate-300">
                  Unpacked the archive and analyzed all four files: <code className="text-slate-200">Kumulus - Claims Export 14 July 2026.xlsx</code>, <code className="text-slate-200">Kumulus - Claims Handbook.docx</code>, <code className="text-slate-200">raw-upload.xlsx</code>, and <code className="text-slate-200">raw-upload(1).xlsx</code>.
                  Wrote an MD5 hash verification script proving <code className="text-slate-200">raw-upload.xlsx</code> and <code className="text-slate-200">raw-upload(1).xlsx</code> are byte-for-byte identical, with identical row counts across all 7 operational tabs.
                </p>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Phase 2: Deep Data Audit & Landmine Discovery</span>
                  </span>
                  <span className="text-slate-500">45 min</span>
                </div>
                <p className="text-xs text-slate-300">
                  Built a targeted Python query suite that surfaced the hidden traps:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                  <li>Discovered the 12:00 PM Autohaus Brandl workshop deadline in claim <code className="text-sky-300">KS-26-104234</code>.</li>
                  <li>Discovered the illegal rental car extension promise drafted by the AI for Tom Clarke (<code className="text-sky-300">KS-26-104413</code>).</li>
                  <li>Discovered that 69 unlinked claims can be 100% deterministically matched to policies by license plate, phone, and email.</li>
                  <li>Identified 33 liability-only (Haftpflicht) claims where the AI drafted false promises of payment.</li>
                  <li>Discovered 21 duplicate claim pairs created by confused multi-channel customer submissions.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Phase 3: Business Rule Engine Design</span>
                  </span>
                  <span className="text-slate-500">30 min</span>
                </div>
                <p className="text-xs text-slate-300">
                  Formalized the 7 Claims Handbook rules into an explicit TypeScript evaluation engine. Defined the strict boundary between autonomous execution vs human review, ensuring GoBD auditability and zero unapproved financial exposure.
                </p>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Phase 4: Full-Stack Cockpit Construction & Seed Extraction</span>
                  </span>
                  <span className="text-slate-500">60 min</span>
                </div>
                <p className="text-xs text-slate-300">
                  Exported the verified 270 claims dataset to <code className="text-slate-200">src/data/kumulus_seed.json</code>. Built interactive components for emergency deadline alerts, one-click batch triage, an AI draft diff viewer, and a live Rule Engine Sandbox.
                </p>
              </div>

            </div>
          </div>

          {/* Sample Prompts */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>3. Sample Prompts Used During Development</span>
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-slate-500">// Prompt 1: Discovery of Unlinked Claims</p>
              <p className="text-emerald-400">
                &quot;Analyze the 69 claims where policy_id is NaN in the claims sheet. Write a script checking if reported_plate, reported_phone, or reported_email exist in the policies table. What percentage can be resolved deterministically?&quot;
              </p>
              <p className="text-slate-500">// Prompt 2: Anomaly Detection on Pending Drafts</p>
              <p className="text-emerald-400">
                &quot;Audit all 213 pending drafts in ai_drafts against the policy coverage of the corresponding resolved policy. Check specifically for Haftpflicht policies where the AI confirmed hail coverage, and check for workshop approval deadlines in recent inbound messages.&quot;
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <span>Full commit history available on GitHub repository</span>
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition">
            Close Work Log
          </button>
        </div>

      </div>
    </div>
  );
};
