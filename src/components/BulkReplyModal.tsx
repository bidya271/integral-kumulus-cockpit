'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Users, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  CheckSquare, 
  Square,
  ShieldAlert
} from 'lucide-react';
import { Claim, Policy } from '../lib/ruleEngine';

export type BulkClusterType = 'glass' | 'haftpflicht' | 'duplicates' | 'dekra';

interface BulkReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCluster?: BulkClusterType;
  claims: Claim[];
  policies: Policy[];
  onExecuteBulkDispatch: (
    cluster: BulkClusterType, 
    selectedClaimIds: string[], 
    subject: string, 
    templateBody: string
  ) => void;
}

export const BulkReplyModal: React.FC<BulkReplyModalProps> = ({
  isOpen,
  onClose,
  initialCluster = 'glass',
  claims,
  policies,
  onExecuteBulkDispatch
}) => {
  const [activeCluster, setActiveCluster] = useState<BulkClusterType>(initialCluster);

  // Sync cluster if initialCluster changes
  React.useEffect(() => {
    if (initialCluster) {
      setActiveCluster(initialCluster);
    }
  }, [initialCluster]);

  // Target cluster claims
  const clusterClaims = useMemo(() => {
    switch (activeCluster) {
      case 'glass':
        return claims.filter(c => c.is_storm_claim && c.has_glass && c.policy_coverage !== 'Haftpflicht');
      case 'haftpflicht':
        return claims.filter(c => c.is_storm_claim && c.policy_coverage === 'Haftpflicht');
      case 'duplicates':
        return claims.filter(c => c.is_duplicate);
      case 'dekra':
        return claims.filter(c => c.is_storm_claim && !c.has_glass && c.policy_coverage !== 'Haftpflicht' && !c.is_duplicate);
      default:
        return [];
    }
  }, [activeCluster, claims]);

  // Selected recipients state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Whenever cluster changes, select all matching by default
  React.useEffect(() => {
    setSelectedIds(new Set(clusterClaims.map(c => c.claim_id)));
  }, [clusterClaims]);

  // Toggle single recipient
  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === clusterClaims.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clusterClaims.map(c => c.claim_id)));
    }
  };

  // Preset Template Configurations
  const templates: Record<BulkClusterType, {
    title: string;
    subtitle: string;
    icon: any;
    ruleCode: string;
    ruleName: string;
    badgeStyle: string;
    subject: string;
    body: string;
    sampleClaimId: string;
  }> = {
    glass: {
      title: 'Broken Glass & Roadworthiness Emergency',
      subtitle: 'Dispatch on-site mobile booking links to partner Klarsicht Autoglas',
      icon: Send,
      ruleCode: 'RULE_5_GLASS_EMERGENCY',
      ruleName: 'Rule 5: Glass Damage & Roadworthiness',
      badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      subject: 'Kumulus Schaden {{claim_id}} · Wichtige Information: Vor-Ort-Reparatur Klarsicht Autoglas',
      body: `Guten Tag {{customer_name}},

wir haben Ihre Schadenmeldung zum Hagelunwetter in München erhalten. 

Da Ihr Fahrzeug ({{plate}}) Schäden an der Verglasung aufweist, ist es gemäß Sicherheitsrichtlinien und StVZO vorübergehend nicht verkehrssicher. Bitte fahren Sie das Fahrzeug nicht selbst in eine Werkstatt.

Um die Reparatur schnellstmöglich durchzuführen, haben wir für Sie unseren mobilen Partner Klarsicht Autoglas beauftragt. Ein Techniker repariert Ihr Fahrzeug direkt vor Ort an Ihrer Adresse:

👉 https://partner.klarsicht-autoglas.de/book?claim={{claim_id}}&deductible={{deductible}}

Für diesen Schaden gilt Ihre vereinbarte Teilkasko-Selbstbeteiligung von {{deductible}}. Die Abrechnung erfolgt direkt zwischen Klarsicht und Kumulus.

Mit freundlichen Grüßen
Lena Huber
Kumulus Versicherungs AG · Schaden-Direktion München`,
      sampleClaimId: 'KS-26-104250'
    },
    haftpflicht: {
      title: 'Haftpflicht Storm Hazard Quarantine',
      subtitle: 'Halt false AI coverage promises and send legally sound exclusion notices',
      icon: ShieldAlert,
      ruleCode: 'RULE_1_HAFTPFLICHT_HAZARD',
      ruleName: 'Rule 1: Coverage Verification (Haftpflicht)',
      badgeStyle: 'bg-rose-100 text-rose-900 border-rose-300',
      subject: 'Kumulus Schaden {{claim_id}} · Ihre Schadenmeldung vom 14. Juli 2026',
      body: `Guten Tag {{customer_name}},

vielen Dank für Ihre Kontaktaufnahme bezüglich des gestrigen Hagelereignisses. 

Ich habe Ihren Vertrag (Versicherungsschein {{policy_id}}) für das Fahrzeug {{plate}} sorgfältig geprüft. Ihr Versicherungsschutz umfasst aktuell eine reine Kfz-Haftpflichtversicherung. 

Diese deckt gesetzliche Schäden ab, die Sie mit dem Fahrzeug Dritten zufügen. Schäden am eigenen Fahrzeug durch Elementarereignisse (wie Hagel, Sturm oder Blitzschlag) fallen gesetzlich unter den Teilkaskoschutz, der für dieses Fahrzeug nicht vereinbart ist.

Aus diesem Grund können wir die Reparaturkosten bedauerlicherweise nicht übernehmen. Sollten Sie Fragen zu Ihrem Vertrag haben oder eine Umstellung auf Kaskodeckung für die Zukunft wünschen, beraten wir Sie gerne.

Mit freundlichen Grüßen
Lena Huber
Kumulus Versicherungs AG · Schaden-Direktion München`,
      sampleClaimId: 'KS-26-104289'
    },
    duplicates: {
      title: 'Multi-Channel Duplicate Consolidation',
      subtitle: 'Merge redundant WhatsApp/App filings and suppress duplicate notifications',
      icon: Users,
      ruleCode: 'RULE_4_DUPLICATE_MERGE',
      ruleName: 'Rule 4: Multi-Channel Deduplication',
      badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      subject: 'Kumulus Schaden {{claim_id}} · Konsolidierung Ihrer Schadenmeldung',
      body: `Guten Tag {{customer_name}},

wir bestätigen den Eingang Ihrer weiteren Mitteilung zum Hagelschaden an Ihrem Fahrzeug {{plate}}. 

Ihr Vorgang wurde bereits unter dem Aktenzeichen {{claim_id}} erfasst und wird von mir persönlich bearbeitet. Um Mehrfachanfragen zu vermeiden, haben wir Ihre parallelen Eingaben gebündelt. 

Sie erhalten alle Updates und Termine zentral über diesen Nachrichtenkanal. Sie müssen keine weiteren Meldungen einreichen.

Mit freundlichen Grüßen
Lena Huber
Kumulus Versicherungs AG · Schaden-Direktion München`,
      sampleClaimId: 'KS-26-104300'
    },
    dekra: {
      title: 'Dekra Drive-In Mass Assessment Hub',
      subtitle: 'Schedule drivable vehicles with body dents into Munich Olympia-Park',
      icon: CheckSquare,
      ruleCode: 'RULE_6_DEKRA_MASS_ASSESSMENT',
      ruleName: 'Rule 6: Mass Hail Assessment (Sammelbesichtigung)',
      badgeStyle: 'bg-sky-100 text-sky-900 border-sky-300',
      subject: 'Kumulus Schaden {{claim_id}} · Einladung zur Dekra Sammelbesichtigung München',
      body: `Guten Tag {{customer_name}},

vielen Dank für Ihre Schadenmeldung. Der Hagelschaden an Ihrem fahrbereiten Fahrzeug {{plate}} ist über Ihre Teilkasko (Selbstbeteiligung: {{deductible}}) versichert.

Um eine Begutachtung ohne wochenlange Werkstattwartezeiten zu gewährleisten, haben Kumulus und Dekra ein zentrales Drive-In Prüfzentrum im Münchner Olympiapark eingerichtet. Bitte wählen Sie hier Ihren persönlichen 15-Minuten-Termin:

👉 https://dekra-termine.de/kumulus-muenchen?claim={{claim_id}}

Ein Dekra-Sachverständiger vermisst die Hageldellen per Scanner vor Ort, und wir erstellen direkt Ihr Schadengutachten.

Mit freundlichen Grüßen
Lena Huber
Kumulus Versicherungs AG · Schaden-Direktion München`,
      sampleClaimId: 'KS-26-104320'
    }
  };

  const currentTemplate = templates[activeCluster];
  const [editedSubject, setEditedSubject] = useState(currentTemplate.subject);
  const [editedBody, setEditedBody] = useState(currentTemplate.body);

  // Update text when cluster changes
  React.useEffect(() => {
    setEditedSubject(templates[activeCluster].subject);
    setEditedBody(templates[activeCluster].body);
  }, [activeCluster]);

  // Sample interpolated preview using first claim in cluster
  const sampleClaim = clusterClaims[0] || claims[0];
  const interpolatedPreview = useMemo(() => {
    if (!sampleClaim) return '';
    return editedBody
      .replace(/{{customer_name}}/g, sampleClaim.holder_name || sampleClaim.reported_name || 'Max Mustermann')
      .replace(/{{claim_id}}/g, sampleClaim.claim_id)
      .replace(/{{policy_id}}/g, sampleClaim.resolved_policy_id || 'POL-99234')
      .replace(/{{plate}}/g, sampleClaim.reported_plate || 'M-DE 2026')
      .replace(/{{deductible}}/g, `€${sampleClaim.deductible_teilkasko_eur ?? 150}`);
  }, [editedBody, sampleClaim]);

  if (!isOpen) return null;

  const handleConfirmDispatch = () => {
    onExecuteBulkDispatch(
      activeCluster, 
      Array.from(selectedIds), 
      editedSubject, 
      editedBody
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-gray-900 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl text-integral-copper-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gray-950">Templatized Bulk Triage &amp; Email Dispatch</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-100 text-[#cf5f09] border border-orange-200 font-mono">
                  GoBD Verified
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Review verified handbook template, preview dynamic variables, audit recipients, and batch dispatch
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cluster Tabs Bar */}
        <div className="flex border-b border-gray-200 bg-gray-100/70 p-2 gap-2 text-xs overflow-x-auto">
          {[
            { id: 'glass' as BulkClusterType, label: '💥 117 Broken Glass Claims', count: 117, badge: 'Klarsicht Mobile' },
            { id: 'haftpflicht' as BulkClusterType, label: '🚨 33 Haftpflicht Claims', count: 33, badge: '€132k Leakage Halt' },
            { id: 'dekra' as BulkClusterType, label: '🚗 39 Drivable Hail Claims', count: 39, badge: 'Dekra Drive-In' },
            { id: 'duplicates' as BulkClusterType, label: '🔄 42 Duplicate FNOL Claims', count: 42, badge: 'Consolidate & Mute' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCluster(tab.id)}
              className={`px-3 py-2 rounded-xl font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
                activeCluster === tab.id
                  ? 'bg-white text-gray-950 shadow-2xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                activeCluster === tab.id ? 'bg-orange-50 text-integral-copper-700 border-orange-200' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Body: Split 2 Columns (Left: Template & Live Preview, Right: Recipient Ledger) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          
          {/* LEFT COLUMN: TEMPLATE EDITOR & LIVE PREVIEW (7 COLS) */}
          <div className="lg:col-span-7 p-6 space-y-4 overflow-y-auto">
            
            {/* Rule Grounding Notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 block">{currentTemplate.ruleName}</span>
                <span className="text-[11px] text-gray-500 font-mono">{currentTemplate.ruleCode}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentTemplate.badgeStyle}`}>
                Verified Handbook Template
              </span>
            </div>

            {/* Subject Line */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Email / WhatsApp Subject Header:
              </label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-semibold focus:bg-white focus:outline-none focus:border-integral-copper-500"
              />
            </div>

            {/* Template Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold uppercase tracking-wider text-gray-600">
                  Templatized Outbound Message (Dynamic Placeholders):
                </label>
                <span className="text-gray-400 font-mono">Variables: {"{{customer_name}}, {{plate}}, {{deductible}}"}</span>
              </div>
              <textarea
                rows={9}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-900 font-mono leading-relaxed focus:bg-white focus:outline-none focus:border-integral-copper-500"
              />
            </div>

            {/* Live Sample Interpolation */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Sample Preview for Recipient #{sampleClaim?.claim_id}:</span>
              </span>
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-gray-800 whitespace-pre-wrap leading-relaxed shadow-2xs font-sans">
                {interpolatedPreview}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: RECIPIENT AUDIT LEDGER (5 COLS) */}
          <div className="lg:col-span-5 p-6 space-y-4 overflow-y-auto flex flex-col justify-between bg-gray-50/40">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Target Recipients ({clusterClaims.length} Cases)
                  </h3>
                  <p className="text-[11px] text-gray-500">Uncheck any case you wish to exclude from this batch</p>
                </div>

                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-integral-copper-600 hover:text-integral-copper-700 font-semibold flex items-center space-x-1"
                >
                  {selectedIds.size === clusterClaims.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Select All</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recipients Scrollable Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-[380px] overflow-y-auto divide-y divide-gray-100 shadow-2xs">
                {clusterClaims.map((claim) => {
                  const isChecked = selectedIds.has(claim.claim_id);

                  return (
                    <div 
                      key={claim.claim_id}
                      onClick={() => toggleSelectOne(claim.claim_id)}
                      className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition ${
                        isChecked ? 'bg-orange-50/40' : 'hover:bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="rounded text-integral-copper-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-gray-950 font-mono text-[11px] truncate">
                            {claim.claim_id}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {claim.holder_name || claim.reported_name || 'Policyholder'} · {claim.reported_plate || 'No Plate'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-gray-600 block capitalize">
                          via {claim.channel}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                          €{claim.deductible_teilkasko_eur ?? 150} TK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Summary Pill */}
              <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                <span className="text-gray-600 font-medium">Selected for Dispatch:</span>
                <span className="font-bold text-integral-copper-700 font-mono text-sm">
                  {selectedIds.size} of {clusterClaims.length} Recipients
                </span>
              </div>
            </div>

            {/* GoBD Audit Notice */}
            <div className="p-3 bg-gray-100/80 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div className="font-semibold text-gray-800 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>GoBD Batch Compliance Protocol</span>
              </div>
              <p>
                All {selectedIds.size} outbound communications will be cryptographically hashed, timestamped with desk ID #4, and recorded in the audit trail.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/90 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Target Batch: <strong className="text-gray-900">{currentTemplate.title}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDispatch}
              disabled={selectedIds.size === 0}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-2 ${
                selectedIds.size > 0
                  ? 'bg-integral-copper-600 hover:bg-integral-copper-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Authorize &amp; Bulk Dispatch ({selectedIds.size} Messages)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
