<p align="center">
  <img src="https://img.shields.io/badge/PROCOM-2026-gold?style=for-the-badge&labelColor=1B4D3E" alt="PROCOM 2026" />
  <img src="https://img.shields.io/badge/JS%20Bank-Fintech%20Challenge-1B4D3E?style=for-the-badge" alt="JS Bank" />
  <img src="https://img.shields.io/badge/Status-Live-10B981?style=for-the-badge" alt="Live" />
</p>

<h1 align="center">
  <br>
  <strong>Sarmaya</strong> &nbsp;سرمایہ
  <br>
  <sub>AI-Powered WhatsApp Banking for Pakistan's 2.3M Freelancers</sub>
</h1>

<p align="center">
  <strong>Voice-authenticated banking on WhatsApp</strong> &mdash; no app download, no branch visit, no traditional credit history needed.
</p>

<p align="center">
  <a href="https://procom-hackathon.up.railway.app"><img src="https://img.shields.io/badge/Live%20Demo-procom--hackathon.up.railway.app-F5A623?style=for-the-badge&logo=railway&logoColor=white" alt="Live Demo" /></a>
</p>

---

## The Problem

> **96.8% of Pakistan's freelancers are excluded from formal banking.**

Pakistan has **2.3 million registered IT freelancers** (PSEB 2024) earning **$500M+ annually** in foreign exchange. Yet almost none can:
- Open a bank account (no salary slip, no credit history)
- Get a loan or credit card
- Prove income for rent, visa, or vehicle financing

Traditional banks require documents freelancers don't have. Sarmaya fixes this.

## The Solution

**Sarmaya** is a complete digital banking platform built on **WhatsApp** (180M users in Pakistan) with:

| Feature | How It Works |
|---------|-------------|
| **Voice Biometric Auth** | Enroll with 3 voice samples, verify identity with your voice |
| **AI Banking Assistant** | Speak or type in English/Urdu to check balance, transfer money, pay bills |
| **Alternative Credit Scoring** | 7-factor AI model using freelance earnings instead of traditional credit history |
| **Blockchain Income Proof** | Immutable on-chain income certificates for loan/visa/rent applications |
| **Smart Product Recommendations** | AI-driven cross-sell: Nano Loans, Takaful, Visa Cards |
| **Real-time Fraud Detection** | 7-factor risk scoring on every transaction |
| **Responsible AI** | Consent management, bias auditing, full decision transparency |
| **Shariah-Compliant Mode** | Toggle Islamic banking products (Murabaha, Takaful, Sukuk) |
| **Admin Dashboard** | Bank management view with analytics, compliance, fraud monitoring |

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           Railway Cloud (Docker)         │
                    │                                         │
  WhatsApp ──────►  │  ┌─────────────┐   ┌──────────────────┐ │
  180M Users        │  │ WhatsApp Bot │   │  Express API     │ │
                    │  │ (Voice Auth) │◄─►│  (25+ endpoints) │ │
                    │  └──────┬───┘      └────────┬─────────┘ │
                    │         │                    │           │
                    │  ┌──────▼────────────────────▼─────────┐ │
                    │  │        Shared In-Memory Engine       │ │
                    │  │  Banking | Credit | Fraud | AI       │ │
                    │  │  Blockchain | Analytics | Shariah    │ │
                    │  └─────────────────────────────────────┘ │
                    │                    │                      │
                    │         ┌──────────▼──────────┐          │
  Browser ────────► │         │  React Dashboard    │          │
  (Admin/User)      │         │  (Vite + Recharts)  │          │
                    │         └─────────────────────┘          │
                    └─────────────────────────────────────────┘
                                      │
                              ┌───────▼───────┐
                              │ Polygon Amoy  │
                              │ (Blockchain)  │
                              └───────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS, Recharts, jsPDF |
| **Backend** | Node.js 22, Express 5 |
| **WhatsApp** | whatsapp-web.js + Puppeteer |
| **AI/NLP** | GPT-4o (chat + function calling), Whisper (voice-to-text) |
| **Voice Auth** | Resemblyzer (Python), voice biometric embeddings |
| **TTS** | OpenAI TTS (voice replies in English/Urdu) |
| **Blockchain** | ethers.js on Polygon Amoy testnet |
| **Credit Scoring** | Custom 7-factor weighted model |
| **Fraud Detection** | Real-time 7-factor risk scoring engine |
| **Deployment** | Docker on Railway |

## Live Demo

