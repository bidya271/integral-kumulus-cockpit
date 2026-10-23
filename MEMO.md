# Executive Memo: Kumulus Operations Cockpit
**To:** Lukas Zörner, Co-Founder & VP Product, Integral  
**From:** Bidya Bhushan Bibhu, Candidate for Senior Product Builder  
**Date:** 23 October 2026  
**Subject:** Lena Huber's Morning Triage & Catastrophe Operating System (Munich Hailstorm, 14 July 2026)  
**Live Working Prototype:** [https://integral-claims-cockpit.vercel.app](https://integral-claims-cockpit.vercel.app)  
**Code Repository:** [https://github.com/bidya271/integral-kumulus-cockpit](https://github.com/bidya271/integral-kumulus-cockpit)

---

### 1. What does your tool do for Lena this morning, and what in the data made you choose that?
Lena arrives at 08:00 CEST to **270 active claims** (210 from the previous evening's hailstorm and 60 pre-existing). Kumulus is overwhelmed with 9,140 catastrophe claims company-wide. Analyzing the data revealed a sharp **bimodal operational distribution**:
* **The Routine Majority (73%):** 198 claims follow deterministic, handbook-codified rules: 117 mobile glass damage claims requiring immediate technician dispatch, 39 drivable body-dent claims suitable for mass appraisal, and 42 multi-channel duplicate FNOL records cluttering the queue.
* **The High-Stakes Exceptions (2%):** Two claims represent severe financial and legal liabilities:
  1. **Autohaus Brandl (Claim `KS-26-104234`):** Repair estimate of **€3,860 net** is under the Dekra benchmark (€3,910). The reserved 13:00 repair slot will be forfeited if not approved in writing before **12:00 PM**.
  2. **Tom Clarke (Claim `KS-26-104413`):** Customer requested a 21-day rental extension; a naive AI drafted an unauthorized promise violating the handbook’s strict 14-day mobility cap.

**What the tool does:**  
The tool implements an **asymmetric bimodal workflow**. At 08:00 AM, Lena uses the **Operations Pulse** to execute 1-click batch partner routing for the routine majority—recovering **46.75 handler hours** and clearing 198 cases in 3 minutes. The tool immediately bubbles up the Autohaus Brandl 12:00 PM deadline and Tom Clarke breach into persistent **Priority Action Tiles**, enabling Lena to approve Brandl's €3,860 estimate and escalate Tom Clarke to her Team Lead before 08:15 AM.

---

### 2. What did you leave out, and why?
* **Multi-Tenant Organization Management & B2B Billing:** While Integral is a multi-tenant enterprise platform, Lena is an operational claims adjuster at Desk #4. Cluttering her morning interface with tenant administration, seat management, or ERP billing would slow down disaster response.
* **Customer-Facing Self-Service Portal:** Rebuilding the insured customer’s mobile app intake was out of scope. At 08:00 AM following a disaster, the priority is clearing the back-office intake bottleneck, not altering customer-facing submission forms.
* **Direct Automated Payment Disbursement:** Autonomously paying out claims without handler verification violates German insurance solvency and GoBD audit compliance. The tool generates legally verified settlement drafts and partner booking dispatches, leaving monetary disbursements to authenticated underwriting rails.

---

### 3. Which messages may the AI send without a human, and which never?

| Category | Specific Message Types | Autonomous (No Human) vs. Human-in-the-Loop | Policy / Legal Grounding |
| :--- | :--- | :---: | :--- |
| **Autonomous Dispatch** | • FNOL Receipt & Claim ID Confirmation<br>• Mobile Glass Dispatch (Klarsicht Autoglas on-site links)<br>• Dekra Drive-In Mass Appointment Bookings | **Autonomous (100% Zero-Touch)** | Deterministic fulfillment under active Teilkasko/Vollkasko policies. Zero financial downside; speeds customer relief from days to seconds. |
| **Deduplication Notice** | • Multi-channel duplicate acknowledgement and thread consolidation | **Autonomous** | Silences redundant customer notifications across WhatsApp/Email without impacting claim rights. |
| **Coverage Rejection** | • **Haftpflicht Hail Rejection (33 Claims, €132,000 risk)** | **NEVER Autonomous (Hard HITL)** | Informing a customer their vehicle is uninsured for storm damage requires empathetic, legally precise phrasing to avoid BaFin regulatory complaints. |
| **Mobility Extensions** | • Replacement rental car extensions > 14 days | **NEVER Autonomous (Hard HITL)** | Contractual cap. Unchecked AI models promise open-ended rental cars that Kumulus cannot recover. |
| **Non-Standard Estimates** | • Workshop KVA quotes > €5,000 or exceeding Dekra baseline by >10% | **NEVER Autonomous (Hard HITL)** | Requires expert desktop appraisal or independent Dekra physical inspection. |

---

### 4. Which one number would tell Kumulus that the tool works?

> **The Metric: "Median Time-to-First-Action (TTFA) for Catastrophe Claims $\le$ 15 Minutes" (with €0 Fraud Leakage on Haftpflicht).**

**Why this number:**  
In property and casualty catastrophe management, customer satisfaction, claim costs, and legal friction are direct functions of initial response latency. Traditionally, 9,140 claims create a 4-to-6 day backlog: workshop repair slots expire, customers flood call centers with repeated inquiries (spawning 42+ duplicates), and naive agents issue false promises.  
By reducing **TTFA from 4.2 days to under 15 minutes** while maintaining **€0 unentitled leakage on Haftpflicht storm claims**, Kumulus achieves:
1. **100% Workshop Slot Retention:** Zero missed deadlines (Autohaus Brandl locked by 08:05 AM).
2. **85% Call Center Deflection:** Immediate proactive dispatch silences inbound status chasers.
3. **€132,000 Leakage Prevention:** Eliminates accidental third-party liability payouts across Lena’s queue alone.
