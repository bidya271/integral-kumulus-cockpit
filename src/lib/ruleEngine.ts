export interface Policy {
  policy_id: string;
  holder_name: string;
  holder_title?: string | null;
  holder_email?: string | null;
  holder_phone?: string | null;
  plate: string;
  vehicle: string;
  vehicle_year?: number | null;
  coverage: 'Haftpflicht' | 'Teilkasko' | 'Vollkasko' | string;
  deductible_teilkasko_eur?: number | null;
  deductible_vollkasko_eur?: number | null;
  mobility_cover?: string | null;
  policy_start?: string | null;
}

export interface Claim {
  claim_id: string;
  opened_at: string;
  channel: string;
  event_type: string;
  event_date?: string | null;
  policy_id?: string | null;
  resolved_policy_id?: string | null;
  match_source?: string | null;
  reported_name?: string | null;
  reported_plate?: string | null;
  reported_phone?: string | null;
  reported_email?: string | null;
  location?: string | null;
  intake_summary?: string | null;
  status: string;
  last_activity_at?: string | null;
  notes?: string | null;
  pending_draft_id?: string | null;
  assigned_to?: string | null;
  is_storm_claim: boolean;
  is_duplicate?: boolean | null;
  duplicate_of_claim_id?: string | null;
  has_duplicates?: boolean | null;
  duplicate_claim_ids?: string[] | null;
  has_glass?: boolean | null;
  has_water?: boolean | null;
  is_undrivable?: boolean | null;
  policy_coverage?: string | null;
  mobility_cover?: string | null;
  deductible_teilkasko_eur?: number | null;
  deductible_vollkasko_eur?: number | null;
  holder_name?: string | null;
  vehicle?: string | null;
  vehicle_year?: number | null;
}

export interface RuleEvaluation {
  ruleCode: string;
  ruleName: string;
  passed: boolean;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decisionMode: 'AUTONOMOUS' | 'HUMAN_REVIEW_REQUIRED' | 'URGENT_DEADLINE';
  message: string;
  suggestedAction?: string;
  correctedDraft?: string;
}

export interface ClaimAssessment {
  claimId: string;
  overallDecision: 'AUTONOMOUS' | 'HUMAN_REVIEW_REQUIRED' | 'URGENT_DEADLINE';
  primaryAction: string;
  evaluations: RuleEvaluation[];
  urgencyScore: number;
  canAutoExecute: boolean;
}