**Dashboard:** [procom-hackathon.up.railway.app](https://procom-hackathon.up.railway.app)

| Login | Credentials |
|-------|------------|
| **Admin** (Bank View) | `sarah.malik@jsbank.com` / `admin` |
| **User** (Freelancer) | Register with any `923XXXXXXXXX` phone |

## Features Deep Dive

### Voice Authentication
- **Enrollment:** 3 voice samples create a biometric profile
- **Verification:** Speaker verification using cosine similarity on voice embeddings
- **Technology:** Resemblyzer (lightweight ~17MB model) with librosa preprocessing

### Alternative Credit Scoring (7 Factors)
| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Income Consistency | 25% | Monthly earning stability |
| Income Level | 20% | Average monthly USD earnings |
| Platform Rating | 15% | Upwork/Fiverr/Toptal ratings |
| Platform Diversity | 10% | Number of active platforms |
| Account Age | 10% | Freelancing experience |
| Transaction Frequency | 10% | Banking activity level |
| Spending Behavior | 10% | Savings rate |

### Fraud Detection (7 Risk Factors)
Real-time scoring on every transaction: Amount Anomaly, Velocity, Time Pattern, Recipient Analysis, Daily Limits, Structuring Detection, Account Maturity.

### SBP Compliance
Fully aligned with State Bank of Pakistan's Digital Banking Framework:
- NFIS 2023-2028 alignment
- eKYC via voice biometrics
- AML/CFT automated screening
- ESFCA purpose code tagging (SBP-9471)
- Consent-based data management

## Quick Start (Local Development)

### Prerequisites
- Node.js 22+
- Python 3.8+
- ffmpeg (`brew install ffmpeg`)

### Setup

```bash
# Clone
git clone https://github.com/MuhammadMehroz786/Hackathon.git
cd Hackathon

# Install Node dependencies
npm install

# Install Python dependencies
pip3 install -r requirements.txt

# Install dashboard dependencies
cd sarmaya-dashboard && npm install && cd ..

# Create .env file
cp .env.example .env
# Add your OPENAI_API_KEY and optionally POLYGON_PRIVATE_KEY
```

### Run

```bash
# Terminal 1: Backend (WhatsApp Bot + API Server)
node index.js

# Terminal 2: Dashboard (dev mode)
cd sarmaya-dashboard && npm run dev
```

- **API Server:** http://localhost:4000
- **Dashboard:** http://localhost:3000
- **WhatsApp:** Scan QR code from terminal

## WhatsApp Commands

| Command | Description |
|---------|-------------|
| `start` / `hi` | Begin enrollment or login |
| Send voice | Authenticate with voice biometrics |
| `balance` | Check account balance (PKR + USD) |
| `transactions` | View recent transaction history |
| `transfer <account> <amount>` | Send money |
| `bill <type> <amount>` | Pay utility bills |
| `credit score` | View AI-generated credit score |
| `income proof` | Generate blockchain-verified income certificate |
| `products` | See personalized product recommendations |
| `shariah on/off` | Toggle Islamic banking mode |
| `help` | Show all commands |
| `logout` | End session |

## Project Structure

```
Hackathon/
├── index.js                 # WhatsApp bot + server entry point
├── server.js                # Express API (25+ routes)
├── banking.js               # Banking engine + 25 seeded customers
├── ai.js                    # GPT-4o integration + Whisper + TTS
├── voiceAuth.py             # Voice biometric authentication
├── creditScore.js           # 7-factor alternative credit scoring
├── fraudDetection.js        # Real-time fraud risk engine
├── blockchain.js            # Polygon Amoy integration
├── responsibleAI.js         # Consent, bias audit, transparency
├── crossSell.js             # Product recommendation engine
├── shariahMode.js           # Islamic finance products
├── analytics.js             # Portfolio metrics & dashboards
├── businessCase.js          # ROI & revenue projections
├── users.js                 # User registry (web + WhatsApp)
├── utils.js                 # Audio processing utilities
├── Dockerfile               # Production container
├── railway.toml             # Railway deployment config
├── requirements.txt         # Python dependencies (CPU-only torch)
└── sarmaya-dashboard/       # React admin + user dashboard
    ├── src/App.jsx          # Full SPA (2400+ lines)
    └── dist/                # Production build
```

## Business Case

| Metric | Value |
|--------|-------|
| **TAM** | 2.3M Pakistani freelancers |
| **Revenue/Customer** | PKR 3,500/month |
| **CAC** | PKR 50 (WhatsApp viral) |
| **CAC Payback** | 0.5 months |
| **Gross Margin** | 98.1% |
| **Y1 Revenue (6% penetration)** | PKR 5.8B |

## Team

Built for **PROCOM 2026 Hackathon** - JS Bank Fintech Challenge

---

<p align="center">
  <sub>Built with passion for financial inclusion in Pakistan</sub>
</p>
