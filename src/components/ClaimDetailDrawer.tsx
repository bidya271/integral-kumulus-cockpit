'use client';

import React, { useState } from 'react';
import { 
  X, AlertTriangle, ShieldCheck, ShieldAlert, Clock, Phone, Mail, 
  MessageSquare, FileText, CheckCircle2, User, Car, ExternalLink, 
  ArrowRight, Sparkles, Send, Edit3, Merge
} from 'lucide-react';
import { Claim, Policy, ClaimAssessment } from '../lib/ruleEngine';

interface ClaimDetailDrawerProps {
  claim: Claim | null;
  policy: Policy | null;
  assessment: ClaimAssessment | null;
  messages: any[];
  attachments: any[];
  voiceCall: any | null;
  voiceTranscripts: any[];
  aiDraft: any | null;
  onClose: () => void;
  onActionComplete: (claimId: string, actionType: string) => void;
}

export const ClaimDetailDrawer: React.FC<ClaimDetailDrawerProps> = ({
  claim,
  policy,
  assessment,
  messages,
  attachments,
  voiceCall,
  voiceTranscripts,
  aiDraft,
  onClose,
  onActionComplete
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'diff'>('overview');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');

  React.useEffect(() => {
    if (assessment?.evaluations[0]?.correctedDraft) {
      setDraftContent(assessment.evaluations[0].correctedDraft);
    } else if (aiDraft?.draft_text) {
      setDraftContent(aiDraft.draft_text);
    }
  }, [claim, assessment, aiDraft]);

  if (!claim) return null;

  const handleSendDraft = () => {
    onActionComplete(claim.claim_id, 'DRAFT_SENT');
    onClose();
  };

  const handleMergeClaim = () => {
    onActionComplete(claim.claim_id, 'CLAIM_MERGED');
    onClose();
  };

  const handleApproveRepair = () => {
    onActionComplete(claim.claim_id, 'REPAIR_APPROVED');
    onClose();
  };

  const handleEscalate = () => {
    onActionComplete(claim.claim_id, 'ESCALATED_TEAM_LEAD');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-2xl bg-white border-l border-gray-200 h-full shadow-2xl flex flex-col text-gray-900 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-base font-bold text-integral-copper-600">{claim.claim_id}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              claim.status === 'new' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
              claim.status === 'approval_requested' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              claim.status === 'reopened' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
              'bg-gray-100 text-gray-700'
            }`}>
              {claim.status}
            </span>
            {claim.is_storm_claim && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-integral-copper-700 border border-orange-200">
                Munich Hail
              </span>
            )}
          </div>

          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'overview' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Claim &amp; Policy Overview
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'diff' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Draft vs Rule Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'timeline' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Timeline &amp; Transcript ({messages.length + (voiceCall ? 1 : 0)})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Assessment Alert */}
              {assessment && (
                <div className={`p-4 rounded-xl border ${
                  assessment.overallDecision === 'URGENT_DEADLINE'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : assessment.overallDecision === 'HUMAN_REVIEW_REQUIRED'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {assessment.overallDecision === 'URGENT_DEADLINE' ? '🚨 Ticking Deadline' :
                       assessment.overallDecision === 'HUMAN_REVIEW_REQUIRED' ? '⚠️ Human Review Required' :
                       '⚡ Autonomous Execution Ready'}
                    </span>
                    <span className="text-xs font-mono font-semibold">Urgency: {assessment.urgencyScore}/100</span>
                  </div>
                  <p className="text-xs font-bold text-gray-950 mt-1">{assessment.primaryAction}</p>
                  
                  {assessment.evaluations.map((ev, idx) => (
                    <div key={idx} className="mt-2 text-xs opacity-90 border-t border-gray-200/80 pt-1.5">
                      <span className="font-semibold">{ev.ruleName}:</span> {ev.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Policy Card */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-integral-copper-600" />
                    <span>Policy Information</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-integral-copper-600">{claim.resolved_policy_id || 'UNLINKED'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Policyholder</span>
                    <span className="font-semibold text-gray-950">{claim.holder_name || claim.reported_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Vehicle</span>
                    <span className="font-semibold text-gray-950">{claim.vehicle || 'N/A'} ({claim.vehicle_year || ''})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">License Plate</span>
                    <span className="font-mono font-semibold text-gray-900 bg-gray-200/60 px-1 py-0.5 rounded border border-gray-300">{claim.reported_plate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Coverage</span>
                    <span className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                      claim.policy_coverage === 'Vollkasko' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      claim.policy_coverage === 'Teilkasko' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {claim.policy_coverage || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Teilkasko Deductible</span>
                    <span className="font-semibold text-gray-900">€{claim.deductible_teilkasko_eur ?? 150}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Mobility Cover</span>
                    <span className={`font-semibold ${claim.mobility_cover === 'yes' ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {claim.mobility_cover === 'yes' ? 'Included (Up to 14 days)' : 'Not Included'}
                    </span>
                  </div>
                </div>

                {claim.match_source && claim.match_source !== 'original' && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-xs text-sky-800">
                    ℹ️ <strong>Auto-Reconciled at 08:00:</strong> Policy was empty at intake; automatically matched via <code className="font-semibold text-sky-900">{claim.match_source}</code>.
                  </div>
                )}
              </div>

              {/* Intake Summary */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Intake Summary &amp; Damage Description</span>
                <p className="text-xs text-gray-800 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed shadow-2xs">
                  {claim.intake_summary || claim.notes || 'No intake summary recorded.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {claim.has_glass && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      Broken Glass (Rule 5)
                    </span>
                  )}
                  {claim.is_undrivable && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      Vehicle Undrivable
                    </span>
                  )}
                  {claim.is_duplicate && (
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-integral-copper-700 border border-orange-200 font-medium">
                      Duplicate of {claim.duplicate_of_claim_id}
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI DRAFT DIFF VIEWER */}
          {activeTab === 'diff' && (
            <div className="space-y-5">
              <div className="text-xs text-gray-500">
                Comparing the response drafted by the naive LLM intake bot vs. the corrected, GoBD-compliant response produced by the Kumulus Business Rule Engine.
              </div>

              {/* Naive AI Draft */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Original Naive AI Draft ({aiDraft?.draft_id || 'Pending'})</span>
                  </span>
                  <span className="text-xs text-rose-700 font-mono font-semibold">Unverified / Violations</span>
                </div>
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                  {aiDraft?.draft_text || 'No draft was generated by the naive model.'}
                </div>
              </div>

              {/* Rule Engine Corrected Draft */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Rule Engine Corrected Draft</span>
                  </span>
                  <span className="text-xs text-emerald-700 font-mono font-semibold">Compliant with Handbook Rules</span>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-gray-900 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                  {assessment?.evaluations[0]?.correctedDraft || draftContent}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1">
                <span className="font-semibold text-gray-800">Why this correction matters:</span>
                <p>
                  The naive model does not verify policy coverage before generating affirmative statements. The Rule Engine cross-references real policy tables, applies exact deductibles, verifies mobility cover limits, and injects verified partner links.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE & TRANSCRIPTS */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Omnichannel Event History</span>
              
              {/* Voice Call if available */}
              {voiceCall && (
                <div className="p-4 bg-gray-50 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Overnight Voice Agent Call ({voiceCall.call_id})</span>
                    </span>
                    <span className="text-gray-500 font-mono">{voiceCall.started_at} ({voiceCall.duration_seconds}s)</span>
                  </div>
                  <div className="text-xs text-gray-800">
                    <strong>Reported:</strong> {voiceCall.captured_damage}
                  </div>
                  
                  {voiceTranscripts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5 max-h-48 overflow-y-auto">
                      {voiceTranscripts.map((t, idx) => (
                        <div key={idx} className="text-xs">
                          <span className={`font-semibold ${t.speaker === 'Agent' ? 'text-sky-700' : 'text-amber-700'}`}>
                            {t.speaker}:
                          </span>{' '}
                          <span className="text-gray-700">{t.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages.map((m, idx) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                      {m.channel === 'email' ? <Mail className="w-3.5 h-3.5 text-sky-600" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{m.author} ({m.channel})</span>
                    </span>
                    <span className="text-gray-400 font-mono">{m.sent_at}</span>
                  </div>
                  {m.subject && <div className="font-semibold text-gray-950">{m.subject}</div>}
                  <div className="text-gray-700 whitespace-pre-wrap">{m.body}</div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Assigned to: <span className="text-gray-900 font-semibold">Lena Huber</span>
          </div>

          <div className="flex items-center space-x-2">
            {claim.claim_id === 'KS-26-104234' && (
              <button
                onClick={handleApproveRepair}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Repair (€3,860 net)</span>
              </button>
            )}

            {claim.claim_id === 'KS-26-104413' && (
              <button
                onClick={handleEscalate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Escalate to Team Lead</span>
              </button>
            )}

            {claim.is_duplicate && (
              <button
                onClick={handleMergeClaim}
                className="px-4 py-2 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              >
                <Merge className="w-4 h-4" />
                <span>Merge into {claim.duplicate_of_claim_id}</span>
              </button>
            )}

            <button
              onClick={handleSendDraft}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Corrected Reply</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
