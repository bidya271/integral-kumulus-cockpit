'use client';

import React, { useState, useMemo } from 'react';
import { 
  Claim, 
  Policy, 
  ClaimAssessment 
} from '../../lib/ruleEngine';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Bot, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Send, 
  Clock, 
  FileText, 
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  Ban
} from 'lucide-react';

interface CaseManagementViewProps {
  claims: Claim[];
  policies: Policy[];
  assessments: Map<string, ClaimAssessment>;
  messages: any[];
  attachments: any[];
  voiceCalls: any[];
  voiceTranscripts: any[];
  aiDrafts: any[];
  selectedClaimId: string | null;
  onSelectClaimId: (id: string | null) => void;
  onUpdateClaimStatus: (claimId: string, newStatus: string, notes?: string) => void;
  initialFilter?: string;
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  claims,
  policies,
  assessments,
  messages,
  attachments,
  voiceCalls,
  voiceTranscripts,
  aiDrafts,
  selectedClaimId,
  onSelectClaimId,
  onUpdateClaimStatus,
  initialFilter = 'all'
}) => {
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_review' | 'approved' | 'closed'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'app' | 'email' | 'voice' | 'whatsapp' | 'service_desk'>('all');
  const [coverageFilter, setCoverageFilter] = useState<'all' | 'Vollkasko' | 'Teilkasko' | 'Haftpflicht'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabInDetail, setActiveTabInDetail] = useState<'overview' | 'diff' | 'timeline'>('overview');
  const [handlerNotes, setHandlerNotes] = useState('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Policy map
  const policyMap = useMemo(() => {
    const map = new Map<string, Policy>();
    for (const p of policies) {
      map.set(p.policy_id, p);
    }
    return map;
  }, [policies]);

  // Sync initial filter if passed
  React.useEffect(() => {
    if (initialFilter === 'urgent') {
      setStatusFilter('in_review');
    } else if (['app', 'email', 'voice', 'whatsapp', 'desk'].includes(initialFilter)) {
      setChannelFilter(initialFilter === 'desk' ? 'service_desk' : (initialFilter as any));
    }
  }, [initialFilter]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          c.claim_id.toLowerCase().includes(q) ||
          (c.reported_plate && c.reported_plate.toLowerCase().includes(q)) ||
          (c.reported_name && c.reported_name.toLowerCase().includes(q)) ||
          (c.holder_name && c.holder_name.toLowerCase().includes(q)) ||
          (c.resolved_policy_id && c.resolved_policy_id.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status Filter
      if (statusFilter === 'open' && (c.status === 'closed' || c.status === 'approved')) return false;
      if (statusFilter === 'in_review' && c.status !== 'in_review' && c.status !== 'approval_requested') return false;
      if (statusFilter === 'approved' && c.status !== 'approved') return false;
      if (statusFilter === 'closed' && c.status !== 'closed' && c.status !== 'merged') return false;

      // 3. Channel Filter
      if (channelFilter !== 'all' && c.channel !== channelFilter) return false;

      // 4. Coverage Filter
      if (coverageFilter !== 'all' && c.policy_coverage !== coverageFilter) return false;

      return true;
    });
  }, [claims, searchQuery, statusFilter, channelFilter, coverageFilter]);

  // Auto-select first claim if none selected
  React.useEffect(() => {
    if (!selectedClaimId && filteredClaims.length > 0) {
      onSelectClaimId(filteredClaims[0].claim_id);
    }
  }, [selectedClaimId, filteredClaims, onSelectClaimId]);

  // Selected claim bundle
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

  // Populate handler notes when claim changes
  React.useEffect(() => {
    if (selectedClaim) {
      setHandlerNotes(selectedClaim.notes || '');
      setIsNotesSaved(false);
    }
  }, [selectedClaim?.claim_id]);

  const handleSaveNotes = () => {
    if (selectedClaim) {
      onUpdateClaimStatus(selectedClaim.claim_id, selectedClaim.status, handlerNotes);
      setIsNotesSaved(true);
      setTimeout(() => setIsNotesSaved(false), 2000);
    }
  };

  const resetAllFilters = () => {
    setStatusFilter('all');
    setChannelFilter('all');
    setCoverageFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      
      {/* 1. OPERATIONS FILTER BAR */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 space-y-3 shadow-xs">
        
        {/* Top: Lifecycle Status Filter + Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-gray-100/80 border border-gray-200/80 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-integral-copper-600 text-white shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              All Queue ({claims.length})
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'open'
                  ? 'bg-integral-copper-600 text-white shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Open Active ({claims.filter(c => c.status !== 'closed' && c.status !== 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('in_review')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'in_review'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                  : 'text-gray-600 hover:text-amber-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>In Review / Escalate ({claims.filter(c => c.status === 'in_review' || c.status === 'approval_requested').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold'
                  : 'text-gray-600 hover:text-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved ({claims.filter(c => c.status === 'approved').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'closed'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Closed / Merged ({claims.filter(c => c.status === 'closed' || c.status === 'merged').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plate, name, claim ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-integral-copper-500 transition"
            />
          </div>

        </div>

        {/* Secondary: Channel & Coverage breakdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Channel filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">Channel:</span>
              <div className="flex items-center space-x-1 bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60">
                {(['all', 'app', 'email', 'voice', 'whatsapp', 'service_desk'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      channelFilter === ch
                        ? 'bg-white text-gray-950 shadow-2xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {ch === 'all' ? 'All' : ch === 'service_desk' ? 'Desk' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">Coverage:</span>
              <div className="flex items-center space-x-1 bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60">
                {(['all', 'Vollkasko', 'Teilkasko', 'Haftpflicht'] as const).map(cov => (
                  <button
                    key={cov}
                    onClick={() => setCoverageFilter(cov)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      coverageFilter === cov
                        ? 'bg-white text-gray-950 shadow-2xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {cov === 'all' ? 'All' : cov}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="font-mono text-gray-500">
              Showing <strong className="text-gray-950 font-bold">{filteredClaims.length}</strong> of {claims.length} claims
            </span>
            {(statusFilter !== 'all' || channelFilter !== 'all' || coverageFilter !== 'all' || searchQuery) && (
              <button
                onClick={resetAllFilters}
                className="text-integral-copper-600 hover:text-integral-copper-700 underline font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 2. SPLIT CASE VIEW: LIST ON LEFT, DETAIL INSPECTOR ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: SCROLLABLE CLAIM LIST (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col h-[750px]">
          
          <div className="p-3 border-b border-gray-200/80 bg-gray-50/80 flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-gray-700 font-mono text-[11px]">Claims Queue</span>
            <span>Sorted by SLA urgency</span>
          </div>

          <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No claims match your filter criteria.
              </div>
            ) : (
              filteredClaims.map((claim) => {
                const assessment = assessments.get(claim.claim_id);
                const isSelected = selectedClaimId === claim.claim_id;

                return (
                  <div
                    key={claim.claim_id}
                    onClick={() => onSelectClaimId(claim.claim_id)}
                    className={`p-3.5 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-50/60 border-l-4 border-integral-copper-600'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-integral-copper-600">{claim.claim_id}</span>
                        <span className="text-[11px] text-gray-500 flex items-center space-x-1">
                          {claim.channel === 'voice' && <Phone className="w-3 h-3 text-indigo-600" />}
                          {claim.channel === 'email' && <Mail className="w-3 h-3 text-integral-copper-600" />}
                          {claim.channel === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                          <span className="capitalize">{claim.channel}</span>
                        </span>
                      </div>

                      {/* Status badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        claim.status === 'closed' || claim.status === 'merged' ? 'bg-gray-200 text-gray-700' :
                        claim.status === 'in_review' || claim.status === 'approval_requested' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}>
                        {claim.status === 'in_review' ? 'In Review' : claim.status}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-950 truncate max-w-[180px]">
                        {claim.holder_name || claim.reported_name || 'Unassigned'}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-gray-800 bg-gray-100 px-1 py-0.5 rounded border border-gray-200">
                        {claim.reported_plate || 'No Plate'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                          claim.policy_coverage === 'Vollkasko' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          claim.policy_coverage === 'Teilkasko' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {claim.policy_coverage || 'Unlinked'}
                        </span>
                        {claim.claim_id === 'KS-26-104234' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                            12:00 Deadline
                          </span>
                        )}
                        {claim.has_glass && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                            Glass
                          </span>
                        )}
                      </div>

                      <span className="text-integral-copper-600 font-medium hover:underline flex items-center space-x-0.5">
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED CASE INSPECTOR & ACTION HUB (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs h-[750px] flex flex-col">
          
          {selectedClaim ? (
            <>
              {/* Case Header */}
              <div className="px-6 py-4 border-b border-gray-200/80 bg-gray-50/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-base font-bold text-gray-950">{selectedClaim.claim_id}</span>
                    
                    {/* Status Changer Dropdown */}
                    <select
                      value={selectedClaim.status}
                      onChange={(e) => onUpdateClaimStatus(selectedClaim.claim_id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-900 shadow-2xs focus:border-integral-copper-500 focus:outline-none cursor-pointer"
                    >
                      <option value="new">Status: Open / New</option>
                      <option value="in_review">Status: In Review</option>
                      <option value="approval_requested">Status: Approval Requested</option>
                      <option value="approved">Status: Approved</option>
                      <option value="closed">Status: Closed</option>
                      <option value="merged">Status: Merged</option>
                    </select>

                    {selectedClaim.is_storm_claim && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#cf5f09] border border-orange-200">
                        Munich Storm Event
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                    <span>Opened: <strong>{selectedClaim.opened_at}</strong></span>
                    <span>·</span>
                    <span>Channel: <strong className="capitalize">{selectedClaim.channel}</strong></span>
                    <span>·</span>
                    <span>Handler: <strong className="text-gray-900 font-semibold">Lena Huber</strong></span>
                  </div>
                </div>

                {/* Quick Closure Shortcut */}
                <div className="flex items-center space-x-2">
                  {selectedClaim.status !== 'closed' ? (
                    <button
                      onClick={() => onUpdateClaimStatus(selectedClaim.claim_id, 'closed')}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition"
                    >
                      Mark as Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateClaimStatus(selectedClaim.claim_id, 'new')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition"
                    >
                      Reopen Claim
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex border-b border-gray-200 bg-white px-6 text-xs">
                <button
                  onClick={() => setActiveTabInDetail('overview')}
                  className={`py-2.5 px-4 font-semibold border-b-2 transition ${
                    activeTabInDetail === 'overview' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Policy &amp; Assessment Overview
                </button>
                <button
                  onClick={() => setActiveTabInDetail('diff')}
                  className={`py-2.5 px-4 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
                    activeTabInDetail === 'diff' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Draft vs Rule Engine Diff</span>
                </button>
                <button
                  onClick={() => setActiveTabInDetail('timeline')}
                  className={`py-2.5 px-4 font-semibold border-b-2 transition ${
                    activeTabInDetail === 'timeline' ? 'border-integral-copper-600 text-integral-copper-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Transcript &amp; Messages ({selectedMessages.length + (selectedVoiceCall ? 1 : 0)})
                </button>
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
                
                {/* TAB 1: OVERVIEW */}
                {activeTabInDetail === 'overview' && (
                  <div className="space-y-4">
                    
                    {/* Rule Engine Assessment Box */}
                    {selectedAssessment && (
                      <div className={`p-4 rounded-xl border ${
                        selectedAssessment.overallDecision === 'URGENT_DEADLINE'
                          ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                          : selectedAssessment.overallDecision === 'HUMAN_REVIEW_REQUIRED'
                          ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                          : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {selectedAssessment.overallDecision === 'URGENT_DEADLINE' ? '🚨 Ticking Deadline' :
                             selectedAssessment.overallDecision === 'HUMAN_REVIEW_REQUIRED' ? '⚠️ Human Review Required' :
                             '⚡ Autonomous Execution Ready'}
                          </span>
                          <span className="text-xs font-mono font-bold">Urgency Score: {selectedAssessment.urgencyScore}/100</span>
                        </div>
                        <p className="text-xs font-bold text-gray-950 mt-1">{selectedAssessment.primaryAction}</p>

                        {selectedAssessment.evaluations.map((ev, idx) => (
                          <div key={idx} className="mt-2 text-xs opacity-90 border-t border-gray-200/60 pt-1.5">
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
                          <span>Policy Record &amp; Reconciled Coverage</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-integral-copper-600">
                          {selectedClaim.resolved_policy_id || 'UNLINKED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 block">Policyholder</span>
                          <span className="font-bold text-gray-950">{selectedClaim.holder_name || selectedClaim.reported_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Vehicle Model</span>
                          <span className="font-bold text-gray-950">{selectedClaim.vehicle || 'N/A'} ({selectedClaim.vehicle_year || ''})</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">License Plate</span>
                          <span className="font-mono font-bold text-gray-900 bg-gray-200/60 px-1 py-0.5 rounded border border-gray-300">
                            {selectedClaim.reported_plate || 'No Plate'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Coverage Level</span>
                          <span className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                            selectedClaim.policy_coverage === 'Vollkasko' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            selectedClaim.policy_coverage === 'Teilkasko' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                            'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {selectedClaim.policy_coverage || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Teilkasko Deductible</span>
                          <span className="font-bold text-gray-900">€{selectedClaim.deductible_teilkasko_eur ?? 150}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Mobility Cover</span>
                          <span className={`font-semibold ${selectedClaim.mobility_cover === 'yes' ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {selectedClaim.mobility_cover === 'yes' ? 'Included (Max 14 days)' : 'Not Included'}
                          </span>
                        </div>
                      </div>

                      {selectedClaim.match_source && selectedClaim.match_source !== 'original' && (
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-xs text-sky-800">
                          ℹ️ <strong>Deterministic Auto-Reconciliation:</strong> Policy was empty at intake; automatically resolved via <code className="font-bold text-sky-900">{selectedClaim.match_source}</code> match.
                        </div>
                      )}
                    </div>

                    {/* Handler Operational Notes Field */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Handler Internal Notes &amp; Actions Log</span>
                        {isNotesSaved && (
                          <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={handlerNotes}
                        onChange={(e) => setHandlerNotes(e.target.value)}
                        placeholder="Add notes on phone contact, workshop calls, or manager escalation..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-integral-copper-500"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveNotes}
                          className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: AI DRAFT DIFF */}
                {activeTabInDetail === 'diff' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Comparing the naive generative LLM draft vs. the GoBD-compliant response produced by the Kumulus Business Rule Engine:
                    </p>

                    {/* Naive AI Draft */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1.5">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Original Naive AI Draft ({selectedDraft?.draft_id || 'Pending'})</span>
                        </span>
                        <span className="text-xs text-rose-700 font-mono font-bold">Unverified / Violations</span>
                      </div>
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                        {selectedDraft?.draft_text || 'No draft was generated by the naive model.'}
                      </div>
                    </div>

                    {/* Rule Engine Corrected Draft */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Rule Engine Corrected Response</span>
                        </span>
                        <span className="text-xs text-emerald-700 font-mono font-bold">Policy &amp; Handbook Compliant</span>
                      </div>
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-gray-900 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                        {selectedAssessment?.evaluations[0]?.correctedDraft || selectedDraft?.draft_text || 'Rule Engine verified.'}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
                      <strong>Audit Note:</strong> Naive AI models blindly promise coverage without verifying coverage tables or workshop quotes. The Kumulus Rule Engine prevents unapproved financial commitments.
                    </div>
                  </div>
                )}

                {/* TAB 3: TIMELINE & MESSAGES */}
                {activeTabInDetail === 'timeline' && (
                  <div className="space-y-4">
                    
                    {/* Voice Call */}
                    {selectedVoiceCall && (
                      <div className="p-4 bg-gray-50 border border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700 flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>Voice Call ({selectedVoiceCall.call_id})</span>
                          </span>
                          <span className="text-gray-500 font-mono">{selectedVoiceCall.started_at} ({selectedVoiceCall.duration_seconds}s)</span>
                        </div>
                        <div className="text-xs text-gray-800">
                          <strong>Reported Damage:</strong> {selectedVoiceCall.captured_damage}
                        </div>

                        {selectedTranscripts.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5 max-h-48 overflow-y-auto">
                            {selectedTranscripts.map((t, idx) => (
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
                    {selectedMessages.map((m, idx) => (
                      <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                            {m.channel === 'email' ? <Mail className="w-3.5 h-3.5 text-integral-copper-600" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{m.author} ({m.channel})</span>
                          </span>
                          <span className="text-gray-400 font-mono">{m.sent_at}</span>
                        </div>
                        {m.subject && <div className="font-bold text-gray-950">{m.subject}</div>}
                        <div className="text-gray-700 whitespace-pre-wrap">{m.body}</div>
                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* Action Bar Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Current Status: <strong className="text-gray-900 uppercase font-mono">{selectedClaim.status}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedClaim.claim_id === 'KS-26-104234' && (
                    <button
                      onClick={() => onUpdateClaimStatus(selectedClaim.claim_id, 'approved', 'Autohaus Brandl Freigabe approved before 12:00 PM')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve (€3,860 net)</span>
                    </button>
                  )}

                  {selectedClaim.claim_id === 'KS-26-104413' && (
                    <button
                      onClick={() => onUpdateClaimStatus(selectedClaim.claim_id, 'in_review', 'Escalated to Team Lead for rental overage')}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Escalate to Lead</span>
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateClaimStatus(selectedClaim.claim_id, 'in_review', 'Sent corrected rule-engine reply')}
                    className="px-3.5 py-2 bg-integral-copper-600 hover:bg-integral-copper-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Verified Reply</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Select a claim on the left to inspect and take operational actions.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};