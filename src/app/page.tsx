'use client';

import React, { useState, useMemo } from 'react';
import seedData from '../data/kumulus_seed.json';
import { evaluateClaim, Claim, Policy, ClaimAssessment } from '../lib/ruleEngine';
import { Header } from '../components/Header';
import { KPIMetricsBar } from '../components/KPIMetricsBar';
import { AttentionCenter } from '../components/AttentionCenter';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';
import { ExecutiveMemoModal } from '../components/ExecutiveMemoModal';
import { WorkLogModal } from '../components/WorkLogModal';
import { RuleEngineSandbox } from '../components/RuleEngineSandbox';
import { 
  Search, AlertTriangle, AlertCircle, Bot, UserCheck, Merge, 
  ChevronRight, Filter, Car, Phone, Mail, MessageSquare
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
    isGlassDispatched,
    isDekraDispatched
  ]);

  // Filtered claims list
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
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

  // Action handlers
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenMemo={() => setIsMemoOpen(true)}
        onOpenWorkLog={() => setIsWorkLogOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        totalClaims={claims.length}
        handledCount={stats.handledCount}
        hoursSaved={stats.hoursSaved}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        
        {/* KPI Strip */}
        <KPIMetricsBar
          totalClaims={claims.length}
          handledCount={stats.handledCount}
          hoursSaved={stats.hoursSaved}
          isAutohausApproved={isAutohausApproved}
          isHaftpflichtQuarantined={isHaftpflichtQuarantined}
        />

        {/* Attention & Action Queue */}
        <AttentionCenter
          onSelectClaim={(id) => setSelectedClaimId(id)}
          isAutohausApproved={isAutohausApproved}
          isTomClarkeEscalated={isTomClarkeEscalated}
          isHaftpflichtQuarantined={isHaftpflichtQuarantined}
          isDuplicatesMerged={isDuplicatesMerged}
          isGlassDispatched={isGlassDispatched}
          isDekraDispatched={isDekraDispatched}
          onApproveAutohaus={handleApproveAutohaus}
          onEscalateTomClarke={handleEscalateTomClarke}
          onQuarantineHaftpflicht={handleQuarantineHaftpflicht}
          onMergeDuplicates={handleMergeDuplicates}
          onDispatchGlass={handleDispatchGlass}
          onDispatchDekra={handleDispatchDekra}
        />

        {/* Claims Ledger Section */}
        <div className="space-y-3.5">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Segmented Category Filter */}
            <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  filterCategory === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (270)
              </button>
              <button
                onClick={() => setFilterCategory('urgent')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                  filterCategory === 'urgent'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Urgent (2)</span>
              </button>
              <button
                onClick={() => setFilterCategory('human')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                  filterCategory === 'human'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Human Review (35)</span>
              </button>
              <button
                onClick={() => setFilterCategory('autonomous')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                  filterCategory === 'autonomous'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Ready (156)</span>
              </button>
              <button
                onClick={() => setFilterCategory('duplicates')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                  filterCategory === 'duplicates'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-400'
                }`}
              >
                <Merge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duplicates (21)</span>
              </button>
              <button
                onClick={() => setFilterCategory('pre_storm')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  filterCategory === 'pre_storm'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pre-Storm (60)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by plate, name, claim ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

          </div>

          {/* Clean Claims Ledger Table */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-medium">Claim &amp; Channel</th>
                    <th className="py-3 px-4 font-medium">Customer &amp; Vehicle</th>
                    <th className="py-3 px-4 font-medium">Policy Coverage</th>
                    <th className="py-3 px-4 font-medium">Signals &amp; Flags</th>
                    <th className="py-3 px-4 font-medium">Rule Engine Action</th>
                    <th className="py-3 px-4 text-right font-medium">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        No claims match the active filter or query.
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
                          className={`cursor-pointer transition ${
                            isSelected 
                              ? 'bg-sky-950/40' 
                              : 'hover:bg-slate-850/50'
                          }`}
                        >
                          {/* 1. Claim & Channel */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-semibold text-sky-400">{claim.claim_id}</div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              {claim.channel === 'voice' && <Phone className="w-3 h-3 text-indigo-400" />}
                              {claim.channel === 'email' && <Mail className="w-3 h-3 text-sky-400" />}
                              {claim.channel === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                              <span className="capitalize">{claim.channel}</span>
                              <span>·</span>
                              <span>{claim.opened_at.split(' ')[1]}</span>
                            </div>
                          </td>

                          {/* 2. Customer & Vehicle */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">
                              {claim.holder_name || claim.reported_name || 'Unassigned'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-amber-300 font-medium">{claim.reported_plate || 'No Plate'}</span>
                              {claim.vehicle && <span>· {claim.vehicle}</span>}
                            </div>
                          </td>

                          {/* 3. Coverage */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              claim.policy_coverage === 'Vollkasko' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                              claim.policy_coverage === 'Teilkasko' ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20' :
                              'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}>
                              {claim.policy_coverage || 'Unlinked'}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Ded: €{claim.deductible_teilkasko_eur ?? 150}
                            </div>
                          </td>

                          {/* 4. Signals */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {claim.claim_id === 'KS-26-104234' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  12:00 Deadline
                                </span>
                              )}
                              {claim.claim_id === 'KS-26-104413' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Mobility &gt;14d
                                </span>
                              )}
                              {claim.is_storm_claim && claim.policy_coverage === 'Haftpflicht' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
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
                              {!claim.has_glass && claim.is_storm_claim && claim.policy_coverage !== 'Haftpflicht' && !claim.is_duplicate && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                  Dents Only
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Rule Engine Action */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1.5">
                              {assessment?.overallDecision === 'URGENT_DEADLINE' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Urgent Action
                                </span>
                              )}
                              {assessment?.overallDecision === 'HUMAN_REVIEW_REQUIRED' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Human Review
                                </span>
                              )}
                              {assessment?.overallDecision === 'AUTONOMOUS' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Autonomous
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 truncate max-w-xs">
                              {assessment?.primaryAction}
                            </div>
                          </td>

                          {/* 6. Action */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center space-x-0.5">
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
