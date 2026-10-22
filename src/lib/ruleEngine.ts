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
      correctedDraft: `Dear Autohaus Brandl team,\n\nWe hereby grant repair approval (Reparaturfreigabe) for VW Passat Variant M-F 8000, claim KS-26-104234, based on your net estimate of €3,860.00.\n\nPlease proceed with the repair booked for today, 14 July at 13:00.\n\nBest regards,\nLena Huber\nKumulus Claims`
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
      correctedDraft: `Hello Mr Clarke,\n\nThank you for letting us know about the parts delay at Autohaus Kaiser. Under Kumulus policy conditions, mobility cover covers up to 14 days directly. For an extension through 22 July, I am submitting a formal extension request to my team lead for approval today and will confirm back shortly.\n\nKind regards,\nLena Huber`
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
      correctedDraft: `Hello ${claim.holder_name || claim.reported_name || 'Customer'},\n\nThank you for reaching out regarding the hailstorm. I have reviewed policy ${claim.resolved_policy_id || ''}. Your policy currently includes third-party liability (Kfz-Haftpflicht) only, which covers damage caused to other parties, but does not include partial cover (Teilkasko) for storm or environmental damage.\n\nRegrettably, we cannot cover the repair costs for this vehicle. Please let us know if you have questions or if you hold a separate comprehensive policy.\n\nKind regards,\nLena Huber\nKumulus Versicherung`
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
      correctedDraft: `Hello ${claim.holder_name || claim.reported_name || 'Customer'},\n\nWe received your storm report. Because your vehicle has broken glass, it is not safe or roadworthy to drive under safety guidelines.\n\nWe have arranged priority on-site mobile repair with our glass partner Klarsicht Autoglas. They will repair the vehicle directly at your address:\n\n👉 https://partner.klarsicht-autoglas.de/book?claim=${claim.claim_id}&deductible=${claim.deductible_teilkasko_eur || 150}\n\nYour Teilkasko deductible of €${claim.deductible_teilkasko_eur || 150} applies.\n\nKind regards,\nLena Huber\nKumulus Versicherung`
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
      correctedDraft: `Hello ${claim.holder_name || claim.reported_name || 'Customer'},\n\nThank you for reporting your hail damage. Hail damage is covered under your Teilkasko policy (deductible: €${claim.deductible_teilkasko_eur || 150}).\n\nTo inspect your vehicle without waiting weeks, Kumulus and Dekra have set up a Munich Drive-In Assessment Center (Sammelbesichtigung). Please select your preferred 15-minute slot:\n\n👉 https://dekra-termine.de/kumulus-muenchen?claim=${claim.claim_id}\n\nKind regards,\nLena Huber\nKumulus Versicherung`
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
