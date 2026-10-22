'use client';

import React, { useState, useMemo } from 'react';
import seedData from '../data/kumulus_seed.json';
import { evaluateClaim, Claim, Policy, ClaimAssessment } from '../lib/ruleEngine';
import { Header } from '../components/Header';
import { KPIMetricsBar } from '../components/KPIMetricsBar';
import { AttentionCenter } from '../components/AttentionCenter';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';
import { WorkLogModal } from '../components/WorkLogModal';
import { RuleEngineSandbox } from '../components/RuleEngineSandbox';
import { 
  Search, AlertTriangle, AlertCircle, Bot, UserCheck, Merge, 
  ChevronRight, Filter, Car, Phone, Mail, MessageSquare,
  Shield, CheckCircle2, RotateCcw, Download, Sparkles, Layers
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
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  // Batch action states
  const [isAutohausApproved, setIsAutohausApproved] = useState(false);
  const [isTomClarkeEscalated, setIsTomClarkeEscalated] = useState(false);
  const [isHaftpflichtQuarantined, setIsHaftpflichtQuarantined] = useState(false);
  const [isDuplicatesMerged, setIsDuplicatesMerged] = useState(false);
  const [isGlassDispatched, setIsGlassDispatched] = useState(false);
  const [isDekraDispatched, setIsDekraDispatched] = useState(false);

  // Operations Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'urgent' | 'human' | 'autonomous' | 'duplicates' | 'pre_storm'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'app' | 'email' | 'voice' | 'whatsapp' | 'service_desk'>('all');
  const [filterCoverage, setFilterCoverage] = useState<'all' | 'Vollkasko' | 'Teilkasko' | 'Haftpflicht'>('all');

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
      // 1. Search Query
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

      // 2. Channel Filter
      if (filterChannel !== 'all' && c.channel !== filterChannel) {
        return false;
      }

      // 3. Coverage Filter
      if (filterCoverage !== 'all' && c.policy_coverage !== filterCoverage) {
        return false;
      }

      // 4. Category Filter
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
  }, [claims, searchQuery, filterCategory, filterChannel, filterCoverage, assessments]);

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

  const handleExportOpsReport = () => {
    const headers = [
      'Claim ID',
      'Policy ID',
      'Policy Holder',
      'License Plate',
      'Vehicle Model',
      'Coverage Type',
      'Deductible EUR',
      'Ingestion Channel',
      'Reported Time',
      'Is Storm Claim',
      'Has Glass Damage',
      'Repair Estimate EUR',
      'Is Duplicate',
      'Rule Engine Decision',
      'Primary Action',
      'Operational Flags'
    ];

    const rows = filteredClaims.map(c => {
      const assessment = assessments.get(c.claim_id);
      return [
        c.claim_id,
        c.resolved_policy_id || 'UNLINKED',
        `"${(c.holder_name || c.reported_name || 'Unknown').replace(/"/g, '""')}"`,
        c.reported_plate || '',
        `"${(c.vehicle || '').replace(/"/g, '""')}"`,
        c.policy_coverage || 'Unlinked',
        c.deductible_teilkasko_eur ?? 150,
        c.channel,
        c.opened_at,
        c.is_storm_claim ? 'YES' : 'NO',
        c.has_glass ? 'YES' : 'NO',
        c.claim_id === 'KS-26-104234' ? 3860 : (c.policy_coverage === 'Haftpflicht' && c.is_storm_claim ? 4000 : 0),
        c.is_duplicate ? 'YES' : 'NO',
        assessment?.overallDecision || 'PENDING',
        `"${(assessment?.primaryAction || '').replace(/"/g, '""')}"`,
        `"${(assessment?.evaluations || []).map(e => e.ruleCode).join('; ')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `integral_kumulus_ops_report_14jul2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterChannel('all');
    setFilterCoverage('all');
    setSearchQuery('');
  };

  const isFilterActive = filterCategory !== 'all' || filterChannel !== 'all' || filterCoverage !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-integral-midnight-900 text-integral-midnight-100 flex flex-col font-sans selection:bg-integral-copper-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenWorkLog={() => setIsWorkLogOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onExportOpsReport={handleExportOpsReport}
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
          isGlassDispatched={isGlassDispatched}
          isDekraDispatched={isDekraDispatched}
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
          
          {/* Operations Multi-Dimension Filter Bar */}
          <div className="bg-integral-midnight-800/80 border border-integral-midnight-500/20 rounded-xl p-3.5 space-y-3 shadow-xs">
            
            {/* Top row: Search input + Triage Category tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Segmented Category Filter */}
              <div className="flex items-center space-x-1.5 p-1 bg-integral-midnight-950/60 border border-integral-midnight-500/20 rounded-xl text-xs overflow-x-auto">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                    filterCategory === 'all'
                      ? 'bg-integral-copper-600 text-white shadow-xs'
                      : 'text-integral-midnight-300 hover:text-white'
                  }`}
                >
                  All (270)
                </button>
                <button
                  onClick={() => setFilterCategory('urgent')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                    filterCategory === 'urgent'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-integral-midnight-300 hover:text-amber-400'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Urgent Deadlines (2)</span>
                </button>
                <button
                  onClick={() => setFilterCategory('human')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                    filterCategory === 'human'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-integral-midnight-300 hover:text-rose-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>Human Review / Risk (35)</span>
                </button>
                <button
                  onClick={() => setFilterCategory('autonomous')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                    filterCategory === 'autonomous'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-integral-midnight-300 hover:text-emerald-400'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Autonomous Dispatches (156)</span>
                </button>
                <button
                  onClick={() => setFilterCategory('duplicates')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                    filterCategory === 'duplicates'
                      ? 'bg-integral-copper-500/20 text-integral-copper-300 border border-integral-copper-500/30'
                      : 'text-integral-midnight-300 hover:text-integral-copper-400'
                  }`}
                >
                  <Merge className="w-3.5 h-3.5 text-integral-copper-400" />
                  <span>Duplicates (21)</span>
                </button>
                <button
                  onClick={() => setFilterCategory('pre_storm')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                    filterCategory === 'pre_storm'
                      ? 'bg-integral-midnight-700 text-white shadow-xs'
                      : 'text-integral-midnight-300 hover:text-white'
                  }`}
                >
                  Pre-Storm (60)
                </button>
              </div>

              {/* Search Input */}
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 text-integral-midnight-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by plate, name, claim ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-integral-midnight-950/80 border border-integral-midnight-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-integral-midnight-400 focus:outline-none focus:border-integral-copper-500 transition"
                />
              </div>

            </div>

            {/* Bottom row: Secondary Filters (Channel + Coverage) & Active Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-integral-midnight-500/10 text-xs text-integral-midnight-300">
              
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Channel Filter Pills */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-integral-midnight-400 uppercase font-mono tracking-wider">Channel:</span>
                  <div className="flex items-center space-x-1 bg-integral-midnight-950/50 p-0.5 rounded-lg border border-integral-midnight-500/20">
                    {(['all', 'app', 'email', 'voice', 'whatsapp', 'service_desk'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setFilterChannel(ch)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          filterChannel === ch
                            ? 'bg-integral-midnight-700 text-white shadow-xs'
                            : 'text-integral-midnight-400 hover:text-integral-midnight-200'
                        }`}
                      >
                        {ch === 'all' ? 'All' : ch === 'service_desk' ? 'Desk' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coverage Filter Pills */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-integral-midnight-400 uppercase font-mono tracking-wider">Coverage:</span>
                  <div className="flex items-center space-x-1 bg-integral-midnight-950/50 p-0.5 rounded-lg border border-integral-midnight-500/20">
                    {(['all', 'Vollkasko', 'Teilkasko', 'Haftpflicht'] as const).map((cov) => (
                      <button
                        key={cov}
                        onClick={() => setFilterCoverage(cov)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          filterCoverage === cov
                            ? 'bg-integral-midnight-700 text-white shadow-xs'
                            : 'text-integral-midnight-400 hover:text-integral-midnight-200'
                        }`}
                      >
                        {cov === 'all' ? 'All' : cov}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Status & Reset */}
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-integral-midnight-300 font-mono">
                  Showing <strong className="text-white">{filteredClaims.length}</strong> of 270 claims
                </span>
                {isFilterActive && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-1 text-integral-copper-400 hover:text-integral-copper-300 underline font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Clean Claims Ledger Table */}
          <div className="bg-integral-midnight-800/60 border border-integral-midnight-500/20 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-integral-midnight-500/20 bg-integral-midnight-950/60 text-integral-midnight-300 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-medium">Claim &amp; Channel</th>
                    <th className="py-3 px-4 font-medium">Customer &amp; Vehicle</th>
                    <th className="py-3 px-4 font-medium">Policy Coverage</th>
                    <th className="py-3 px-4 font-medium">Signals &amp; Flags</th>
                    <th className="py-3 px-4 font-medium">Rule Engine Action</th>
                    <th className="py-3 px-4 text-right font-medium">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-integral-midnight-500/10">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-integral-midnight-400 text-xs">
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
                              ? 'bg-integral-midnight-700/60' 
                              : 'hover:bg-integral-midnight-700/30'
                          }`}
                        >
                          {/* 1. Claim & Channel */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-semibold text-integral-copper-400">{claim.claim_id}</div>
                            <div className="text-[11px] text-integral-midnight-300 flex items-center space-x-1.5 mt-0.5">
                              {claim.channel === 'voice' && <Phone className="w-3 h-3 text-integral-copper-400" />}
                              {claim.channel === 'email' && <Mail className="w-3 h-3 text-sky-400" />}
                              {claim.channel === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                              <span className="capitalize">{claim.channel}</span>
                              <span>·</span>
                              <span>{claim.opened_at.split(' ')[1]}</span>
                            </div>
                          </td>

                          {/* 2. Customer & Vehicle */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">
                              {claim.holder_name || claim.reported_name || 'Unassigned'}
                            </div>
                            <div className="text-[11px] text-integral-midnight-300 flex items-center space-x-1.5 mt-0.5">
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
                            <div className="text-[11px] text-integral-midnight-300 mt-0.5">
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
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-integral-copper-500/10 text-integral-copper-400 border border-integral-copper-500/20">
                                  Duplicate
                                </span>
                              )}
                              {!claim.has_glass && claim.is_storm_claim && claim.policy_coverage !== 'Haftpflicht' && !claim.is_duplicate && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-integral-midnight-700/60 text-integral-midnight-300">
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
                            <div className="text-[11px] text-integral-midnight-300 mt-1 truncate max-w-xs">
                              {assessment?.primaryAction}
                            </div>
                          </td>

                          {/* 6. Action */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-xs text-integral-copper-400 hover:text-integral-copper-300 font-medium inline-flex items-center space-x-0.5">
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
