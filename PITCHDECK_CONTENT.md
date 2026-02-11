# Sarmaya — Pitch Deck Content

Use this to build your slides. Each section = 1 slide. Aim for 10-12 slides, 3 minutes total.

---

## SLIDE 1: Title

**Sarmaya — سرمایہ**
*AI-Powered WhatsApp Banking for Pakistan's Freelancers*

- Built for JS Bank
- PROCOM 2026
- Team Name / Members

Logo: Gold "S" on emerald background + سرمایہ in Nastaliq

---

## SLIDE 2: The Problem

**96.8% of Pakistan's freelancers are unbanked.**

| Stat | Number |
|------|--------|
| Total freelancers in Pakistan | **2.3 Million** |
| Currently banked | **38,000** |
| Exclusion rate | **96.8%** |
| Pakistan freelance exports (2024) | **$500M+** |
| Pakistan's global freelancer rank | **#4 worldwide** |

**Why are they excluded?**
- No salary slips → can't prove income → no credit score
- Banks require branch visits → freelancers work remotely
- Traditional KYC is slow and document-heavy
- No products designed for irregular, multi-currency income

*"Pakistan has the 4th largest freelancer population in the world, yet almost none of them can get a bank loan."*

---

## SLIDE 3: The Solution

**Sarmaya** = WhatsApp + AI + Blockchain banking designed for freelancers

**One line:** Send a voice message on WhatsApp. Get verified, check your balance, transfer money, prove your income, and get a loan — all in Urdu or English.

**Three pillars:**
1. **Voice biometric auth** — Your voice is your password (no PINs, no passwords)
2. **AI banker** — GPT-4o handles 30 banking functions through natural conversation
3. **Blockchain income proof** — Immutable freelance income certificates on Polygon

**Why WhatsApp?**
- 96% of Pakistani smartphones have WhatsApp
- Zero app download required
- Works on low-end phones with limited data

---

## SLIDE 4: How It Works (User Journey)

**Step 1: Register** on the Sarmaya web dashboard (name, email, phone)
→ Account created instantly, KYC initiated

**Step 2: Open WhatsApp** and message the Sarmaya bot
→ Enroll your voice with 3 voice samples (10 seconds total)

**Step 3: Bank with your voice**
→ Send a voice note: *"Show my balance"* → AI responds with your balance
→ Type: *"Transfer 5000 to JSB987654321"* → Fraud check → Transfer done
→ Say: *"Generate my income proof"* → Blockchain-verified certificate created

**Step 4: Get financial products**
→ AI scores your credit (7 factors, no CNIC history needed)
→ Pre-approved nano loan up to PKR 500,000
→ Personalized product recommendations

---

## SLIDE 5: Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Channel | WhatsApp (whatsapp-web.js) | 96% reach, zero friction |
| AI Engine | GPT-4o (30 function calls) | Natural Urdu/English conversation |
| Voice Auth | Resemblyzer (Python) | Lightweight biometrics (17MB model) |
| Voice-to-Text | OpenAI Whisper | Urdu + English transcription |
| Blockchain | Polygon Amoy (Solidity) | Immutable income proofs |
| Credit Scoring | Custom 7-factor model | Works without traditional credit history |
| Fraud Detection | Real-time 7-factor risk engine | Protects every transaction |
| Dashboard | React + Vite + Tailwind | Visual portal for users & bank admins |

**All running on a single laptop. No cloud infrastructure required for demo.**

---

## SLIDE 6: AI Credit Scoring (Key Innovation)

**Problem:** Freelancers have zero credit history. Banks can't score them.

**Our solution:** 7-factor alternative credit model (300-850 range)

| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Income Consistency | 25% | Regular monthly earnings pattern |
| Income Level | 20% | Absolute earning power |
| Platform Rating | 15% | Upwork/Fiverr client ratings |
| Platform Diversity | 10% | Multiple income sources |
| Account Age | 10% | Banking relationship tenure |
| Transaction Frequency | 10% | Active usage pattern |
| Spending Behavior | 10% | Financial responsibility |

