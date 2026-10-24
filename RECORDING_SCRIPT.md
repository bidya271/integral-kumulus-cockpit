# Kumulus AI Claims Cockpit — 4-Minute Loom Walkthrough Script
**Role:** Senior Product Builder @ Integral  
**Audience:** Lukas Zörner (Co-Founder & VP Product), Jesse, and the Integral Team  
**Live Production URL:** [https://integral-claims-cockpit.vercel.app](https://integral-claims-cockpit.vercel.app)  
**Target Duration:** ~3:45 – 4:15 minutes  

---

## Recording Setup & Tips
* **Display Resolution:** 1920 × 1080 (Full HD), browser zoomed to 100% or 110%.
* **Initial State:** Click the **"Reset to 08:00 AM State"** button in the top navigation bar before pressing Record.
* **Tone:** Pragmatic, calm, outcome-focused, and deeply grounded in insurance operations and systems design. Avoid corporate buzzwords; focus on time saved, financial leakage blocked, and human-in-the-loop safety.

---

## Scene-by-Scene Script & Click Cues

### Scene 1: The Hook & Catastrophe Reality (0:00 – 0:45)
**Visual Cue:** Screen is on **Tab 1: Operations Pulse (08:00 AM Munich Storm)**. Cursor hovers over the header and the Capacity Ledger card (`46.5 Handler Hours Saved`).

> **Spoken Voiceover:**  
> "Hi Lukas, Jesse, and the Integral team. I'm Bidya, and this is the Kumulus AI Claims Cockpit designed for the Senior Product Builder role.
>
> It’s 07:45 AM on Tuesday, July 14th, 2026. Overnight, a severe hailstorm battered Munich, dumping 9,140 claims across the company. Lena Huber arrives at Desk #4 with **270 claims** on her plate. 
> 
> Under the legacy workflow, opening, verifying, and drafting emails for 270 claims one by one takes over **40 handler hours**. By Friday, customers are screaming, repair slots are lost, and rental costs explode.
> 
> Rather than giving Lena an open-ended chatbot that wastes time chatting, we built a dual-speed operational cockpit: instant deterministic batch resolution for standard claims, and hard human-in-the-loop prioritization for the cases that actually carry commercial and legal risk."

---

### Scene 2: The 5 Operational Landmines & 1-Click Batching (0:45 – 1:50)
**Visual Cue:** Scroll down smoothly to the **"5 Operational Landmines Requiring Lena's Intervention"** grid. Point out the red warning cards, then click **"Review & Bulk Send"** on the *33 Haftpflicht Storm Claims* tile.

> **Spoken Voiceover:**  
> "When we analyzed the 270 claims in Lena's inbox, we discovered **5 critical operational landmines**:
>
> 1. **117 broken windshield claims** where cars cannot be driven legally under German traffic law (StVZO § 40).
> 2. **39 drivable dent claims** needing mass triage at the Munich Olympic Park hub.
> 3. **21 duplicate pairs (42 claims total)** submitted across phone, app, and WhatsApp.
> 4. **Ursula Popescu at Autohaus Brandl**, whose reserved 1:00 PM repair slot expires at noon today.
> 5. And right here: **33 liability-only (Haftpflicht) claims** where naive generic AI suggested paying out storm damage. Storm damage requires comprehensive (*Teilkasko*) coverage. If Lena auto-approved those drafts, Kumulus would leak **€132,000 in unentitled payouts**.
>
> Let’s fix that right now. Lena clicks **'Review & Bulk Send'**."

**Visual Cue:** Inside the **Batch Reply & Dispatch Engine** modal:
1. Show the dynamic cluster switcher (Haftpflicht, Klarsicht Glass, Dekra Hub, Duplicates).
2. Highlight the message template: show the **official German legal text** on top, and the **English translation** below.
3. Show the dynamic variable interpolation (`{{customer_name}}`, `{{claim_id}}`, `{{policy_id}}`, `{{handler_name}}`).
4. Click **"Execute Batch Dispatch (33 Notifications)"**.

> **Spoken Voiceover:**  
> "Notice how this modal operates. It doesn't send opaque bulk spam. Every single message adheres to German insurance standards: the official German legal wording comes first, followed cleanly by the English translation for non-German speakers.
>
> Dynamic tokens like policy number, claim ID, and deductible are deterministically interpolated—zero LLM hallucination risk.
>
> Lena reviews the selection and clicks **Execute Batch Dispatch**. Instantly, 33 legally compliant rejections are logged to the GoBD audit ledger, blocking €132,000 in leakage and saving 8.25 handler hours.
>
> In under 3 minutes, Lena can clear all 4 clusters: glass dispatch, drive-in hubs, duplicates, and liability rejections—reclaiming **46.5 handler hours** before her first morning coffee."

---

### Scene 3: Hard Human-in-the-Loop (HITL) Execution (1:50 – 2:50)
**Visual Cue:** Switch tabs at the top to **"Case Management"**.
1. Click the filter button: **"🚨 Action Needed / Unsolved (2)"**.
2. Select claim `KS-26-104234` (**Ursula Popescu**).

> **Spoken Voiceover:**  
> "Now let's switch to **Case Management**. Notice how the queue immediately reflects our morning batch actions. The standard claims are resolved, leaving Lena with the true exceptions under **Action Needed**.
>
> Let's look at **Ursula Popescu**. Her 2023 Audi Q5 has hail damage. The repair shop, Autohaus Brandl, submitted an estimate of €3,860 net. Our automated benchmark check confirms this is within the regional Dekra threshold of €3,910.
>
> But here’s the urgency: the shop reserved a repair slot for **1:00 PM today**, which expires at **12:00 PM sharp**. If Lena misses it, the next slot is in late August, forcing Kumulus to pay €350+ in replacement rental car costs."

**Visual Cue:** Click the green button: **"⚡ 1-Click Approve Freigabe (€3,860 net)"**. Show the modal confirmation and state update.

> **Spoken Voiceover:**  
> "With one click, Lena approves the *Reparaturfreigabe*. The written confirmation is dispatched, the workshop slot is locked, and the claim status updates to Approved."

**Visual Cue:** Select claim `KS-26-104413` (**Tom Clarke**). Highlight the red alert: *"Rule 7: Mobility Rental Cap Breached (14 Days)"*.

> **Spoken Voiceover:**  
> "Next, **Tom Clarke**. Tom has had a replacement rental car for 13 days and asked to extend through July 22nd. 
> 
> The generic AI draft hallucinated and promised him a free extension through Day 21. But under Kumulus Policy Rule 7, mobility rentals are capped at 14 days without managerial approval.
> 
> Instead of letting that draft go out, our cockpit flags the breach and provides Lena with a **1-Click Escalate to Team Lead** button. She halts unauthorized rental spend in one second."

---

### Scene 4: Dynamic Policy Studio & Rule Extensibility (2:50 – 3:35)
**Visual Cue:** Switch tabs to **"Business Rules Engine"**.
1. Hover over the **Interactive Surge Thresholds** card.
2. Drag the **Workshop KVA Benchmark Threshold** slider (e.g., from 100% to 110%).
3. Click **"Run Simulation on 270 Claims"** and point to the live recalculation of Clearance % and Review Queue.
4. Click **"+ Add New Business Rule"**. Show the rule modal with Rule ID `RULE-08` and version increment to `v2.5`.

> **Spoken Voiceover:**  
> "A core question in the assignment was: *Should business rules be editable or extensible?*
>
> The answer is an absolute **yes**. In a catastrophe, fixed static rules break down.
>
> Here in the **Policy Studio**, Lena's Team Lead can dynamically calibrate heuristics in real time. For example, if partner workshops are overwhelmed, they can adjust the estimate threshold slider or mobility cap.
>
> Before any rule change goes live, our **Pre-Commit Simulation Engine** backtests it against the active 270-claim dataset, showing the exact impact on queue clearance and leakage risk.
>
> Furthermore, leads can click **Add New Business Rule** to author disaster-specific heuristics—such as fast-tracking minor dent repairs under €1,500. Every change increments our GoBD version ledger from `v2.4` to `v2.5` with a permanent audit trail."

---

### Scene 5: The North Star Metric & Closing (3:35 – 4:05)
**Visual Cue:** Navigate back to **Operations Pulse** or point to the overall metrics banner.

> **Spoken Voiceover:**  
> "Finally: *Which one number tells Kumulus that this tool genuinely works?*
>
> It is **NOT** Loss Adjustment Expense (LAE), which is a lagging accounting metric calculated months later by finance. Nor is it **Handler Throughput**, which is a vanity metric that encourages adjusters to rubber-stamp bad drafts.
>
> The North Star Metric is:  
> **'First-Touch Repair Induction Rate $\ge$ 85% within 24 Hours (with Zero Handler Rework)'**.
>
> It measures the true end-to-end outcome: getting the damaged car into an authorized repair track—whether that's a Klarsicht driveway van or a Dekra hub—on the very first touch, with zero downstream customer callbacks, zero duplicate inquiries, and zero financial leakage.
>
> This tool doesn't just display data; it solves the catastrophe by 08:15 AM.
>
> Thanks for watching, and I look forward to discussing this in detail with the team!"

---

## Quick Reference Checklist Before Recording
- [ ] Browser window sized to 16:9 (1920 × 1080).
- [ ] Top bar "Reset to 08:00 AM State" clicked.
- [ ] Microphone input level verified (no background hum).
- [ ] Tabs checked: Dashboard $\rightarrow$ Case Management $\rightarrow$ Business Rules all load smoothly.
- [ ] Vercel URL verified: `https://integral-claims-cockpit.vercel.app`.
