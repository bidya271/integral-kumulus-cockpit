'use client';

import React, { useState, useMemo } from 'react';
import seedData from '../data/kumulus_seed.json';
import { evaluateClaim, Claim, Policy, ClaimAssessment } from '../lib/ruleEngine';
import { Header } from '../components/Header';
import { EmergencyAlertBanner } from '../components/EmergencyAlertBanner';
import { BatchActionToolbar } from '../components/BatchActionToolbar';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';
import { ExecutiveMemoModal } from '../components/ExecutiveMemoModal';
import { WorkLogModal } from '../components/WorkLogModal';
import { RuleEngineSandbox } from '../components/RuleEngineSandbox';
import { 
  Search, Filter, ShieldAlert, ShieldCheck, Clock, CheckCircle2, 
  AlertTriangle, AlertCircle, ArrowRight, Bot, UserCheck, Merge, Sparkles, Send, RefreshCw
} from 'lucide-react';

export default function Home() {
  // Master state
  const [claims, setClaims] = useState<Claim[]>(seedData.claims as unknown as Claim[]);
  const policies = useMemo(() => seedData.policies as unknown as Policy[], []);
  const messages = useMemo(() => seedData.messages as any[], []);
  const attachments = useMemo(() => seedData.attachments as any[], []);
  const aiDrafts = useMemo(() => seedData.ai_drafts as any[], []);
  const voiceCalls = useMemo(() => seedData.voice_calls as any[], []);
  const voiceTranscripts = useMemo(() => seedData.voice_transcripts as any[], []);

  // Modals state
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  // Batch action states
  const [isAutohausApproved, setIsAutohausApproved] = useState(false);
  const [isTomClarkeEscalated, setIsTomClarkeEscalated] = useState(false);
  const [isHaftpflichtQuarantined, setIsHaftpflichtQuarantined] = useState(false);
  const [isDuplicatesMerged, setIsDuplicatesMerged] = useState(false);
  const [isReopenedArchived, setIsReopenedArchived] = useState(false);
  const [isGlassDispatched, setIsGlassDispatched] = useState(false);
  const [isDekraDispatched, setIsDekraDispatched] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'urgent' | 'human' | 'autonomous' | 'duplicates' | 'pre_storm'>('all');

  // Policy map
  const policyMap = useMemo(() => {
    const map = new Map<string, Policy>();
    for (const p of policies) {
      map.set(p.policy_id, p);
    }
    return map;
  }, [policies]);

  // Pre-evaluate rule engine for all claims
  const assessments = useMemo(() => {
    const map = new Map<string, ClaimAssessment>();
    for (const c of claims) {
      const pol = c.resolved_policy_id ? policyMap.get(c.resolved_policy_id) : undefined;
      map.set(c.claim_id, evaluateClaim(c, pol));
    }
    return map;
  }, [claims, policyMap]);

  // Handled counters & Hours Saved calculation
  const stats = useMemo(() => {
    let handled = 0;
    let hoursSaved = 0;

    if (isAutohausApproved) { handled += 1; hoursSaved += 0.5; }
    if (isTomClarkeEscalated) { handled += 1; hoursSaved += 0.5; }
    if (isHaftpflichtQuarantined) { handled += 33; hoursSaved += 8.25; }
    if (isDuplicatesMerged) { handled += 42; hoursSaved += 10.5; }
    if (isReopenedArchived) { handled += 4; hoursSaved += 1.0; }
    if (isGlassDispatched) { handled += 117; hoursSaved += 19.5; }
    if (isDekraDispatched) { handled += 39; hoursSaved += 6.5; }

    return {
      handledCount: Math.min(270, handled),
      hoursSaved
    };
  }, [
    isAutohausApproved,
    isTomClarkeEscalated,
    isHaftpflichtQuarantined,
    isDuplicatesMerged,
    isReopenedArchived,
    isGlassDispatched,
    isDekraDispatched
  ]);

  // Filtered claims list
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      // Search matching
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesQuery = 
          c.claim_id.toLowerCase().includes(query) ||
          (c.reported_plate && c.reported_plate.toLowerCase().includes(query)) ||
          (c.reported_name && c.reported_name.toLowerCase().includes(query)) ||
          (c.holder_name && c.holder_name.toLowerCase().includes(query)) ||
          (c.resolved_policy_id && c.resolved_policy_id.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      const assessment = assessments.get(c.claim_id);

      // Category filter
      if (filterCategory === 'urgent') {
        return assessment?.overallDecision === 'URGENT_DEADLINE' || c.claim_id === 'KS-26-104234' || c.claim_id === 'KS-26-104413';
      }
      if (filterCategory === 'human') {
        return assessment?.overallDecision === 'HUMAN_REVIEW_REQUIRED' || (c.is_storm_claim && c.policy_coverage === 'Haftpflicht');
      }
      if (filterCategory === 'autonomous') {
        return assessment?.overallDecision === 'AUTONOMOUS';
      }
      if (filterCategory === 'duplicates') {
        return c.is_duplicate || c.has_duplicates;
      }
      if (filterCategory === 'pre_storm') {
        return !c.is_storm_claim;
      }

      return true;
    });
  }, [claims, searchQuery, filterCategory, assessments]);

  // Selected claim details
  const selectedClaim = useMemo(() => {
    if (!selectedClaimId) return null;
    return claims.find(c => c.claim_id === selectedClaimId) || null;
  }, [selectedClaimId, claims]);

  const selectedPolicy = useMemo(() => {
    if (!selectedClaim?.resolved_policy_id) return null;
    return policyMap.get(selectedClaim.resolved_policy_id) || null;
  }, [selectedClaim, policyMap]);

  const selectedAssessment = useMemo(() => {
    if (!selectedClaimId) return null;
    return assessments.get(selectedClaimId) || null;
  }, [selectedClaimId, assessments]);

  const selectedMessages = useMemo(() => {
    if (!selectedClaimId) return [];
    return messages.filter(m => m.claim_id === selectedClaimId);
  }, [selectedClaimId, messages]);

  const selectedAttachments = useMemo(() => {
    if (!selectedClaimId) return [];
    return attachments.filter(a => a.claim_id === selectedClaimId);
  }, [selectedClaimId, attachments]);

  const selectedVoiceCall = useMemo(() => {
    if (!selectedClaimId) return null;
    return voiceCalls.find(v => v.claim_id === selectedClaimId) || null;
  }, [selectedClaimId, voiceCalls]);

  const selectedTranscripts = useMemo(() => {
    if (!selectedVoiceCall?.call_id) return [];
    return voiceTranscripts.filter(t => t.call_id === selectedVoiceCall.call_id);
  }, [selectedVoiceCall, voiceTranscripts]);

  const selectedDraft = useMemo(() => {
    if (!selectedClaimId) return null;
    return aiDrafts.find(d => d.claim_id === selectedClaimId) || null;
  }, [selectedClaimId, aiDrafts]);

  // Actions handlers
  const handleApproveAutohaus = () => {
    setIsAutohausApproved(true);
    setClaims(prev => prev.map(c => c.claim_id === 'KS-26-104234' ? { ...c, status: 'approved' } : c));
  };

  const handleEscalateTomClarke = () => {
    setIsTomClarkeEscalated(true);
    setClaims(prev => prev.map(c => c.claim_id === 'KS-26-104413' ? { ...c, status: 'in_review', notes: 'Escalated to Team Lead for mobility extension approval' } : c));
  };

  const handleQuarantineHaftpflicht = () => {
    setIsHaftpflichtQuarantined(true);
  };

  const handleMergeDuplicates = () => {
    setIsDuplicatesMerged(true);
    setClaims(prev => prev.map(c => c.is_duplicate ? { ...c, status: 'merged' } : c));
  };

  const handleArchiveReopened = () => {
    setIsReopenedArchived(true);
    setClaims(prev => prev.map(c => c.status === 'reopened' ? { ...c, status: 'closed' } : c));
  };

  const handleDispatchGlass = () => {
    setIsGlassDispatched(true);
  };

  const handleDispatchDekra = () => {
    setIsDekraDispatched(true);
  };

  const handleActionComplete = (claimId: string, actionType: string) => {
    if (claimId === 'KS-26-104234') setIsAutohausApproved(true);
    if (claimId === 'KS-26-104413') setIsTomClarkeEscalated(true);
    setClaims(prev => prev.map(c => c.claim_id === claimId ? { ...c, status: 'in_review' } : c));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        onOpenMemo={() => setIsMemoOpen(true)}
        onOpenWorkLog={() => setIsWorkLogOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        totalClaims={claims.length}
        handledCount={stats.handledCount}
        hoursSaved={stats.hoursSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Emergency Alert Banner */}
        <EmergencyAlertBanner
          onSelectClaim={(id) => setSelectedClaimId(id)}
          isAutohausApproved={isAutohausApproved}
          isTomClarkeEscalated={isTomClarkeEscalated}
          isHaftpflichtQuarantined={isHaftpflichtQuarantined}
          onApproveAutohaus={handleApproveAutohaus}
          onEscalateTomClarke={handleEscalateTomClarke}
          onQuarantineHaftpflicht={handleQuarantineHaftpflicht}
        />

        {/* Batch Action Toolbar */}
        <BatchActionToolbar
          duplicatesCount={21}
          reopenedCount={4}
          glassCount={117}
          standardHailCount={39}
          isDuplicatesMerged={isDuplicatesMerged}
          isReopenedArchived={isReopenedArchived}
          isGlassDispatched={isGlassDispatched}
          isDekraDispatched={isDekraDispatched}
          onMergeDuplicates={handleMergeDuplicates}
          onArchiveReopened={handleArchiveReopened}
          onDispatchGlass={handleDispatchGlass}
          onDispatchDekra={handleDispatchDekra}
        />

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by claim ID, plate (M-...), policy, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All (270)
            </button>
            <button
              onClick={() => setFilterCategory('urgent')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1 ${
                filterCategory === 'urgent'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Urgent (2)</span>
            </button>
            <button
              onClick={() => setFilterCategory('human')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1 ${
                filterCategory === 'human'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Human Review (35)</span>
            </button>
            <button
              onClick={() => setFilterCategory('autonomous')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1 ${
                filterCategory === 'autonomous'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Autonomous (156)</span>
            </button>
            <button
              onClick={() => setFilterCategory('duplicates')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1 ${
                filterCategory === 'duplicates'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Merge className="w-3.5 h-3.5" />
              <span>Duplicates (21)</span>
            </button>
            <button
              onClick={() => setFilterCategory('pre_storm')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filterCategory === 'pre_storm'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Pre-Storm (60)
            </button>
          </div>

        </div>

        {/* Claims Table */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Claim ID &amp; Channel</th>
                  <th className="py-3 px-4">Policyholder &amp; Vehicle</th>
                  <th className="py-3 px-4">Coverage &amp; Deductible</th>
                  <th className="py-3 px-4">Damage &amp; Anomaly Signals</th>
                  <th className="py-3 px-4">Rule Engine Decision</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No claims match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => {
                    const assessment = assessments.get(claim.claim_id);
                    const isSelected = selectedClaimId === claim.claim_id;

                    return (
                      <tr
                        key={claim.claim_id}
                        onClick={() => setSelectedClaimId(claim.claim_id)}
                        className={`cursor-pointer transition hover:bg-slate-850 ${
                          isSelected ? 'bg-sky-950/30' : 'hover:bg-slate-900/50'
                        } ${
                          claim.claim_id === 'KS-26-104234' && !isAutohausApproved ? 'bg-amber-950/20' : ''
                        } ${
                          claim.claim_id === 'KS-26-104413' && !isTomClarkeEscalated ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        {/* 1. Claim ID & Channel */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-sky-400">{claim.claim_id}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            <span className="capitalize">{claim.channel}</span>
                            <span>·</span>
                            <span>{claim.opened_at.split(' ')[1]}</span>
                          </div>
                        </td>

                        {/* 2. Policyholder & Vehicle */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">
                            {claim.holder_name || claim.reported_name || 'Unassigned'}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            <span className="font-mono text-amber-300 font-semibold">{claim.reported_plate || 'No Plate'}</span>
                            {claim.vehicle && <span>· {claim.vehicle}</span>}
                          </div>
                        </td>

                        {/* 3. Coverage & Deductible */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              claim.policy_coverage === 'Vollkasko' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              claim.policy_coverage === 'Teilkasko' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {claim.policy_coverage || 'Unlinked'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            TK Ded: €{claim.deductible_teilkasko_eur ?? 150}
                          </div>
                        </td>

                        {/* 4. Damage & Signals */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {claim.claim_id === 'KS-26-104234' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                12:00 Deadline
                              </span>
                            )}
                            {claim.claim_id === 'KS-26-104413' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Mobility &gt;14d
                              </span>
                            )}
                            {claim.is_storm_claim && claim.policy_coverage === 'Haftpflicht' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                Liability Only
                              </span>
                            )}
                            {claim.has_glass && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Broken Glass
                              </span>
                            )}
                            {claim.is_duplicate && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Duplicate
                              </span>
                            )}
                            {claim.status === 'reopened' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Courtesy Reopened
                              </span>
                            )}
                            {!claim.has_glass && claim.is_storm_claim && claim.policy_coverage !== 'Haftpflicht' && !claim.is_duplicate && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                Standard Dents
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Rule Engine Decision */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            {assessment?.overallDecision === 'URGENT_DEADLINE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Urgent Clock</span>
                              </span>
                            )}
                            {assessment?.overallDecision === 'HUMAN_REVIEW_REQUIRED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                                <UserCheck className="w-3 h-3" />
                                <span>Human Review</span>
                              </span>
                            )}
                            {assessment?.overallDecision === 'AUTONOMOUS' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <Bot className="w-3 h-3" />
                                <span>Autonomous</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 truncate max-w-xs">
                            {assessment?.primaryAction}
                          </div>
                        </td>

                        {/* 6. Action Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaimId(claim.claim_id);
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
                          >
                            Inspect
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Slide-out Claim Drawer */}
      <ClaimDetailDrawer
        claim={selectedClaim}
        policy={selectedPolicy}
        assessment={selectedAssessment}
        messages={selectedMessages}
        attachments={selectedAttachments}
        voiceCall={selectedVoiceCall}
        voiceTranscripts={selectedTranscripts}
        aiDraft={selectedDraft}
        onClose={() => setSelectedClaimId(null)}
        onActionComplete={handleActionComplete}
      />

      {/* 1-Page Executive Memo Modal */}
      <ExecutiveMemoModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
      />

      {/* Engineering Work Log Modal */}
      <WorkLogModal
        isOpen={isWorkLogOpen}
        onClose={() => setIsWorkLogOpen(false)}
      />

      {/* Rule Engine Simulator Modal */}
      <RuleEngineSandbox
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />

    </div>
  );
}