**Result:** A freelancer with 0 traditional credit history can get a score of 742 ("Good") and qualify for a PKR 500,000 loan.

**Responsible AI:** Gender-neutral, location-neutral, no demographic bias. Full consent management. Explainable scoring.

---

## SLIDE 7: Blockchain Income Proof (Key Innovation)

**Problem:** Freelancers can't get salary slips. Banks won't accept screenshots.

**Our solution:** Every transaction is logged on Polygon blockchain → generates a tamper-proof income certificate.

**How it works:**
1. Freelancer receives payment on Sarmaya → logged in `FreelancerIncomeLog.sol`
2. Transaction hash stored on Polygonscan (publicly verifiable)
3. "Generate Income Proof" → on-chain event with total income, transaction count
4. Bank-certified PDF with blockchain verification link

**Why it matters:**
- Replaces salary slips for loan applications
- Can be verified by ANY bank, not just JS Bank
- Immutable — can't be forged or altered
- SBP/NFIS aligned

---

## SLIDE 8: Bank Value Proposition (For Judges)

**This isn't just good for freelancers — it's a massive revenue opportunity for JS Bank.**

| Metric | Value |
|--------|-------|
| Market gap | 2.26M unbanked freelancers |
| Year 1 customers (5% penetration) | 113,000 |
| Year 1 deposits | PKR 31.5 Billion |
| Year 1 revenue | PKR 2.1 Billion |
| Customer acquisition cost | 60% lower than traditional |
| NPL reduction (AI scoring) | 40% improvement |
| 3-year revenue | PKR 15.5 Billion |

**Revenue streams:**
- FX margins on USD→PKR conversion (42%)
- Lending to scored freelancers (28%)
- Deposit float income (15%)
- Cross-sell: insurance, investments, cards (10%)
- Transaction fees (5%)

**Per-customer LTV:CAC ratio: 8.4x**

---

## SLIDE 9: Islamic Banking & Inclusion

**30%+ of Pakistani freelancers prefer Shariah-compliant products.**

Sarmaya has a built-in **Shariah Mode** toggle:
- Murabaha financing (instead of interest loans)
- Takaful insurance (instead of conventional)
- Sukuk savings (instead of bonds)
- Wadiah accounts (safekeeping deposits)
- All conventional terms auto-converted (interest → profit, loan → financing)

**This isn't a bolt-on — it's core to the product**, because financial inclusion means everyone.

---

## SLIDE 10: Fraud & Compliance

**Real-time fraud detection on every transaction:**
- 7 weighted risk factors (amount anomaly, velocity, time pattern, new recipient, daily limits, structuring, account age)
- Risk score 0-100 → Auto-approve / Flag / Verify / Block
- Critical transactions blocked instantly

**SBP Compliance:**
- NFIS 2023-2028 aligned
- AML/CFT screening (UNSC & NACTA lists)
- KYC with biometric verification
- ESFCA auto-registration for export freelancers
- Purpose code SBP-9471 auto-tagged

**Responsible AI:**
- 4-tier consent management (voice, transactions, credit, AI analysis)
- Full AI decision audit trail
- Bias testing: gender, location, demographic neutrality — all PASS

---

## SLIDE 11: Live Demo (Talking Points)

**Demo flow (recommended order, ~90 seconds):**

1. **Show login page** → "Sarmaya has two interfaces: WhatsApp for banking, web dashboard for visual access"
2. **Login as freelancer** → Show balance card, income chart, recent transactions
3. **Click Credit Score** → Show the 742 score with 7 factors → "This freelancer has zero traditional credit history but qualifies for a PKR 500K loan"
4. **Click Income Proof** → Show blockchain certificate → "This is verifiable by any bank on Polygonscan"
5. **Transfer money** → Show fraud risk assessment → "Every transaction is AI-screened in real-time"
6. **Switch to Admin** → Show KPIs, fraud dashboard, business case projections
7. **WhatsApp demo** (if time): Send a voice message → voice verified → balance check

