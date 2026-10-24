# Kumulus AI Claims Dispatch Cockpit & Business Rule Engine

> **Built for Integral · Senior Product Builder Case Study**  
> **Candidate:** Bidya Bhushan Bibhu  
> **Mission:** Build the tool Lena Huber should use at 08:00 AM on Tuesday, 14 July 2026, following the Munich hailstorm catastrophe.

---

## Live Prototype & Repository

* **Live Interactive Prototype:** [https://integral-kumulus-cockpit.vercel.app](https://integral-kumulus-cockpit.vercel.app) *(or connect your Vercel project to this repository)*
* **GitHub Repository:** [https://github.com/bidya271/integral-kumulus-cockpit](https://github.com/bidya271/integral-kumulus-cockpit)

---

## The Situation (The "Munich Kumul")

* **Snapshot Time:** Tuesday, 14 July 2026, 07:45 CEST. Lena starts her shift at 08:00.
* **Catastrophe Event:** A violent hailstorm crossed Munich between 18:20 and 19:00 the evening before.
* **Volume Surge:** Kumulus received **9,140 car claims** overnight across all handlers (normal volume is ~300/day).
* **Lena’s Desk:** **270 claims assigned** (210 from the storm, 60 pre-storm claims).

---

## The Four Answers (Executive Summary)

### 1. What does your tool do for Lena this morning, and what in the data made you choose that?
Lena cannot handle 270 claims sequentially—doing so would take **40+ hours**, allowing urgent deadlines to expire and letting false AI promises reach customers.

The tool is a **Rules-Driven Claims Dispatch Cockpit** that solves the specific landmines discovered in the data:
1. **Defuses the 12:00 PM Workshop Deadline (`KS-26-104234` / Ursula Popescu):** Autohaus Brandl submitted a cost estimate of €3,860 net (under Dekra’s €3,910). They reserved a repair slot for today at 13:00 with a strict condition: *written approval by 12:00, or the slot is given away until August 4th*. The cockpit surfaces a **1-click approval** at 08:00.
2. **Quarantines 33 Liability-Only (`Haftpflicht`) Hallucinations:** 33 storm claims have third-party liability only (zero hail cover). The naive AI drafted: *"Good news: hail damage is covered..."* The tool halts all 33 drafts immediately to prevent massive unapproved financial liability.
3. **Deterministically Resolves 69 Unlinked Claims (100% Match):** 69 claims arrived with `policy_id = NaN`. Our data engine automatically reconciled **69 out of 69** via plate (39), phone (55), and email (14).
4. **Auto-Merges 21 Multi-Channel Duplicate Pairs (42 claims):** Panicked callers overnight received no instant SMS and submitted again via App or WhatsApp. Rule 4 merges them into the older claim with 1 click.
5. **Batch Dispatches Urgent Physical Actions:** Instantly sends mobile on-site repair links for **117 broken glass claims** (partner *Klarsicht Autoglas*, Rule 5), and invites **39 drivable hail claims** to the Munich *Dekra Sammelbesichtigung* (mass drive-in center).

### 2. What did you leave out, and why?
* **Left out automated payouts:** Rules 1 & 6 prohibit payouts or confirming cover above €2,000 without an official Dekra assessment. Auto-payouts in a storm environment risk massive fraud and leakage.
* **Left out automated coverage denials:** Denying coverage to the 33 *Haftpflicht* policyholders has severe legal and BaFin consequences under the German Insurance Contract Act (VVG). An AI must never unilaterally reject coverage without human sign-off.
* **Left out conversational chatbot interfaces:** Conversing with an LLM takes 3–5 minutes per claim. Lena needs deterministic batch dispatch buttons that clear 50 claims a minute.

### 3. Which messages may the AI send without a human, and which never?
* **AI May Send Autonomously (Zero-Touch):**
  * Immediate claim intake acknowledgments with claim number and policy deductible (with explicit disclaimer: *assessment pending*).
  * Self-service booking links for *Klarsicht Autoglas* mobile repair (for verified Teilkasko/Vollkasko with broken glass).
  * Self-service appointment booking links for the Munich *Dekra Sammelbesichtigung*.
* **AI May NEVER Send Without a Human (Strict HITL):**
  * Formal repair approvals (*Reparaturfreigabe*, Rule 3) authorizing money movement.
  * Coverage denials or claim rejections under German insurance law.
  * Rental car extensions beyond 14 days (Rule 7 requires written Team Lead sign-off).
  * Any claim involving bodily injury (*Personenschaden*, Rule 2 requires immediate 24h transfer to the bodily injury squad without discussing fault).

### 4. Which one number would tell Kumulus that the tool works?
* **North Star Metric:** **% of Kumul Claims Fully Triaged with Inspection or Glass Repair Booked within 4 Hours of Shift Start (>90% by 12:00 PM).**
* In catastrophe events, operational loss and customer NPS correlate directly with the time to first physical intervention.

---

## Architecture & System Structure

```
integral-claims-cockpit/
├── scripts/
│   └── export_data.py           # Ingestion, 100% policy resolution & duplicate detection
├── supabase_schema.sql          # Production PostgreSQL/Supabase schema (GoBD compliant)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Inter typography & dark mode styling
│   │   ├── page.tsx             # Interactive stateful command center
│   │   └── globals.css          # Tailwind CSS directives
│   ├── components/
│   │   ├── Header.tsx           # Context header, live clock, metric counters
│   │   ├── EmergencyAlertBanner.tsx # Autohaus 12:00 deadline, Tom Clarke, Haftpflicht
│   │   ├── BatchActionToolbar.tsx   # 1-click batch actions (Merge, Glass, Dekra)
│   │   ├── ClaimDetailDrawer.tsx    # Omnichannel timeline & AI draft diff viewer
│   │   ├── ExecutiveMemoModal.tsx   # Copyable & printable 1-page memo
│   │   ├── WorkLogModal.tsx         # Engineering log & prompt audit
│   │   └── RuleEngineSandbox.tsx    # Interactive rule engine simulator
│   ├── data/
│   │   └── kumulus_seed.json    # Reconciled 270 claims dataset
│   └── lib/
│       └── ruleEngine.ts        # Pure TypeScript implementation of Rules 1–7
```

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/bidya271/integral-claims-cockpit.git
cd integral-claims-cockpit

# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## Deploying to Vercel

```bash
# Push to your GitHub account and import into Vercel, or deploy directly via Vercel CLI:
npx vercel
```
