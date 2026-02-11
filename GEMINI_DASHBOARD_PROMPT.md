# Gemini Prompt: Build the Sarmaya Web Dashboard

You are building a **complete, production-ready Next.js 14 web dashboard** for **Sarmaya** (سرمایہ — "Capital" in Urdu), an AI-powered WhatsApp banking platform for Pakistani freelancers, built for JS Bank. The dashboard serves two audiences: **freelancer users** and **bank administrators**. It connects to the existing Node.js backend that powers the WhatsApp chatbot.

---

## 1. PROJECT CONTEXT

### What Is Sarmaya?

Sarmaya addresses Pakistan's **96.8% freelancer banking exclusion** — out of 2.3 million freelancers, only 38,000 are banked. The platform provides:

- **Voice biometric authentication** via WhatsApp (Resemblyzer)
- **GPT-4o conversational banking** (30 banking functions via function calling)
- **Blockchain-verified income proof** (Polygon Amoy / Solidity smart contract)
- **Alternative credit scoring** (7-factor model, 300–850 range)
- **Islamic banking (Shariah mode)** with Murabaha/Takaful products
- **Real-time fraud detection** (7-factor risk scoring, 0–100)
- **AI-powered product recommendations** (cross-sell engine, 10 products)
- **Bank analytics dashboard** with SBP compliance reporting

The existing system uses **WhatsApp as the primary interface**. This web dashboard is the **secondary interface** — a visual portal where freelancers can view their data and bank admins can monitor the platform.

### Tech Stack for the Dashboard

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| UI Library | **React 18** with Server Components |
| Styling | **Tailwind CSS** + **shadcn/ui** components |
| Charts | **Recharts** (for analytics graphs) |
| Auth | **NextAuth.js v5** (email/password, role-based) |
| State | **React Context** + server actions (no Redux) |
| API Layer | Next.js **Route Handlers** (`/app/api/...`) calling existing backend modules |
| Language | **TypeScript** throughout |
| Package Manager | **npm** |

### Directory Structure

```
sarmaya-dashboard/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing / marketing page
│   ├── globals.css                   # Tailwind imports
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login form
│   │   ├── register/page.tsx         # Registration form
│   │   └── layout.tsx                # Auth layout (centered card)
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard shell (sidebar + topbar)
│   │   ├── user/                     # FREELANCER views
│   │   │   ├── page.tsx              # User home / overview
│   │   │   ├── transactions/page.tsx # Transaction history
│   │   │   ├── transfer/page.tsx     # Send money form
│   │   │   ├── bills/page.tsx        # Pay bills
│   │   │   ├── credit-score/page.tsx # Credit score report
│   │   │   ├── income-proof/page.tsx # Blockchain income proof
│   │   │   ├── products/page.tsx     # Recommended products
│   │   │   ├── profile/page.tsx      # Freelancer profile
│   │   │   └── settings/page.tsx     # Shariah mode, preferences
│   │   └── admin/                    # BANK ADMIN views
│   │       ├── page.tsx              # Admin home / KPI overview
│   │       ├── customers/page.tsx    # Customer list + search
│   │       ├── customers/[id]/page.tsx # Individual customer detail
│   │       ├── analytics/page.tsx    # Platform analytics
│   │       ├── fraud/page.tsx        # Fraud detection dashboard
│   │       ├── business-case/page.tsx# Revenue projections
│   │       ├── compliance/page.tsx   # SBP compliance report
│   │       ├── blockchain/page.tsx   # Blockchain explorer stats
│   │       ├── cross-sell/page.tsx   # Cross-sell performance
│   │       └── responsible-ai/page.tsx # Bias reports + consent audit
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handlers
│       ├── user/
│       │   ├── balance/route.ts
│       │   ├── transactions/route.ts
│       │   ├── transfer/route.ts
│       │   ├── bills/route.ts
│       │   ├── credit-score/route.ts
│       │   ├── income-proof/route.ts
│       │   ├── verify-transaction/route.ts
│       │   ├── products/route.ts
│       │   ├── profile/route.ts
│       │   ├── spending/route.ts
│       │   ├── exchange-rates/route.ts
│       │   ├── settings/shariah/route.ts
│       │   └── shariah-products/route.ts
│       └── admin/
│           ├── dashboard/route.ts
│           ├── customers/route.ts
│           ├── customers/[id]/route.ts
│           ├── customers/[id]/risk-profile/route.ts
│           ├── fraud/route.ts
│           ├── business-case/route.ts
│           ├── per-customer-revenue/route.ts
│           ├── compliance/route.ts
│           ├── blockchain/route.ts
│           ├── cross-sell/route.ts
│           ├── bias-report/route.ts
│           └── analytics/route.ts
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── layout/
│   │   ├── Sidebar.tsx               # Role-aware sidebar navigation
│   │   ├── Topbar.tsx                # User avatar, notifications, logout
│   │   └── MobileNav.tsx             # Responsive hamburger menu
│   ├── charts/
│   │   ├── BalanceChart.tsx           # Line chart — balance over time
│   │   ├── SpendingPieChart.tsx       # Pie chart — spending categories
│   │   ├── RevenueBarChart.tsx        # Bar chart — revenue breakdown
│   │   ├── FraudHeatmap.tsx           # Risk level distribution
│   │   ├── CreditScoreGauge.tsx       # Gauge / radial chart
│   │   └── FunnelChart.tsx            # Acquisition funnel
│   ├── cards/
│   │   ├── BalanceCard.tsx            # Big balance number + trend
│   │   ├── StatCard.tsx               # Generic KPI card
│   │   ├── TransactionRow.tsx         # Single transaction line item
│   │   ├── ProductCard.tsx            # Cross-sell product card
│   │   └── AlertCard.tsx              # Fraud / compliance alert
│   └── forms/
│       ├── TransferForm.tsx           # Send money form
│       ├── BillPaymentForm.tsx        # Pay bill form
│       └── LoginForm.tsx              # Email + password login
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── backend.ts                    # Import bridge to backend modules
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # Formatters, helpers
├── middleware.ts                      # Route protection (auth + role checks)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 2. AUTHENTICATION SYSTEM

### Requirements

- **Email + password authentication** using NextAuth.js v5 (Credentials provider)
- Two roles: `user` (freelancer) and `admin` (bank employee)
- Store users in a JSON file or SQLite database (keep it simple for the hackathon)
- Registration requires: **name**, **email**, **password**, **phone number** (Pakistani format: `923XXXXXXXXX`)
- The phone number links the web dashboard user to their WhatsApp chatbot account
- **Only registered dashboard users can use the WhatsApp chatbot** — the bot checks if the phone number exists in the user database
- Admins are seeded manually (no public admin registration)

### Auth Flow

```
Registration:
  1. User fills form: name, email, password, phone
  2. Server validates, hashes password (bcrypt)
  3. Creates account in backend (calls banking.createAccount(phone, name))
  4. Grants standard AI consents (calls responsibleAI.grantStandardConsents(userId))
  5. Redirects to /user dashboard

