'use client';

import React, { useState, useMemo } from 'react';
import seedData from '../data/kumulus_seed.json';
import { evaluateClaim, Claim, Policy, ClaimAssessment } from '../lib/ruleEngine';
import { Sidebar, NavTab } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { DashboardView } from '../components/views/DashboardView';
import { CaseManagementView } from '../components/views/CaseManagementView';
import { AiStudioView } from '../components/views/AiStudioView';
import { RulesEngineView } from '../components/views/RulesEngineView';
import { WorkLogModal } from '../components/WorkLogModal';

export default function Home() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [initialCaseFilter, setInitialCaseFilter] = useState<string | undefined>(undefined);

  // Master Claims & Policies State
  const [claims, setClaims] = useState<Claim[]>(seedData.claims as unknown as Claim[]);
  const [messages, setMessages] = useState<any[]>(seedData.messages as any[]);
  const policies = useMemo(() => seedData.policies as unknown as Policy[], []);
  const attachments = useMemo(() => seedData.attachments as any[], []);
  const aiDrafts = useMemo(() => seedData.ai_drafts as any[], []);
  const voiceCalls = useMemo(() => seedData.voice_calls as any[], []);
  const voiceTranscripts = useMemo(() => seedData.voice_transcripts as any[], []);

  // Modals & Inspection State
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>('KS-26-104234');
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Operational Batch Action states
  const [isAutohausApproved, setIsAutohausApproved] = useState(false);
  const [isTomClarkeEscalated, setIsTomClarkeEscalated] = useState(false);
  const [isHaftpflichtQuarantined, setIsHaftpflichtQuarantined] = useState(false);
  const [isDuplicatesMerged, setIsDuplicatesMerged] = useState(false);
  const [isGlassDispatched, setIsGlassDispatched] = useState(false);
  const [isDekraDispatched, setIsDekraDispatched] = useState(false);

  // Hydrate state from localStorage on browser mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('kumulus_claims_cockpit_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.claims && Array.isArray(parsed.claims)) setClaims(parsed.claims);
        if (parsed.messages && Array.isArray(parsed.messages)) setMessages(parsed.messages);
        if (parsed.isAutohausApproved !== undefined) setIsAutohausApproved(parsed.isAutohausApproved);
        if (parsed.isTomClarkeEscalated !== undefined) setIsTomClarkeEscalated(parsed.isTomClarkeEscalated);
        if (parsed.isHaftpflichtQuarantined !== undefined) setIsHaftpflichtQuarantined(parsed.isHaftpflichtQuarantined);
        if (parsed.isDuplicatesMerged !== undefined) setIsDuplicatesMerged(parsed.isDuplicatesMerged);
        if (parsed.isGlassDispatched !== undefined) setIsGlassDispatched(parsed.isGlassDispatched);
        if (parsed.isDekraDispatched !== undefined) setIsDekraDispatched(parsed.isDekraDispatched);
      }
    } catch (e) {
      console.error('LocalStorage hydration error:', e);
    }
  }, []);

  // Persist modifications to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('kumulus_claims_cockpit_v2', JSON.stringify({
        claims,
        messages,
        isAutohausApproved,
        isTomClarkeEscalated,
        isHaftpflichtQuarantined,
        isDuplicatesMerged,
        isGlassDispatched,
        isDekraDispatched
      }));
    } catch (e) {}
  }, [claims, messages, isAutohausApproved, isTomClarkeEscalated, isHaftpflichtQuarantined, isDuplicatesMerged, isGlassDispatched, isDekraDispatched]);

  // Policy map lookup
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

  // Priority & Urgent claim counts for badges
  const openCasesCount = useMemo(() => {
    return claims.filter(c => c.status !== 'closed' && c.status !== 'merged').length;
  }, [claims]);

  const urgentCasesCount = useMemo(() => {
    let count = 0;
    if (!isAutohausApproved) count += 1;
    if (!isTomClarkeEscalated) count += 1;
    return count;
  }, [isAutohausApproved, isTomClarkeEscalated]);

  // Handlers for Batch Actions (Fully Reversible / Toggleable)
  const handleApproveAutohaus = () => {
    if (isAutohausApproved) {
      setIsAutohausApproved(false);
      setClaims(prev => prev.map(c => 
        c.claim_id === 'KS-26-104234' ? { ...c, status: 'new', notes: undefined } : c
      ));
    } else {
      setIsAutohausApproved(true);
      setClaims(prev => prev.map(c => 
        c.claim_id === 'KS-26-104234' ? { ...c, status: 'approved', notes: 'KVA €3,860 verified <= Dekra €3,910. Approved slot 13:00.' } : c
      ));
    }
  };

  const handleEscalateTomClarke = () => {
    if (isTomClarkeEscalated) {
      setIsTomClarkeEscalated(false);
      setClaims(prev => prev.map(c => 
        c.claim_id === 'KS-26-104413' ? { ...c, status: 'new', notes: undefined } : c
      ));
    } else {
      setIsTomClarkeEscalated(true);
      setClaims(prev => prev.map(c => 
        c.claim_id === 'KS-26-104413' ? { ...c, status: 'in_review', notes: 'Escalated to Team Lead: Requested 21-day rental exceeds 14-day limit.' } : c
      ));
    }
  };

  const handleQuarantineHaftpflicht = () => {
    if (isHaftpflichtQuarantined) {
      setIsHaftpflichtQuarantined(false);
      setClaims(prev => prev.map(c => {
        if (c.policy_coverage === 'Haftpflicht' && c.is_storm_claim) {
          return { ...c, status: 'new', notes: undefined };
        }
        return c;
      }));
    } else {
      setIsHaftpflichtQuarantined(true);
      setClaims(prev => prev.map(c => {
        if (c.policy_coverage === 'Haftpflicht' && c.is_storm_claim) {
          return { ...c, status: 'in_review', notes: 'Quarantined: Haftpflicht excludes hail storm damage (€4k leakage prevented).' };
        }
        return c;
      }));
    }
  };

  const handleMergeDuplicates = () => {
    if (isDuplicatesMerged) {
      setIsDuplicatesMerged(false);
      setClaims(prev => prev.map(c => c.is_duplicate ? { ...c, status: 'new', notes: undefined } : c));
    } else {
      setIsDuplicatesMerged(true);
      setClaims(prev => prev.map(c => c.is_duplicate ? { ...c, status: 'merged', notes: 'Auto-merged duplicate FNOL record.' } : c));
    }
  };

  const handleDispatchGlass = () => {
    if (isGlassDispatched) {
      setIsGlassDispatched(false);
      setClaims(prev => prev.map(c => 
        (c.has_glass && c.policy_coverage !== 'Haftpflicht') ? { ...c, notes: undefined } : c
      ));
    } else {
      setIsGlassDispatched(true);
      setClaims(prev => prev.map(c => 
        (c.has_glass && c.policy_coverage !== 'Haftpflicht') ? { ...c, notes: 'Dispatched to Klarsicht Autoglas partner on-site service.' } : c
      ));
    }
  };

  const handleDispatchDekra = () => {
    if (isDekraDispatched) {
      setIsDekraDispatched(false);
      setClaims(prev => prev.map(c => 
        (c.is_storm_claim && !c.has_glass && c.policy_coverage !== 'Haftpflicht') ? { ...c, notes: undefined } : c
      ));
    } else {
      setIsDekraDispatched(true);
      setClaims(prev => prev.map(c => 
        (c.is_storm_claim && !c.has_glass && c.policy_coverage !== 'Haftpflicht') ? { ...c, notes: 'Dispatched to Munich Olympia-Park Dekra Drive-In mass appraisal hub.' } : c
      ));
    }
  };

  // Revert / Reset Entire State back to 08:00 AM Morning Condition
  const handleResetAllState = () => {
    try {
      localStorage.removeItem('kumulus_claims_cockpit_v2');
    } catch (e) {}
    setClaims(seedData.claims as unknown as Claim[]);
    setMessages(seedData.messages as any[]);
    setIsAutohausApproved(false);
    setIsTomClarkeEscalated(false);
    setIsHaftpflichtQuarantined(false);
    setIsDuplicatesMerged(false);
    setIsGlassDispatched(false);
    setIsDekraDispatched(false);
    setSelectedClaimId('KS-26-104234');
  };

  // Dispatch outgoing message and log into claim conversation
  const handleSendMessage = (claimId: string, content: string, channel: string = 'email') => {
    const timeStr = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      message_id: `msg-live-${Date.now()}`,
      claim_id: claimId,
      direction: 'outgoing',
      channel: channel,
      author: 'Lena Huber (Senior Adjuster)',
      sender_name: 'Lena Huber (Desk #4)',
      sender_type: 'handler',
      sent_at: `${timeStr} CEST`,
      timestamp: `${timeStr} CEST`,
      content: content,
      body: content,
      delivery_status: 'Delivered',
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Track if any modification has been made
  const hasModifications = useMemo(() => {
    if (isAutohausApproved || isTomClarkeEscalated || isHaftpflichtQuarantined || isDuplicatesMerged || isGlassDispatched || isDekraDispatched) {
      return true;
    }
    return claims.some((c, idx) => {
      const orig = (seedData.claims as unknown as Claim[])[idx];
      return orig && (c.status !== orig.status || c.notes !== orig.notes);
    });
  }, [isAutohausApproved, isTomClarkeEscalated, isHaftpflichtQuarantined, isDuplicatesMerged, isGlassDispatched, isDekraDispatched, claims]);

  // Lifecycle status update handler for individual claims
  const handleUpdateClaimStatus = (claimId: string, newStatus: string, notes?: string) => {
    setClaims(prev => prev.map(c => {
      if (c.claim_id === claimId) {
        return {
          ...c,
          status: newStatus,
          notes: notes !== undefined ? notes : c.notes
        };
      }
      return c;
    }));
  };

  // Navigating between views
  const handleNavigateToCases = (filter?: string) => {
    setInitialCaseFilter(filter);
    setActiveTab('cases');
  };

  const handleSelectClaimFromDashboard = (claimId: string) => {
    setSelectedClaimId(claimId);
    setActiveTab('cases');
  };

  // CSV Ops Export
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
      'Status',
      'Is Storm Claim',
      'Has Glass Damage',
      'Repair Estimate EUR',
      'Is Duplicate',
      'Rule Engine Decision',
      'Primary Action',
      'Handler Notes'
    ];

    const rows = claims.map(c => {
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
        c.status || 'open',
        c.is_storm_claim ? 'YES' : 'NO',
        c.has_glass ? 'YES' : 'NO',
        c.claim_id === 'KS-26-104234' ? 3860 : (c.policy_coverage === 'Haftpflicht' && c.is_storm_claim ? 4000 : 0),
        c.is_duplicate ? 'YES' : 'NO',
        assessment?.overallDecision || 'PENDING',
        `"${(assessment?.primaryAction || '').replace(/"/g, '""')}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`
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

  return (
    <div className="flex h-screen bg-[#f7f7f8] text-[#020714] font-sans antialiased overflow-hidden selection:bg-[#cf5f09] selection:text-white">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenWorkLog={() => setIsWorkLogOpen(true)}
        openCasesCount={openCasesCount}
        urgentCasesCount={urgentCasesCount}
      />

      {/* 2. Main Platform Shell (TopNav + Dynamic View Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopNav
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportOpsReport={handleExportOpsReport}
          totalClaimsCount={claims.length}
          hasModifications={hasModifications}
          onResetAllState={handleResetAllState}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
              <DashboardView
                claims={claims}
                assessments={assessments}
                stats={stats}
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
                onNavigateToCases={handleNavigateToCases}
                onSelectClaim={handleSelectClaimFromDashboard}
              />
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="h-full flex flex-col">
              <CaseManagementView
                claims={claims}
                policies={policies}
                assessments={assessments}
                messages={messages}
                attachments={attachments}
                voiceCalls={voiceCalls}
                voiceTranscripts={voiceTranscripts}
                aiDrafts={aiDrafts}
                selectedClaimId={selectedClaimId}
                onSelectClaimId={setSelectedClaimId}
                onUpdateClaimStatus={handleUpdateClaimStatus}
                onSendMessage={handleSendMessage}
                initialFilter={initialCaseFilter}
              />
            </div>
          )}

          {activeTab === 'ai_studio' && (
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
              <AiStudioView
                claims={claims}
                policies={policies}
              />
            </div>
          )}

          {activeTab === 'rules_engine' && (
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
              <RulesEngineView
                claims={claims}
                policies={policies}
              />
            </div>
          )}
        </main>
      </div>

      {/* GoBD Audit & Work Log Drawer Modal */}
      <WorkLogModal
        isOpen={isWorkLogOpen}
        onClose={() => setIsWorkLogOpen(false)}
      />
    </div>
  );
}
