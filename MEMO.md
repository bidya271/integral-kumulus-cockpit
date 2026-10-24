# Executive Submission: Kumulus AI Claims Dispatch Cockpit & Business Rule Engine

**To:** Lukas Zörner (Co-Founder & VP Product), Jesse, and the Integral Team  
**From:** Bidya Bhushan Bibhu (Candidate for Senior Product Builder)  
**Date:** 23 October 2026  
**Subject:** Lena Huber's Morning Triage & Catastrophe Operating System (Munich Hailstorm, 14 July 2026)  
**Live Production Cockpit:** [https://integral-claims-cockpit.vercel.app](https://integral-claims-cockpit.vercel.app) *(Public, HTTP 200, zero login barrier)*  
**GitHub Repository:** [https://github.com/bidya271/integral-kumulus-cockpit](https://github.com/bidya271/integral-kumulus-cockpit)  

---

### 1. What does your tool do for Lena this morning, and what in the data made you choose that?

#### The Data Reality: A Polarized Bimodal Distribution
Lena Huber arrives at Desk #4 at 07:45 AM following the Munich catastrophe hailstorm (*Kumul*). Kumulus received **9,140 claims** overnight; Lena is assigned **270 claims** (210 storm, 60 pre-existing). At a manual baseline of 8–10 minutes per claim, sequential processing would require **40+ handler hours**, guaranteeing missed deadlines and severe financial leakage.

Analyzing the dataset (270 claims, 249 policies, 583 messages, 304 AI drafts) revealed that claims fall into two distinct operational poles:
1. **The Routine Majority (73% of Queue):** 198 claims follow deterministic Claims Handbook criteria:
   * **117 Broken Glass Claims:** Shattered glass violates StVZO roadworthiness; vehicles cannot legally be driven to drive-in hubs.
   * **33 Haftpflicht Claims:** Third-party liability only. Zero storm coverage. Naive AI drafts hallucinated coverage promises, risking **€132,000 in unrecoverable leakage** (€4,000 avg damage).
   * **21 Duplicate Pairs (42 Claims):** Policyholders panicked and filed across Phone, App, and WhatsApp. Reviewing them separately wastes 10.5 hours.
   * **39 Drivable Hail Claims:** Dents on bodywork eligible for mass drive-in appraisal.
2. **The High-Stakes Time-Critical Exceptions (2% of Queue):**
   * **Autohaus Brandl (`KS-26-104234` · Ursula Popescu):** Estimate is €3,860 net (under Dekra benchmark of €3,910). Reserved 13:00 repair slot today **forfeited if not approved in writing by 12:00 PM**, delaying the customer to August and adding €350 in rental car delay costs.
   * **Tom Clarke (`KS-26-104413`):** Rental car reaches Day 13 of the 14-day handbook cap tomorrow. Customer asked for 21 days; naive AI falsely promised free coverage without mandatory Team Lead approval.

#### What the Tool Does
The tool gives Lena an **Asymmetric Bimodal Operating System**:
* **High-Priority Command Cards (Defusing Landmines before 08:15 AM):**  
  Surfaces Brandl and Tom Clarke at the very top of her screen:
  * **1-Click Approve Freigabe (€3,860 net):** Generates official authorization and locks the 13:00 repair slot.
  * **1-Click Escalate to Team Lead:** Freezes Tom Clarke’s unauthorized draft and stages an approval form.
* **Templatized Bulk Dispatch (Clearing 198 Claims in 3 Minutes):**  
  Instead of emailing one by one, Lena reviews dynamic clusters and batch-dispatches verified, bilingual templates (German official copy + English version below):
  * Dispatches **117 Klarsicht mobile on-site repair links** (+19.5 hrs saved).
  * Halts **33 Haftpflicht hallucinated drafts** (€132,000 leakage blocked, +8.25 hrs saved).
  * Auto-merges **21 duplicate pairs** (+10.5 hrs saved).
  * Schedules **39 Dekra Drive-In slots** (+6.5 hrs saved).
  * *Total time recovered: 46.5 handler hours (5.8 workdays).*
* **Live Triage Sync:** Every batch action immediately updates the Case Management ledger, categorizing cases into `🚨 Action Needed` vs. `✅ Solved via Batch` with policy rule citations and GoBD audit logging.

---

### 2. What did you leave out, and why?

1. **Computer Vision Damage Assessment & Automated Fraud ML:**  
   *Why left out:* CV photo models have a 25–35% error rate on hail reflections. Rather than introducing false rejections or high compute overhead, the cockpit routes vehicles directly to certified partner physical checkpoints (Dekra 3D scanner hubs & Klarsicht mobile technicians) where physical verification is 100% accurate.
2. **Black-Box Predictive Priority Scoring:**  
   *Why left out:* Adjusters mistrust opaque algorithmic scores (e.g., `Priority: 0.91`). We used explicit, explainable handbook SLA deadlines (e.g., Autohaus Brandl's 12:00 PM slot cutoff and Tom Clarke's Day 13/14 limit).
3. **Outbound AI Phone Bots / Voice Calls:**  
   *Why left out:* Robo-calling 270 stressed customers causes network congestion and generates inbound callbacks that jam phone lines. Asynchronous digital booking links (SMS/Email/WhatsApp) allow policyholders to self-schedule 24/7.
4. **Direct Synchronous Write-Locks to the Core Policy Admin System (PAS):**  
   *Why left out:* Attempting real-time synchronous two-way replication into legacy core systems (Guidewire/SAP) during a 9,140-claim catastrophe creates database lock contention. We decoupled the triage state via an asynchronous event stream and downloadable GoBD audit ledger.
5. **Adjuster Goodwill Budgets (*Kulanz* Toggles):**  
   *Why left out:* We strictly enforced policy deductibles (€150/€300) without arbitrary waiver toggles to prevent catastrophic aggregate margin erosion across 9,140 claims.
6. **Multi-Tenant Administration & Billing:**  
   *Why left out:* Lena is an operational claims adjuster at Desk #4. Cluttering her morning disaster screen with tenant management or seat billing adds noise to a time-critical mission.
7. **Automated Cash Payouts:**  
   *Why left out:* German insurance law (VVG), BaFin solvency standards, and GoBD compliance require human verification for storm payouts above €2,000. The tool prepares communications and partner bookings, leaving monetary disbursement to underwriting rails.

---

### 3. Which messages may the AI send without a human, and which never?

All customer communications use an enterprise **bilingual standard**: official German text first, followed by a clean divider and the English translation below (`[English version below / Englische Fassung siehe unten]`).

| Message Category | Specific Outbound Communication | Autonomous (Zero-Touch) vs. Hard HITL | Legal, Regulatory & Policy Grounding |
| :--- | :--- | :---: | :--- |
| **Mobile Glass Booking** | Klarsicht Autoglas on-site repair links for verified Teilkasko/Vollkasko with broken glass | **Autonomous (Zero-Touch)** | Shattered windshields violate StVZO safety. Direct mobile routing gets technicians to customer driveways quickly without financial leakage risk. |
| **Drive-In Mass Hub** | Dekra Munich Olympic Park *Sammelbesichtigung* 15-minute appointment invitations | **Autonomous (Zero-Touch)** | Standard bodywork hail dents under verified comprehensive policies. Deductible (€150/€300) is deterministically stated. Accelerates appraisal from weeks to 48 hours. |
| **Duplicate Consolidation** | Multi-channel duplicate acknowledgment and single-thread notice | **Autonomous (Zero-Touch)** | Confirms that parallel submissions across App/WhatsApp/Voice are merged under one primary claim ID, silencing redundant status queries. |
| **Coverage Rejections** | **Haftpflicht Storm Exclusion Notice (33 Claims, €132,000 risk)** | **NEVER Autonomous (Hard HITL)** | Unilateral coverage denial carries severe legal consequences under the German Insurance Contract Act (VVG). An adjuster must verify policy data before sending an empathetic, legally sound notice. |
| **Workshop Approvals** | **Reparaturfreigabe (€3,860 net, Autohaus Brandl)** | **NEVER Autonomous (Hard HITL)** | Authorizes direct commercial payout. Requires confirming estimate is $\le$ Dekra benchmark before legally committing insurer funds. |
| **Mobility Extensions** | Rental car extensions beyond 14 days (Tom Clarke) | **NEVER Autonomous (Hard HITL)** | Contractual policy limit. Naive AI draft falsely promised free rental through Day 21; requires written Team Lead sign-off. |
| **Bodily Injury** | Any claim reporting physical injury (*Personenschaden*) | **NEVER Autonomous (Hard HITL)** | Rule 2 mandates immediate 24h transfer to the bodily injury squad without automated discussion of fault or liability. |

---

### 4. Which one number would tell Kumulus that the tool works?

#### The North Star Metric:
> **"Catastrophe Queue Clearance Rate: $\ge$90% of Assigned Storm Claims Dispatched to Physical Resolution within 15 Minutes of Shift Start (with €0 Haftpflicht Leakage)."**

#### Why This is the Defining Metric:
In catastrophe insurance, claim costs, rental car expenses, and customer churn are direct functions of **initial response latency**:
* **Without the Tool (Traditional 4–6 Day Backlog):** Customers wait days without updates $\rightarrow$ panic and submit duplicate claims (42+ duplicates) $\rightarrow$ reserved workshop slots expire (Autohaus Brandl lost, delaying repairs to August and adding €350+ in avoidable rental costs) $\rightarrow$ rushed handlers or hallucinating AI models pay out non-covered liability claims.
* **With the Tool (15-Minute Clearance):**
  1. **Instant Relief:** By 08:03 AM, 117 glass victims receive mobile booking links and 39 drivable cars receive Dekra appointment invitations.
  2. **100% Slot Retention:** Autohaus Brandl is approved before 08:10 AM, locking the 13:00 repair slot today.
  3. **Zero Financial Leakage:** €132,000 in unentitled liability payouts are blocked at shift start.

---

### 5. System Architecture: Business Rules & Customization

#### Should Rules Be Editable and Extensible?
**Yes, both capabilities are mandatory.** In catastrophe operations, static rules fail when real-world conditions shift:
* **Adjustable Threshold Sliders:** Lena’s Team Lead can calibrate operational limits in real time: workshop KVA cap (100%–125%), mobility rental cap (7–21 days), and auto-approval value ceiling directly via sliders.
* **Authoring Custom Surge Rules:** The platform includes an interactive **`+ Add New Business Rule`** modal allowing operations leads to create disaster-specific heuristics (e.g., *Rule 8: Fast-Track Paintless Dent Repair under €1,500 without hub inspection*).
* **Pre-Commit Sandbox Simulation:** Every threshold adjustment or new rule is backtested in real-time across the 270-claim dataset, instantly projecting clearance %, review queues, and leakage impact before activation.
* **GoBD Version Tracking:** Every update increments the active ruleset version (`v2.4` $\rightarrow$ `v2.5`), logging an immutable audit record of who changed what and when.

---

### 6. Live Interactive Demo Guide

The application is deployed and publicly accessible at **[https://integral-claims-cockpit.vercel.app](https://integral-claims-cockpit.vercel.app)**:

1. **Operations Pulse (Dashboard):** Inspect the **5 Operational Landmines Matrix** and Capacity Ledger. Click **"Review & Bulk Send"** on the 33 Haftpflicht claims to inspect the bilingual template, review recipient checkboxes, and execute dispatch.
2. **Case Management:**
   * Select `KS-26-104234` (Ursula Popescu) to review Autohaus Brandl's estimate and approve the €3,860 Freigabe.
   * Select `KS-26-104413` (Tom Clarke) to inspect the 14-day mobility breach and escalate to Team Lead.
   * Toggle between `All Queue (270)`, `🚨 Action Needed / Unsolved`, and `✅ Solved via Batch`.
   * Open Tab 3 to review the message thread and test the **bilingual quick response chips** (`+ [DE/EN] Klarsicht Glas`, etc.).
3. **Rules Engine (Policy Studio):**
   * Adjust the KVA Threshold slider and click **"Run Simulation on 270 Claims"** to see dynamic impact metrics.
   * Click **"+ Add New Business Rule"** to author a custom surge rule and watch the ruleset version bump from `v2.4` to `v2.5`.
4. **Top Navigation:**
   * Click **"Reset to 08:00 AM State"** at any time to revert all actions and restore the morning catastrophe condition.
   * Click **"Export Ops Report (CSV)"** to generate a complete GoBD audit ledger of all 270 claims.