Login:
  1. User enters email + password
  2. NextAuth validates credentials
  3. JWT session includes: { id, name, email, phone, role }
  4. Redirects to /user or /admin based on role

Route Protection (middleware.ts):
  - /user/* → requires role === 'user'
  - /admin/* → requires role === 'admin'
  - /api/user/* → requires authenticated user
  - /api/admin/* → requires authenticated admin
  - / , /login, /register → public
```

### Session Shape

```typescript
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;         // Links to WhatsApp identity
    role: 'user' | 'admin';
  }
}
```

---

## 3. BACKEND API SPECIFICATION

The dashboard calls the **existing backend modules** directly (same Node.js process). Each Next.js route handler imports the backend module and calls the function. Below is every API route with its corresponding backend function call.

### 3A. USER API ROUTES

---

#### `GET /api/user/balance`
**Backend call:** `banking.getBalance(session.user.phone)`
**Returns:**
```json
{
  "success": true,
  "balance": 250000,
  "currency": "PKR",
  "accountNumber": "JSB123456789",
  "balanceUSD": "897"
}
```

---

#### `GET /api/user/transactions?limit=10`
**Backend call:** `banking.getTransactionHistory(session.user.phone, limit)`
**Returns:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "TXN1707123456789_ABC",
      "type": "CREDIT",
      "amount": 55900,
      "amountUSD": 200,
      "currency": "PKR",
      "from": "Upwork",
      "timestamp": "2025-02-05T14:30:00.000Z",
      "status": "COMPLETED",
      "description": "Payment for Web Development Project",
      "category": "freelance_income",
      "exchangeRate": 279.5,
      "blockchainHash": "0xabc..."
    }
  ],
  "count": 10,
  "totalTransactions": 24
}
```

---

#### `POST /api/user/transfer`
**Request body:** `{ toAccountNumber: string, amount: number, description?: string }`
**Backend calls:**
1. `fraudDetection.assessTransactionRisk(userId, { type: 'TRANSFER', amount, recipient: toAccountNumber, description })`
2. If risk action is not `BLOCK`: `banking.transferMoney(phone, toAccountNumber, amount, description)`
3. If successful: `blockchain.logTransaction(userId, transaction)`
**Returns:**
```json
{
  "success": true,
  "message": "PKR 5,000 transferred to JSB987654321",
  "transaction": { "id": "...", "type": "DEBIT", "amount": 5000, "..." : "..." },
  "newBalance": 245000,
  "riskAssessment": { "riskScore": 12, "riskLevel": "Low", "action": "APPROVE" },
  "blockchainHash": "0x..."
}
```

---

#### `POST /api/user/bills`
**Request body:** `{ billType: string, amount: number, billReference?: string }`
**Supported bill types:** `electricity` (K-Electric), `gas` (SSGC), `phone` (PTCL), `internet`, `mobile` (Jazz/Telenor top-up)
**Backend call:** `banking.payBill(phone, billType, amount, billReference)`
**Returns:**
```json
{
  "success": true,
  "message": "K-Electric bill of PKR 3,500 paid",
  "transaction": { "..." : "..." },
  "newBalance": 241500
}
```

---

#### `GET /api/user/credit-score`
**Backend calls:**
1. `banking.getTransactionDataForScoring(phone)` → returns `{ profile, transactions, account, monthlyEarnings, platforms }`
2. `creditScore.calculateCreditScore(data)`
3. `responsibleAI.explainCreditScore(scoreResult)`
**Returns:**
```json
{
  "success": true,
  "creditScore": {
    "score": 742,
    "range": "Good",
    "emoji": "🟢",
    "maxScore": 850
  },
  "components": [
    { "name": "Income Consistency", "score": 85, "weight": "25%", "detail": "Regular monthly earnings" },
    { "name": "Income Level", "score": 78, "weight": "20%", "detail": "Above average freelancer income" },
    { "name": "Platform Diversity", "score": 60, "weight": "10%", "detail": "Active on 2 platforms" },
    { "name": "Platform Rating", "score": 92, "weight": "15%", "detail": "4.8/5.0 average rating" },
    { "name": "Account Age", "score": 70, "weight": "10%", "detail": "8 months with JS Bank" },
    { "name": "Transaction Frequency", "score": 75, "weight": "10%", "detail": "Regular transaction pattern" },
    { "name": "Spending Behavior", "score": 68, "weight": "10%", "detail": "Moderate spending pattern" }
  ],
  "loanEligibility": {
    "eligible": true,
    "maxLoanAmount": 500000,
    "interestRate": "18%",
    "maxTenure": "24 months",
    "monthlyEMI": 24900
  },
  "recommendations": [
    "Diversify to a 3rd freelancing platform",
    "Maintain consistent monthly earnings above $500"
  ],
  "explanation": {
    "summary": "Your credit score is based on 7 factors...",
    "positiveFactors": ["Strong platform ratings", "Consistent income"],
    "improvementAreas": ["Add more platforms", "Increase account tenure"]
  }
}
```

---

#### `GET /api/user/income-proof?months=6`
**Backend calls:**
1. `banking.generateIncomeProof(phone, months)`
2. `blockchain.generateOnChainIncomeProof(userId)`
**Returns:**
```json
{
  "success": true,
  "incomeProof": {
    "freelancerName": "Ahmed Khan",
    "accountNumber": "JSB123456789",
    "period": "Last 6 months",
    "totalIncomePKR": 1500000,
    "totalIncomeUSD": 5386,
    "monthlyAverage": 250000,
    "platforms": ["Upwork", "Fiverr"],
    "transactionCount": 24,
    "verificationDate": "2025-02-12",
    "bankCertified": true
  },
  "blockchainProof": {
    "txHash": "0x...",
    "explorerUrl": "https://amoy.polygonscan.com/tx/0x...",
    "blockNumber": 12345678
  }
}
```

---

#### `GET /api/user/products`
**Backend calls:**
1. `banking.getTransactionDataForScoring(phone)` → data
2. `creditScore.calculateCreditScore(data)` → creditResult
3. `crossSell.getRecommendations(data, creditResult)`
**Returns:**
```json
{
  "success": true,
  "creditScore": 742,
  "avgMonthlyIncome": 250000,
  "recommendations": [
    {
      "product": {
        "id": "nano_loan",
        "name": "Zindigi Nano Loan",
        "nameUrdu": "زندگی نینو لون",
        "type": "lending",
        "description": "Instant micro-loan up to PKR 100,000"
      },
      "eligibility": { "isEligible": true, "matchScore": 0.89 },
      "priority": 1,
      "bankRevenue": { "annual": 18000, "formatted": "PKR 18,000/yr" }
    }
  ]
}
```

**All 9 products:** Zindigi Nano Loan, Freelancer Credit Line (500K), Zindigi Visa Debit, JS Bank Visa Credit Card, Freelancer Income Takaful, Family Health Takaful, JS Investments Growth Fund, National Savings via JS Bank, ESFCA Premium Account.

---

#### `GET /api/user/profile`
**Backend call:** `banking.getFreelancerProfile(phone)`
**Returns:**
```json
{
  "success": true,
  "profile": {
    "name": "Ahmed Khan",
    "phone": "923001234567",
    "accountNumber": "JSB123456789",
    "platforms": [
      { "name": "Upwork", "rating": 4.9, "totalEarned": 12500, "activeMonths": 18 },
      { "name": "Fiverr", "rating": 4.7, "totalEarned": 4200, "activeMonths": 12 }
    ],
    "skills": ["Web Development", "React", "Node.js", "UI/UX Design"],
    "monthlyEarnings": [
      { "month": "2025-01", "amountUSD": 950, "amountPKR": 264575 },
      { "month": "2024-12", "amountUSD": 800, "amountPKR": 222800 }
    ],
    "totalEarnedUSD": 16700,
    "registeredSince": "2024-06-15",
    "kycVerified": true,
    "esfcaEnabled": true,
    "city": "Karachi",
    "cnic": "42201-XXXXXXX-X"
  }
}
```

---

#### `GET /api/user/spending`
**Backend call:** `banking.getSpendingBreakdown(phone)`
**Returns:**
```json
{
  "success": true,
  "breakdown": [
    { "category": "Bills & Utilities", "amount": 15000, "percentage": 30, "emoji": "💡" },
    { "category": "Food & Dining", "amount": 8000, "percentage": 16, "emoji": "🍔" },
    { "category": "Shopping", "amount": 5000, "percentage": 10, "emoji": "🛍️" },
    { "category": "Transport", "amount": 3000, "percentage": 6, "emoji": "🚗" },
    { "category": "Transfers", "amount": 12000, "percentage": 24, "emoji": "💸" },
    { "category": "Mobile Top-up", "amount": 2000, "percentage": 4, "emoji": "📱" }
  ],
  "totalSpent": 50000,
  "currency": "PKR"
}
```

---

#### `GET /api/user/exchange-rates`
**Backend call:** `banking.getExchangeRates()`
**Returns:**
```json
{
  "success": true,
  "rates": {
    "USD_TO_PKR": 278.50,
    "EUR_TO_PKR": 302.30,
    "GBP_TO_PKR": 352.10,
    "AED_TO_PKR": 75.85
  },
  "lastUpdated": "2025-02-12T10:00:00.000Z"
}
```

---

#### `POST /api/user/settings/shariah`
**Request body:** `{ enabled: boolean }`
**Backend call:** `shariahMode.setShariaMode(userId, enabled)`
**Returns:**
```json
{
  "success": true,
  "shariahMode": true,
  "message": "Shariah-compliant mode activated",
  "messageUrdu": "شریعہ موڈ فعال ہو گیا"
}
```

---

#### `GET /api/user/shariah-products`
**Backend call:** `shariahMode.getShariahProducts()`
**Returns a list of Shariah-compliant product alternatives** (Murabaha financing, Takaful insurance, Sukuk savings, Wadiah accounts).

---

### 3B. ADMIN API ROUTES

---

#### `GET /api/admin/dashboard`
**Backend call:** `analytics.getDashboard()`
**Returns:**
```json
{
  "customerMetrics": {
    "enrolled": 1247,
    "activeThisMonth": 892,
    "growthRate": "12.5%",
    "churnRate": "2.1%"
  },
  "financialMetrics": {
    "deposits": "PKR 185M",
    "loanBook": "PKR 45M",
    "nplRatio": "1.8%",
    "fxVolume": "PKR 23M"
  },
  "aiMetrics": {
    "conversations": 15680,
    "voiceCommands": 4230,
    "creditScores": 890,
    "fraudAlerts": 23
  },
  "blockchainMetrics": {
    "onChainTxns": 8920,
    "incomeProofs": 456
  },
  "crossSellMetrics": {
    "recommendations": 3450,
    "conversions": 567,
    "topProducts": ["Nano Loan", "Visa Debit", "Takaful"]
  },
  "complianceMetrics": {
    "sbpReporting": "Compliant",
    "amlScreening": "Active",
    "kycCompletion": "94%"
  }
}
```

---

#### `GET /api/admin/customers`
**Backend call:** iterate over all accounts in `banking.js` in-memory store
**Returns:** Array of customer summaries (name, phone, balance, account age, credit score range, risk level, platforms). Support search/filter by name, phone, city, platform.

---

#### `GET /api/admin/customers/[id]`
**Backend calls:**
1. `banking.getAccountDetails(phone)`
2. `banking.getFreelancerProfile(phone)`
3. `banking.getTransactionHistory(phone, 20)`
4. `creditScore.calculateCreditScore(data)`
5. `responsibleAI.getConsentSummary(userId)`
**Returns:** Complete customer profile with account, transactions, credit score, consent status.

---

#### `GET /api/admin/fraud`
**Backend call:** `fraudDetection.getFraudDashboard()`
**Returns:**
```json
{
  "success": true,
  "dashboard": {
    "totalAlerts": 23,
    "criticalAlerts": 2,
    "highAlerts": 5,
    "mediumAlerts": 8,
    "lowAlerts": 8,
    "blockedTransactions": 2,
    "flaggedForReview": 5,
    "recentAlerts": [
      {
        "userId": "923001234567",
        "riskScore": 85,
        "riskLevel": "High",
        "action": "REQUIRE_VERIFICATION",
        "factors": ["Amount anomaly", "Velocity check"],
        "timestamp": "2025-02-12T09:15:00Z"
      }
    ]
  }
}
```

**Risk factors assessed (7 weighted):**
- Amount anomaly (25%) — unusual transaction size
- Velocity (20%) — too many transactions in short period
- Time pattern anomaly (15%) — transactions at unusual hours
- Recipient analysis (15%) — new or suspicious recipients
- Daily limit proximity (10%) — approaching daily transfer limits
- Structuring detection (10%) — split transactions to avoid limits
- Account age (5%) — newer accounts are riskier

---

#### `GET /api/admin/business-case?penetrationRate=5&year2Rate=12&year3Rate=20`
**Backend call:** `businessCase.generateBusinessCase({ penetrationRate, year2Rate, year3Rate })`
**Returns:**
```json
{
  "marketOpportunity": {
    "TAM": 2300000,
    "currentlyBanked": 38000,
    "exclusionRate": "96.8%",
    "gapSize": 2262000
  },
  "threeYearProjections": [
    { "year": 1, "customers": 113100, "deposits": "PKR 31.5B", "revenue": "PKR 2.1B", "profit": "PKR 890M" },
    { "year": 2, "customers": 271440, "deposits": "PKR 75.6B", "revenue": "PKR 5.0B", "profit": "PKR 2.3B" },
    { "year": 3, "customers": 452400, "deposits": "PKR 126B", "revenue": "PKR 8.4B", "profit": "PKR 4.1B" }
  ],
  "revenueBreakdown": {
    "fx": "42%",
    "lending": "28%",
    "deposits": "15%",
    "crossSell": "10%",
    "transactionFees": "5%"
  },
  "competitiveAdvantage": {
    "cacReduction": "60% vs traditional",
    "nplReduction": "40% with AI credit scoring",
    "channelAdvantage": "WhatsApp reaches 96% of smartphones"
  }
}
```

---

#### `GET /api/admin/compliance`
**Backend call:** `analytics.getSBPComplianceReport()`
**Returns:** SBP (State Bank of Pakistan) compliance status including NFIS alignment, AML/KYC metrics, ESFCA account status, and reporting status.

---

#### `GET /api/admin/blockchain`
**Backend calls:**
1. `blockchain.getStatus()` → `{ initialized, mode, network, explorerUrl }`
2. `blockchain.getFreelancerBlockchainStats(userId)` for each freelancer (aggregate)
**Returns:**
```json
{
  "networkStatus": {
    "initialized": true,
    "mode": "LIVE",
    "network": "Polygon Amoy Testnet",
    "explorerUrl": "https://amoy.polygonscan.com"
  },
  "aggregateStats": {
    "totalOnChainTransactions": 8920,
    "totalIncomeProofs": 456,
    "uniqueFreelancersOnChain": 312
  },
  "perFreelancerExample": {
    "success": true,
    "transactionCount": 24,
    "totalIncomePKR": 1500000,
    "network": "Polygon Amoy",
    "contractAddress": "0x..."
  }
}
```

---

#### `GET /api/admin/cross-sell`
**Backend call:** aggregate cross-sell data from `crossSell.getRecommendations()` across customers
**Returns:** Product recommendation performance — total recommendations, conversion rates, revenue per product, top-performing products.

---

#### `GET /api/admin/bias-report`
**Backend call:** `responsibleAI.generateBiasReport()`
**Returns:**
```json
{
  "success": true,
  "report": {
    "title": "Sarmaya AI Bias & Fairness Report",
    "checks": [
      { "name": "Gender Neutrality", "status": "PASS", "detail": "No gender-based features in credit model" },
      { "name": "Location Neutrality", "status": "PASS", "detail": "City not used in scoring" },
      { "name": "Demographic Data", "status": "PASS", "detail": "No ethnic/religious data collected" },
      { "name": "Income Source Equity", "status": "PASS", "detail": "All freelance platforms weighted equally" }
    ],
    "overallStatus": "COMPLIANT"
  }
}
```

---

#### `GET /api/admin/customers/[id]/risk-profile`
**Backend call:** `fraudDetection.getUserRiskProfile(userId)`
**Returns:**
```json
{
  "success": true,
  "userId": "923001234567",
  "overallRiskLevel": "Low",
  "totalTransactions": 24,
  "flaggedTransactions": 1,
  "blockedTransactions": 0,
  "riskHistory": [
    { "date": "2025-02-10", "riskScore": 12, "action": "APPROVE" },
    { "date": "2025-02-08", "riskScore": 45, "action": "FLAG_FOR_REVIEW" }
  ]
}
```

---

#### `POST /api/user/verify-transaction`
**Request body:** `{ transactionId: string }`
**Backend calls:**
1. Find transaction from `banking.getTransactionHistory(phone)`
2. `blockchain.verifyTransaction(userId, transaction)`
**Returns:**
```json
{
  "success": true,
  "exists": true,
  "timestamp": "2025-02-05T14:30:00.000Z",
  "dataHash": "0xabc...",
  "explorerUrl": "https://amoy.polygonscan.com/tx/0x..."
}
```

---

#### `GET /api/admin/per-customer-revenue`
**Backend call:** `businessCase.calculatePerCustomerRevenue()`
**Returns:**
```json
{
  "perCustomer": { "monthly": 1750, "annual": 21000 },
  "ltvToCacRatio": 8.4
}
```

---

#### `GET /api/admin/analytics/funnel`
**Backend call:** `analytics.getAcquisitionFunnel()`
**Returns:** Customer acquisition funnel data — WhatsApp Contact → Enrolled → KYC Complete → First Transaction → Active User, with conversion rates between each stage.

---

## 4. UI / UX DESIGN SPECIFICATIONS

### 4A. Design System

**Color Palette:**
- Primary: `#1B4D3E` (JS Bank green — dark emerald)
- Primary Light: `#2D7A5F`
- Accent: `#F5A623` (gold — represents "Sarmaya"/capital)
- Background: `#F8FAFB` (light gray)
- Card Background: `#FFFFFF`
- Text Primary: `#1A1A2E`
- Text Secondary: `#6B7280`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- Info: `#3B82F6`

**Typography:**
- Headings: Inter (bold)
- Body: Inter (regular)
- Urdu text: Noto Nastaliq Urdu (for bilingual labels)
- Monospace: JetBrains Mono (for account numbers, hashes)

**Border Radius:** `0.75rem` (rounded-xl) for cards, `0.5rem` for buttons/inputs.

**Shadows:** Subtle — `shadow-sm` for cards, `shadow-md` on hover.

### 4B. Landing Page (`/`)

A single-page marketing site with:

1. **Hero Section:** "سرمایہ — Banking for Pakistan's Freelancers" with a phone mockup showing WhatsApp chat. CTA buttons: "Open Account" → `/register`, "Bank Login" → `/login`.
2. **Stats Bar:** "2.3M Freelancers | 96.8% Unbanked | $500M+ Earnings" — animated counters.
3. **Features Grid (6 cards):**
   - Voice Banking via WhatsApp
   - Blockchain Income Proof
   - AI Credit Scoring
   - Instant Transfers (PKR ↔ USD)
   - Islamic Banking Mode
   - Fraud Protection
4. **How It Works (3 steps):** Register → Connect WhatsApp → Start Banking
5. **Footer:** JS Bank logo, PROCOM 2026, compliance badges.

### 4C. Auth Pages

**Login Page (`/login`):**
- Clean centered card
- Email input, password input, "Sign In" button
- Link to registration
- JS Bank + Sarmaya logos at top

**Register Page (`/register`):**
- Full Name, Email, Password, Confirm Password, Phone Number (with `+92` prefix)
- Phone number validation: must be 11 digits starting with `03`
- After registration, auto-create banking account
- Link to login

### 4D. Freelancer Dashboard Pages

#### User Home (`/user`)
A summary dashboard with:

| Component | Content |
|-----------|---------|
| **Balance Card** (large) | PKR balance with USD equivalent, account number, "Send Money" + "Pay Bill" quick action buttons |
| **Recent Transactions** (list, 5 items) | Last 5 transactions with type icon, description, amount (green for credit, red for debit), date |
| **Credit Score Badge** | Circular gauge showing score (300-850), range label (Poor/Fair/Good/Excellent), link to full report |
| **Income Trend** (line chart) | Monthly earnings over last 6 months (PKR + USD toggle) |
| **Exchange Rates** (mini card) | USD/PKR, EUR/PKR, GBP/PKR rates |
| **Quick Actions** (4 buttons) | Transfer, Pay Bill, Income Proof, Credit Score |

#### Transactions Page (`/user/transactions`)
- **Filterable table** with columns: Date, Description, Type (Credit/Debit badge), Amount, Category, Status, Blockchain Hash (clickable link to Polygonscan)
- Filter by: date range, type (credit/debit), category
- Pagination (10 per page)
- Export to CSV button

#### Transfer Page (`/user/transfer`)
- **Form:** Recipient Account Number (JSB format), Amount (PKR), Description (optional)
- **Live validation:** account format check
- **Risk indicator:** after form submission, show the fraud risk assessment result (Low/Medium/High) before confirming
- **Confirmation step:** Show summary before executing
- **Success state:** Show transaction ID, new balance, blockchain hash with explorer link

#### Bills Page (`/user/bills`)
- **Bill type selector:** Electricity (K-Electric), Gas (SSGC), Phone (PTCL), Internet, Mobile Top-up
- Amount input, reference number input
- Quick amount buttons: PKR 1,000, 2,000, 5,000, 10,000
- Confirmation + success flow similar to transfer

#### Credit Score Page (`/user/credit-score`)
- **Large circular gauge** showing score (742/850)
- **7 component bars:** Each factor shown as a labeled progress bar with score (0-100) and weight percentage
- **Loan eligibility section:** Max loan amount, interest rate, tenure, EMI — in a highlighted card
- **Recommendations list:** Actionable tips to improve score
- **Transparency section** (Responsible AI): "How your score is calculated" — explains data used, shows that no gender/location bias exists

#### Income Proof Page (`/user/income-proof`)
- **Certificate-style card** showing: Name, Account, Period, Total Income (PKR + USD), Monthly Average, Platforms, Transaction Count, Bank Certification stamp
- **Blockchain verification:** Transaction hash with link to Polygonscan, block number
- "Generate New Proof" button
- "Download PDF" button (generates a styled PDF of the proof)

#### Products Page (`/user/products`)
- **Grid of product cards** (2 columns on desktop, 1 on mobile)
- Each card: Product name (English + Urdu), type badge (Lending/Insurance/Investment/Card), description, eligibility status (Eligible ✓ / Not Eligible ✗), match score percentage, "Apply" button
- Sort by: Priority, Match Score, Revenue
- If Shariah mode is ON, show Shariah-compliant alternatives

#### Profile Page (`/user/profile`)
- **Freelancer card:** Name, City, CNIC (masked), Registration date, KYC status badge
- **Platforms section:** Each platform with name, rating (stars), total earned, active months
- **Skills tags:** Displayed as pill badges
- **Monthly Earnings table:** Month, USD amount, PKR amount — scrollable

#### Settings Page (`/user/settings`)
- **Shariah Mode toggle:** Switch between conventional and Islamic banking
- **Consent management:** Toggle switches for: Voice Data, Transaction Logging, Credit Scoring, AI Analysis — with descriptions of what each consent covers
- **Language preference:** English / Urdu toggle (affects UI labels)
- **Notification preferences**

### 4E. Admin Dashboard Pages

#### Admin Home (`/admin`)
A KPI-heavy overview:

| Row | Content |
|-----|---------|
| **Top Stats** (4 cards) | Total Customers, Active This Month, Total Deposits, NPL Ratio |
| **Revenue Chart** (bar) | Monthly revenue breakdown: FX, Lending, Deposits, Cross-sell, Fees |
| **Customer Growth** (line) | Enrolled customers over time |
| **AI Metrics** (4 small cards) | Conversations, Voice Commands, Credit Scores Generated, Fraud Alerts |
| **Blockchain Stats** (2 cards) | On-chain Transactions, Income Proofs |
| **Compliance Status** (badge row) | SBP Reporting ✓, AML Screening ✓, KYC Completion 94% |

#### Customers Page (`/admin/customers`)
- **Search bar** with filters: name, phone, city, platform, credit score range
- **Sortable table:** Name, Phone, City, Balance, Credit Score, Platforms, Risk Level, Account Age
- Click row → navigate to `/admin/customers/[id]`
- Pagination

#### Customer Detail (`/admin/customers/[id]`)
- **Profile header:** Name, phone, city, KYC badge, account number
- **Tabs:**
  - Overview: Balance, credit score gauge, platforms, skills
  - Transactions: Full transaction history table
  - Credit Report: 7-factor breakdown
  - Blockchain: On-chain transaction hashes
  - Consent: Current consent status for all 4 consent types
  - Risk: Fraud risk assessment history

#### Analytics Page (`/admin/analytics`)
- **Acquisition Funnel** (funnel chart): WhatsApp Contact → Enrolled → KYC → First Txn → Active
- **Platform Distribution** (pie chart): Upwork vs Fiverr vs Freelancer.com breakdown
- **Geographic Distribution** (table/map): Users by city
- **Session Analytics:** Avg session duration, messages per session, voice vs text ratio

#### Fraud Dashboard (`/admin/fraud`)
- **Alert summary** (4 stat cards): Critical, High, Medium, Low alerts
- **Alert list:** Sortable table — User, Risk Score, Risk Level, Action Taken, Factors, Timestamp
- **Risk distribution** (pie chart): Percentage of transactions at each risk level
- **Blocked Transactions list:** Transactions that were blocked with details
- **Factor Analysis** (bar chart): Which fraud factors trigger most often

#### Business Case (`/admin/business-case`)
- **Market Opportunity** (stat cards): TAM 2.3M, Currently Banked 38K, Gap 2.26M
- **3-Year Projection Table:** Year, New Customers, Deposits, Revenue, Profit, ROI
- **Revenue Breakdown** (donut chart): FX 42%, Lending 28%, Deposits 15%, Cross-sell 10%, Fees 5%
- **Competitive Advantage** (card list): CAC reduction 60%, NPL reduction 40%, WhatsApp reach 96%
- **Per-Customer Economics:** Monthly revenue, annual revenue, LTV:CAC ratio
- **Interactive sliders** for penetration rates (Year 1, 2, 3) — re-calculates projections in real-time

#### Compliance Page (`/admin/compliance`)
- **SBP Compliance Checklist:** Green/Yellow/Red status for each requirement
- **NFIS Alignment:** National Financial Inclusion Strategy mapping
- **AML/KYC Metrics:** Screening rate, completion percentage, flagged accounts
- **ESFCA Account Status:** Export-focused account compliance

#### Blockchain Page (`/admin/blockchain`)
- **Network Status:** LIVE or SIMULATION mode indicator, Polygon Amoy network info
- **Stats:** Total on-chain transactions, total income proofs, unique freelancers on-chain
- **Recent Transactions table:** FreelancerID, TxHash (linked to Polygonscan), Amount, Type, Block Number, Timestamp
- **Contract address** (linked to Polygonscan)

#### Cross-sell Page (`/admin/cross-sell`)
- **Performance Summary:** Total recommendations, conversion rate, revenue generated
- **Product Performance table:** Product Name, Times Recommended, Conversions, Conversion Rate, Revenue
- **Top Products** (bar chart): Ranked by conversion rate
- **Customer Tier Distribution** (pie chart): Premium, Standard, Basic

#### Responsible AI Page (`/admin/responsible-ai`)
- **Bias Report:** Display all bias checks with PASS/FAIL status
- **Overall Compliance Status:** COMPLIANT badge
- **Consent Audit:** How many users have granted each consent type (aggregate stats)
- **AI Decision Log:** Recent AI decisions with confidence levels and explanations
- **Data Transparency:** What data is collected, how it's used, retention policy

---

## 5. COMPONENT SPECIFICATIONS

### Sidebar Navigation

**User Sidebar:**
```
🏠 Home           → /user
💰 Transactions   → /user/transactions
📤 Send Money     → /user/transfer
📄 Pay Bills      → /user/bills
📊 Credit Score   → /user/credit-score
📜 Income Proof   → /user/income-proof
🛍️ Products       → /user/products
👤 Profile        → /user/profile
⚙️ Settings       → /user/settings
```

**Admin Sidebar:**
```
📊 Overview       → /admin
👥 Customers      → /admin/customers
📈 Analytics      → /admin/analytics
🛡️ Fraud Detection→ /admin/fraud
💼 Business Case  → /admin/business-case
✅ Compliance     → /admin/compliance
⛓️ Blockchain     → /admin/blockchain
🛍️ Cross-sell     → /admin/cross-sell
🤖 Responsible AI → /admin/responsible-ai
```

### Top Bar
- Left: Sarmaya logo + "سرمایہ" text
- Right: User name, role badge (Freelancer/Admin), avatar, logout button
- Mobile: Hamburger menu to toggle sidebar

### Reusable Components

**StatCard:** Icon, label, value (large number), trend arrow (up/down with percentage), color accent.

**TransactionRow:** Date, icon (credit ↓ green / debit ↑ red), description, amount formatted as PKR with commas, blockchain hash link (if available).

**CreditScoreGauge:** SVG circular gauge, score in center, color range (red 300-500, yellow 500-650, green 650-750, bright green 750-850).

**ProductCard:** Product name, Urdu name, type badge, description (2 lines), match score bar, eligibility badge, "Apply" CTA.

**AlertCard:** Severity badge (Critical=red, High=orange, Medium=yellow, Low=blue), user ID, risk score, factors list, timestamp, action taken.

---

## 6. DATA FLOW & INTEGRATION

### How the Dashboard Connects to the Backend

```
Browser → Next.js Route Handler → Backend Module → In-Memory Data → Response
```

The Next.js route handlers **directly import** the backend modules:

```typescript
// Example: app/api/user/balance/route.ts
import { getBalance } from '../../../../banking.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'user') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = getBalance(session.user.phone);
  return Response.json(result);
}
```

### WhatsApp Registration Gate

The WhatsApp chatbot (index.js) must check if a phone number is registered in the dashboard's user database before allowing enrollment. Add this check to the bot's enrollment flow:

```javascript
// In index.js, before starting enrollment:
import { isRegisteredUser } from './sarmaya-dashboard/lib/backend.ts';

// Only allow WhatsApp banking if user has a web dashboard account
if (!isRegisteredUser(phoneNumber)) {
  message.reply('Please register at sarmaya.jsbank.com first to use WhatsApp banking.');
  return;
}
```

### Shared Data

Both the WhatsApp bot and the web dashboard read/write to the **same in-memory data stores** in `banking.js`. This means:
- A transaction made via WhatsApp appears instantly on the web dashboard
- A transfer made via the web dashboard is visible in the WhatsApp chat
- Credit scores are consistent across both interfaces

---

## 7. RESPONSIVE DESIGN

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<768px) | Sidebar hidden (hamburger menu), single column, stacked cards |
| Tablet (768-1024px) | Collapsed sidebar (icons only), 2-column grid |
| Desktop (>1024px) | Full sidebar with labels, 3-4 column grid for cards |

- All tables become horizontally scrollable on mobile
- Charts resize responsively
- Forms use full width on mobile
- Bottom navigation bar on mobile for key actions (Home, Transfer, Bills, Profile)

---

## 8. KEY INTERACTIONS

### Transfer Money Flow
1. User fills form → clicks "Review Transfer"
2. Frontend calls `/api/user/transfer` with `{ toAccountNumber, amount, description }`
3. Backend runs fraud detection → returns risk assessment
4. If risk is Low/Medium: show confirmation dialog with risk badge
5. If risk is High: show warning with risk factors, require explicit confirmation
6. If risk is Critical: block transfer, show error message
7. On confirm: execute transfer, log to blockchain
8. Show success screen with: transaction ID, new balance, blockchain explorer link

### Credit Score Generation
1. User clicks "View Credit Score"
2. Loading skeleton shown
3. Backend computes all 7 factors
4. Animated gauge fills to score
5. Component bars animate in sequence
6. Loan eligibility card slides in
7. Recommendations appear below

### Admin Drill-Down
1. Admin sees customer list with risk indicators
2. Clicks on a customer row
3. Customer detail page loads with tabbed interface
4. Can view full transaction history, credit report, blockchain proofs, consent status
5. Can flag customer for review or export data

---

## 9. ERROR HANDLING

- **API errors:** Show toast notification with error message (use shadcn/ui `toast`)
- **Network errors:** Show "Connection lost" banner with retry button
- **Auth errors:** Redirect to `/login` with "Session expired" message
- **Form validation:** Inline errors below each field, red borders, error messages
- **Empty states:** Friendly illustrations with messages like "No transactions yet — receive your first payment to get started!"
- **Loading states:** Skeleton loaders for cards and tables, spinner for form submissions

---

## 10. IMPLEMENTATION NOTES

1. **Use shadcn/ui CLI** to add components: `npx shadcn-ui@latest add button card input table badge dialog toast sheet tabs` etc.
2. **Use Recharts** for all charts — wrap in responsive containers.
3. **Use `next-auth` v5** with Credentials provider — store users in a `users.json` file for simplicity.
4. **Format all PKR amounts** with commas: `PKR 1,250,000` using `Intl.NumberFormat('en-PK')`.
5. **Blockchain hashes** should be truncated in UI (`0x1234...abcd`) with full hash on hover/click.
6. **All API routes** must check authentication and role before proceeding.
7. **Use Server Components** where possible (data fetching pages), Client Components for interactive elements (forms, toggles, charts).
8. **Add `"use client"` directive** only to components that need browser APIs or event handlers.
9. **Seed demo data** on first load: Create a demo freelancer account with 6 months of transaction history, multiple platforms, and realistic Pakistani freelancer data.
10. **Bilingual support:** Key labels should have both English and Urdu text where appropriate (especially for Shariah products, landing page, and financial terms).

---

## 11. SEED DATA FOR DEMO

Create realistic demo data for a freelancer named **Ahmed Khan** from Karachi:

```javascript
{
  name: "Ahmed Khan",
  phone: "923001234567",
  email: "ahmed@example.com",
  city: "Karachi",
  platforms: [
    { name: "Upwork", rating: 4.9, totalEarned: 12500, activeMonths: 18 },
    { name: "Fiverr", rating: 4.7, totalEarned: 4200, activeMonths: 12 }
  ],
  skills: ["Web Development", "React", "Node.js", "UI/UX Design"],
  monthlyEarnings: [
    { month: "2025-01", amountUSD: 950 },
    { month: "2024-12", amountUSD: 800 },
    { month: "2024-11", amountUSD: 1100 },
    { month: "2024-10", amountUSD: 750 },
    { month: "2024-09", amountUSD: 900 },
    { month: "2024-08", amountUSD: 650 }
  ],
  balance: 350000, // PKR
  transactions: 24 // pre-seeded with diverse types
}

// Admin seed:
{
  name: "Sarah Malik",
  email: "sarah.malik@jsbank.com",
  role: "admin",
  title: "VP Digital Banking"
}
```

---

## 12. DELIVERABLES CHECKLIST

Generate ALL of the following files as a working Next.js project:

- [ ] `package.json` with all dependencies
- [ ] `next.config.js`
- [ ] `tailwind.config.ts` with custom colors
- [ ] `tsconfig.json`
- [ ] `app/layout.tsx` — root layout with providers
- [ ] `app/globals.css` — Tailwind + custom styles
- [ ] `app/page.tsx` — landing page
- [ ] Auth pages (login, register)
- [ ] All user dashboard pages (9 pages)
- [ ] All admin dashboard pages (9 pages)
- [ ] All API route handlers (user + admin)
- [ ] All reusable components (sidebar, topbar, charts, cards, forms)
- [ ] `middleware.ts` — route protection
- [ ] `lib/auth.ts` — NextAuth configuration
- [ ] `lib/types.ts` — TypeScript interfaces
- [ ] `lib/utils.ts` — helper functions
- [ ] `lib/backend.ts` — backend module bridge
- [ ] Seed data file for demo
- [ ] Mobile responsive layout
- [ ] Error handling and loading states

---

## IMPORTANT FINAL NOTES

1. **This must be a COMPLETE, working project** — not just a skeleton. Every page should be fully implemented with real UI components and data fetching.
2. **Use the exact API structures defined above** — the response shapes match what the backend modules actually return.
3. **The dashboard is the SECONDARY interface** — the primary interface is WhatsApp. The dashboard provides visual access to the same data.
4. **Pakistan-specific details matter:** PKR currency formatting, Pakistani phone numbers (03XX-XXXXXXX), Urdu text support, SBP compliance, Shariah banking.
5. **The look and feel should be professional and banking-grade** — this is for JS Bank, one of Pakistan's major banks. Think fintech dashboard, not hobby project.
6. **Dark mode is NOT required** — keep it light theme only to reduce complexity.
7. **The project should run with `npm run dev`** after setup and show working pages with seeded demo data immediately.