**Backup:** If WhatsApp QR fails, use screen recording.

---

## SLIDE 12: Competitive Advantage

| Feature | Sarmaya | Traditional Banks | Easypaisa/JazzCash |
|---------|---------|------------------|-------------------|
| Channel | WhatsApp (96% reach) | Branch/App | App only |
| Auth | Voice biometrics | PIN/OTP | PIN |
| Credit Scoring | AI (no history needed) | CNIC-based only | None |
| Income Proof | Blockchain verified | Paper salary slips | None |
| Languages | Urdu + English (voice) | English forms | Urdu |
| Onboarding | 30 seconds | Days/weeks | Minutes |
| Islamic Banking | Built-in toggle | Separate branch | Limited |
| Freelancer Focus | 100% designed for | Afterthought | Not at all |

---

## SLIDE 13: What We Built (Technical Summary)

**11 modules, 60+ functions, fully working:**

| Module | Lines | What It Does |
|--------|-------|-------------|
| WhatsApp Bot | 955 | Message handling, voice flow, session management |
| AI Engine | 500+ | GPT-4o with 30 function-calling tools |
| Banking Core | 520 | Accounts, transfers, bills, FX rates |
| Credit Scoring | 349 | 7-factor alternative model (300-850) |
| Blockchain | 269 | Polygon smart contract + income proofs |
| Fraud Detection | 150+ | Real-time 7-factor risk assessment |
| Cross-sell | 150+ | 9-product AI recommendation engine |
| Shariah Mode | 150+ | Islamic banking product alternatives |
| Analytics | 150+ | Bank dashboard + SBP compliance |
| Business Case | 150+ | 3-year revenue projections |
| Responsible AI | 150+ | Consent, bias testing, audit trails |
| Web Dashboard | 2,355 | 15-page React dashboard (user + admin) |

**Total: ~5,500 lines of code. Built in a hackathon.**

---

## SLIDE 14: Ask / Close

**Sarmaya bridges the gap between Pakistan's $500M freelance economy and its banking system.**

**For freelancers:** Voice-powered banking on WhatsApp. No branch visits. No paperwork. Just talk.

**For JS Bank:** 2.26M untapped customers. PKR 15.5B in 3-year revenue. 60% lower acquisition cost.

**For Pakistan:** Financial inclusion for the workforce driving the country's digital exports.

---

## KEY TALKING POINTS (For Q&A)

**Q: Why WhatsApp and not a standalone app?**
A: 96% of Pakistani smartphones have WhatsApp. Zero download friction. Works on low-end devices with limited data. Freelancers already live on WhatsApp for client communication.

**Q: How is voice auth secure enough?**
A: Resemblyzer uses speaker embeddings (similar to Face ID but for voice). 75% cosine similarity threshold. 3-sample enrollment. Sessions auto-expire in 5 minutes. It's faster than OTP and can't be phished.

**Q: What if a freelancer has literally zero transaction history?**
A: We score platform data (Upwork rating, Fiverr reviews, earnings history) — data they already have. The first month of Sarmaya usage starts building their score immediately.

**Q: Is the blockchain real?**
A: Yes. Polygon Amoy testnet. Smart contract deployed. Transactions get real Polygonscan URLs. For production, it switches to Polygon mainnet with one config change.

**Q: How does this make money for the bank?**
A: Five revenue streams: FX margins (freelancers convert USD→PKR), lending (scored by our AI), deposit float, cross-sell (9 products), and transaction fees. Year 1 projected revenue: PKR 2.1 billion.

**Q: Why can't existing banks do this?**
A: They can — but they haven't. The freelancer segment requires voice-first UX, alternative credit scoring, and WhatsApp integration. None of Pakistan's banks offer this combination today. We built the entire stack in a hackathon weekend.