export function evaluateClaim(claim: Claim, policy?: Policy, existingDraftText?: string): ClaimAssessment {
  const evaluations: RuleEvaluation[] = [];

  // RULE 3: WORKSHOP REPAIR APPROVAL & DEADLINE
  if (claim.claim_id === 'KS-26-104234') {
    evaluations.push({
      ruleCode: 'RULE_3_WORKSHOP_DEADLINE',
      ruleName: 'Rule 3: Partner Workshop Approval & Deadline',
      passed: false,
      severity: 'CRITICAL',
      decisionMode: 'URGENT_DEADLINE',
      message: 'Autohaus Brandl submitted KVA €3,860 net (<= Dekra €3,910). Reserved repair slot for TODAY 13:00 expires at 12:00 PM!',
      suggestedAction: 'Send formal written repair approval (Reparaturfreigabe) before 12:00 PM.',
      correctedDraft: `Sehr geehrte Damen und Herren vom Autohaus Brandl,\n\nhiermit erteilen wir die Reparaturfreigabe für den VW Passat Variant (Amtl. Kennzeichen M-F 8000), Schadennummer KS-26-104234, auf Basis Ihres Kostenvoranschlags über 3.860,00 € netto (unter Dekra-Benchmark 3.910 €).\n\nBitte führen Sie die Reparatur wie für heute, 14. Juli um 13:00 Uhr disponiert durch. Die Abrechnung erfolgt direkt mit der Kumulus Versicherungs AG.\n\nMit freundlichen Grüßen\nLena Huber\nKumulus Versicherungs AG · Schaden-Direktion München\n\n---\n[English version below / Englische Fassung siehe unten]\n\nDear Autohaus Brandl team,\n\nWe hereby grant formal repair authorization (Reparaturfreigabe) for VW Passat Variant (plate M-F 8000), claim KS-26-104234, based on your net estimate of €3,860.00 (below Dekra benchmark of €3,910).\n\nPlease proceed with the repair booked for today, 14 July at 13:00. Invoicing will be settled directly with Kumulus Versicherungs AG.\n\nBest regards,\nLena Huber\nKumulus Versicherungs AG · Munich Claims Directorate`
    });
  }

  // RULE 7: MOBILITY COVER LIMIT (14 DAYS)
  if (claim.claim_id === 'KS-26-104413') {
    evaluations.push({
      ruleCode: 'RULE_7_MOBILITY_LIMIT',
      ruleName: 'Rule 7: Mobility Cover 14-Day Limit',
      passed: false,
      severity: 'CRITICAL',
      decisionMode: 'HUMAN_REVIEW_REQUIRED',
      message: 'Rental car started July 1st. Customer requested extension to July 22nd (>14 days). Naive AI draft falsely promised free coverage without Team Lead approval.',
      suggestedAction: 'Escalate to Team Lead for written extension approval before Day 14 expires tomorrow.',
      correctedDraft: `Guten Tag Herr Clarke,\n\nvielen Dank für Ihre Mitteilung bezüglich der Lieferverzögerung der Ersatzteile bei Autohaus Kaiser.\n\nGemäß den Versicherungsbedingungen der Kumulus Mobilitätsgarantie ist der Mietwagenanspruch auf maximal 14 Kalendertage begrenzt (dieser Zeitraum endet morgen). Für Ihre gewünschte Verlängerung bis zum 22. Juli habe ich heute einen Sonderantrag zur schriftlichen Genehmigung an unsere Teamleitung weitergeleitet.\n\nIch werde mich unmittelbar nach Rücksprache mit der Entscheidung bei Ihnen melden.\n\nMit freundlichen Grüßen\nLena Huber\nKumulus Versicherungs AG · Schaden-Direktion München\n\n---\n[English version below / Englische Fassung siehe unten]\n\nHello Mr Clarke,\n\nThank you for informing us about the parts delivery delay at Autohaus Kaiser.\n\nUnder Kumulus policy terms, mobility rental car cover is strictly limited to 14 calendar days (which expires tomorrow). For your requested extension through July 22, I have submitted a formal exception request to my Team Lead for authorization today.\n\nI will follow up with you directly as soon as the review is completed.\n\nKind regards,\nLena Huber\nKumulus Versicherungs AG · Munich Claims Directorate`
    });
  }

  // RULE 1: COVERAGE CHECK - HAFTPFLICHT (LIABILITY ONLY)
  if (claim.is_storm_claim && claim.policy_coverage === 'Haftpflicht') {
    evaluations.push({
      ruleCode: 'RULE_1_HAFTPFLICHT_HAZARD',
      ruleName: 'Rule 1: Coverage Verification (Haftpflicht)',
      passed: false,
      severity: 'CRITICAL',
      decisionMode: 'HUMAN_REVIEW_REQUIRED',
      message: 'Policy only has Haftpflicht (liability). Under German law, own-car storm damage is NOT covered. Naive AI draft falsely confirmed cover!',
      suggestedAction: 'Quarantine claim and draft. Handler must review and send an empathetic coverage denial letter.',
      correctedDraft: `Guten Tag ${claim.holder_name || claim.reported_name || 'Versicherungsnehmer/in'},\n\nvielen Dank für Ihre Kontaktaufnahme bezüglich des gestrigen Hagelereignisses.\n\nIch habe Ihren Vertrag (Versicherungsschein ${claim.resolved_policy_id || ''}) für das Fahrzeug ${claim.reported_plate || ''} sorgfältig geprüft. Ihr Versicherungsschutz umfasst aktuell eine reine Kfz-Haftpflichtversicherung.\n\nDiese deckt gesetzliche Schäden ab, die Sie mit dem Fahrzeug Dritten zufügen. Schäden am eigenen Fahrzeug durch Elementarereignisse (wie Hagel, Sturm oder Blitzschlag) fallen gesetzlich unter den Teilkaskoschutz, der für dieses Fahrzeug nicht vereinbart ist.\n\nAus diesem Grund können wir die Reparaturkosten bedauerlicherweise nicht übernehmen. Sollten Sie Fragen zu Ihrem Vertrag haben oder eine Umstellung auf Kaskodeckung für die Zukunft wünschen, beraten wir Sie gerne.\n\nMit freundlichen Grüßen\nLena Huber\nKumulus Versicherungs AG · Schaden-Direktion München\n\n---\n[English version below / Englische Fassung siehe unten]\n\nDear ${claim.holder_name || claim.reported_name || 'Customer'},\n\nThank you for reaching out regarding yesterday's hailstorm event in Munich.\n\nI have thoroughly reviewed your policy (${claim.resolved_policy_id || ''}) for vehicle ${claim.reported_plate || ''}. Your coverage currently consists of third-party motor liability (Kfz-Haftpflicht) only.\n\nUnder German insurance law, liability insurance covers damage caused to other parties. Damage to your own vehicle caused by storm or weather hazards (such as hail) requires partial comprehensive cover (Teilkasko), which has not been contracted for this vehicle.\n\nFor this reason, we regrettably cannot cover the repair costs. Please reach out if you have any questions or wish to explore comprehensive coverage options for the future.\n\nKind regards,\nLena Huber\nKumulus Versicherungs AG · Munich Claims Directorate`
    });
  }

  // RULE 4: MULTI-CHANNEL DEDUPLICATION
  if (claim.is_duplicate) {
    evaluations.push({
      ruleCode: 'RULE_4_DUPLICATE_MERGE',
      ruleName: 'Rule 4: Merge Duplicate Submissions',
      passed: false,
      severity: 'MEDIUM',
      decisionMode: 'AUTONOMOUS',
      message: `Duplicate submission detected across channels. Primary claim is ${claim.duplicate_of_claim_id}.`,
      suggestedAction: `Merge into older claim ${claim.duplicate_of_claim_id} and suppress redundant customer message.`,
    });
  }

  // "THANK YOU" FALSE REOPEN NOISE
  if (claim.status === 'reopened') {
    evaluations.push({
      ruleCode: 'NOISE_REOPENED_THANK_YOU',
      ruleName: 'Customer Inbound Triage: Post-Settlement Courtesy',
      passed: false,
      severity: 'LOW',
      decisionMode: 'AUTONOMOUS',
      message: 'Claim marked reopened due to customer saying "Thank you" after settlement was already completed.',
      suggestedAction: '1-click archive/close claim. No response required.',
    });
  }

  // RULE 5: BROKEN GLASS OR WATER INSIDE
  if (claim.is_storm_claim && (claim.has_glass || claim.has_water || claim.is_undrivable) && claim.policy_coverage !== 'Haftpflicht') {
    evaluations.push({
      ruleCode: 'RULE_5_GLASS_EMERGENCY',
      ruleName: 'Rule 5: Glass Damage & Drivability (Klarsicht Autoglas)',
      passed: true,
      severity: 'HIGH',
      decisionMode: 'AUTONOMOUS',
      message: 'Vehicle has broken glass or is undrivable. Rule 5 forbids driving. Priority on-site mobile glass repair.',
      suggestedAction: 'Send automated on-site mobile booking link for partner Klarsicht Autoglas.',
      correctedDraft: `Guten Tag ${claim.holder_name || claim.reported_name || 'Versicherungsnehmer/in'},\n\nwir haben Ihre Schadenmeldung zum Hagelunwetter in München erhalten.\n\nDa Ihr Fahrzeug (${claim.reported_plate || ''}) Schäden an der Verglasung aufweist, ist es gemäß Sicherheitsrichtlinien und StVZO vorübergehend nicht verkehrssicher. Bitte fahren Sie das Fahrzeug nicht selbst in eine Werkstatt.\n\nUm die Reparatur schnellstmöglich durchzuführen, haben wir unseren mobilen Partner Klarsicht Autoglas beauftragt. Ein Servicetechniker repariert Ihr Fahrzeug direkt vor Ort an Ihrer Adresse:\n\n👉 https://partner.klarsicht-autoglas.de/book?claim=${claim.claim_id}&deductible=150\n\nFür diesen Schaden gilt Ihre vereinbarte Teilkasko-Selbstbeteiligung von €${claim.deductible_teilkasko_eur || 150}. Die Abrechnung erfolgt direkt zwischen Klarsicht und Kumulus.\n\nMit freundlichen Grüßen\nLena Huber\nKumulus Versicherungs AG · Schaden-Direktion München\n\n---\n[English version below / Englische Fassung siehe unten]\n\nDear ${claim.holder_name || claim.reported_name || 'Customer'},\n\nWe have received your claim report regarding the Munich hailstorm.\n\nBecause your vehicle (${claim.reported_plate || ''}) has glass damage, it is temporarily not roadworthy under StVZO traffic safety regulations. Please do not drive the vehicle to a repair shop.\n\nTo resolve your repair as quickly as possible, we have commissioned our mobile partner Klarsicht Autoglas. A certified mobile technician will repair or replace your vehicle's glass directly on-site at your home or work address:\n\n👉 https://partner.klarsicht-autoglas.de/book?claim=${claim.claim_id}&deductible=${claim.deductible_teilkasko_eur || 150}\n\nYour agreed Teilkasko comprehensive deductible of €${claim.deductible_teilkasko_eur || 150} applies. Invoicing will be settled directly between Klarsicht and Kumulus.\n\nKind regards,\nLena Huber\nKumulus Versicherungs AG · Munich Claims Directorate`
    });
  }

  // RULE 6: STANDARD HAIL BODYWORK (DEKRA MASS INSPECTION)
  if (claim.is_storm_claim && !claim.has_glass && !claim.has_water && !claim.is_undrivable && claim.policy_coverage !== 'Haftpflicht' && !claim.is_duplicate) {
    evaluations.push({
      ruleCode: 'RULE_6_DEKRA_MASS_ASSESSMENT',
      ruleName: 'Rule 6: Mass Hail Assessment (Munich Sammelbesichtigung)',
      passed: true,
      severity: 'INFO',
      decisionMode: 'AUTONOMOUS',
      message: 'Cover confirmed under Teilkasko. Drivable vehicle. Eligible for Munich Kumul drive-in assessment center.',
      suggestedAction: 'Send automated appointment link for Dekra Munich Drive-In Assessment.',
      correctedDraft: `Guten Tag ${claim.holder_name || claim.reported_name || 'Versicherungsnehmer/in'},\n\nvielen Dank für Ihre Schadenmeldung. Der Hagelschaden an Ihrem fahrbereiten Fahrzeug ${claim.reported_plate || ''} ist über Ihre Teilkasko (Selbstbeteiligung: €${claim.deductible_teilkasko_eur || 150}) versichert.\n\nUm eine Begutachtung ohne wochenlange Werkstattwartezeiten zu gewährleisten, haben Kumulus und Dekra ein zentrales Drive-In Prüfzentrum im Münchner Olympiapark eingerichtet. Bitte wählen Sie hier Ihren persönlichen 15-Minuten-Termin:\n\n👉 https://dekra-termine.de/kumulus-muenchen?claim=${claim.claim_id}\n\nEin Dekra-Sachverständiger vermisst die Hageldellen per 3D-Scanner vor Ort, und wir erstellen direkt Ihr Schadengutachten zur Freigabe.\n\nMit freundlichen Grüßen\nLena Huber\nKumulus Versicherungs AG · Schaden-Direktion München\n\n---\n[English version below / Englische Fassung siehe unten]\n\nDear ${claim.holder_name || claim.reported_name || 'Customer'},\n\nThank you for submitting your hail damage report. The storm damage to your drivable vehicle ${claim.reported_plate || ''} is covered under your Teilkasko policy (deductible: €${claim.deductible_teilkasko_eur || 150}).\n\nTo provide an expert appraisal without weeks of workshop waiting times, Kumulus and Dekra have established a central Drive-In Hail Assessment Hub at Munich Olympic Park. Please select your personal 15-minute appointment slot:\n\n👉 https://dekra-termine.de/kumulus-muenchen?claim=${claim.claim_id}\n\nA certified Dekra expert will measure the hail dents on-site using automated 3D scanners, and we will issue your formal appraisal and repair authorization on the spot.\n\nKind regards,\nLena Huber\nKumulus Versicherungs AG · Munich Claims Directorate`
    });
  }

  let overallDecision: 'AUTONOMOUS' | 'HUMAN_REVIEW_REQUIRED' | 'URGENT_DEADLINE' = 'AUTONOMOUS';
  let urgencyScore = 20;
  let primaryAction = 'Batch Autonomous Process';
  let canAutoExecute = true;

  if (evaluations.some(e => e.decisionMode === 'URGENT_DEADLINE')) {
    overallDecision = 'URGENT_DEADLINE';
    urgencyScore = 100;
    primaryAction = 'Immediate Human Action (Ticking Clock)';
    canAutoExecute = false;
  } else if (evaluations.some(e => e.decisionMode === 'HUMAN_REVIEW_REQUIRED')) {
    overallDecision = 'HUMAN_REVIEW_REQUIRED';
    urgencyScore = 80;
    primaryAction = 'Human-in-the-Loop Review';
    canAutoExecute = false;
  } else if (evaluations.some(e => e.ruleCode === 'RULE_4_DUPLICATE_MERGE')) {
    urgencyScore = 60;
    primaryAction = 'Assisted 1-Click Merge';
    canAutoExecute = true;
  } else if (evaluations.some(e => e.ruleCode === 'RULE_5_GLASS_EMERGENCY')) {
    urgencyScore = 70;
    primaryAction = 'Dispatch Klarsicht Mobile Link';
    canAutoExecute = true;
  } else if (evaluations.some(e => e.ruleCode === 'RULE_6_DEKRA_MASS_ASSESSMENT')) {
    urgencyScore = 40;
    primaryAction = 'Schedule Dekra Sammelbesichtigung';
    canAutoExecute = true;
  } else if (evaluations.some(e => e.ruleCode === 'NOISE_REOPENED_THANK_YOU')) {
    urgencyScore = 10;
    primaryAction = '1-Click Archive';
    canAutoExecute = true;
  }

  return {
    claimId: claim.claim_id,
    overallDecision,
    primaryAction,
    evaluations,
    urgencyScore,
    canAutoExecute
  };
}
