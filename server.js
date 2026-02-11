/**
 * Sarmaya Express API Server
 * Runs in same process as WhatsApp bot to share in-memory data
 */
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as banking from './banking.js';
import * as creditScore from './creditScore.js';
import * as blockchain from './blockchain.js';
import * as responsibleAI from './responsibleAI.js';
import * as fraudDetection from './fraudDetection.js';
import * as crossSell from './crossSell.js';
import * as analytics from './analytics.js';
import * as businessCase from './businessCase.js';
import * as shariahMode from './shariahMode.js';
import * as users from './users.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sarmaya-hackathon-secret-2026';

export function startServer(port = 4000) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // ===================== AUTH =====================

    app.post('/api/auth/register', (req, res) => {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }
        if (!/^923\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone must be 923XXXXXXXXX format' });
        }

        const result = users.registerUser(name, email, password, phone);
        if (!result.success) return res.status(400).json(result);

        banking.createAccount(phone, name);
        responsibleAI.grantStandardConsents(phone);
        analytics.trackEvent('customer_enrolled', { phone });

        const token = jwt.sign({ phone, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
        const account = banking.getAccountDetails(phone);
        const profile = banking.getFreelancerProfile(phone);

        res.json({
            success: true,
            token,
            user: { name, email, phone, role: 'user' },
            account: account.success ? account.account : null,
            profile: profile.success ? profile.profile : null
        });
    });

    app.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = users.authenticateByEmail(email, password);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        let account = null;
        let profile = null;
        if (user.role === 'user' && banking.accountExists(user.phone)) {
            const accResult = banking.getAccountDetails(user.phone);
            if (accResult.success) account = accResult.account;
            const profResult = banking.getFreelancerProfile(user.phone);
            if (profResult.success) profile = profResult.profile;
        }

        res.json({ success: true, token, user, account, profile });
    });

    // ===================== JWT MIDDLEWARE =====================

    function authMiddleware(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
            req.userPhone = decoded.phone;
            req.userRole = decoded.role;
            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    }

    function adminOnly(req, res, next) {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
    }

    // ===================== BANKING =====================

    app.get('/api/banking/balance', authMiddleware, (req, res) => {
        res.json(banking.getBalance(req.userPhone));
    });

    app.get('/api/banking/transactions', authMiddleware, (req, res) => {
        const limit = parseInt(req.query.limit) || 20;
        res.json(banking.getTransactionHistory(req.userPhone, limit));
    });

    app.post('/api/banking/transfer', authMiddleware, async (req, res) => {
        const { toAccount, amount, description } = req.body;
        if (!toAccount || !amount) {
            return res.status(400).json({ success: false, message: 'Account and amount required' });
        }

        const risk = fraudDetection.assessTransactionRisk(req.userPhone, {
            type: 'DEBIT', amount: Number(amount), recipient: toAccount, description: description || ''
        });

        if (risk.assessment && risk.assessment.shouldBlock) {
            return res.json({
                success: false,
                message: 'Transaction blocked by fraud detection',
                risk: risk.assessment
            });
        }

        const result = banking.transferMoney(req.userPhone, toAccount, Number(amount), description || '');

        if (result.success) {
            try {
                const bcResult = await blockchain.logTransaction(req.userPhone, result.transaction);
                if (bcResult.success) {
                    banking.updateTransactionBlockchainHash(req.userPhone, result.transaction.id, bcResult.txHash);
                    result.blockchain = bcResult;
                }
            } catch (e) { /* blockchain optional */ }
            analytics.trackEvent('transaction', { amount, type: 'transfer' });
        }

        res.json({ ...result, risk: risk.assessment || null });
    });

    app.post('/api/banking/pay-bill', authMiddleware, async (req, res) => {
        const { billType, amount, reference } = req.body;
        if (!billType || !amount) {
            return res.status(400).json({ success: false, message: 'Bill type and amount required' });
        }

        const result = banking.payBill(req.userPhone, billType, Number(amount), reference || '');

        if (result.success) {
            try {
                const bcResult = await blockchain.logTransaction(req.userPhone, result.transaction);
                if (bcResult.success) {
                    banking.updateTransactionBlockchainHash(req.userPhone, result.transaction.id, bcResult.txHash);
                    result.blockchain = bcResult;
                }
            } catch (e) { /* blockchain optional */ }
            analytics.trackEvent('transaction', { amount, type: 'bill_payment' });
        }

        res.json(result);
    });

    app.get('/api/banking/account', authMiddleware, (req, res) => {
        res.json(banking.getAccountDetails(req.userPhone));
    });

    app.get('/api/banking/profile', authMiddleware, (req, res) => {
        res.json(banking.getFreelancerProfile(req.userPhone));
    });

    app.get('/api/banking/income-proof', authMiddleware, (req, res) => {
        const months = parseInt(req.query.months) || 6;
        res.json(banking.generateIncomeProof(req.userPhone, months));
    });

    app.get('/api/banking/spending', authMiddleware, (req, res) => {
        res.json(banking.getSpendingBreakdown(req.userPhone));
    });

    app.get('/api/banking/rates', authMiddleware, (req, res) => {
        res.json(banking.getExchangeRates());
    });

    // ===================== CREDIT SCORE =====================

    app.get('/api/credit/score', authMiddleware, (req, res) => {
        const data = banking.getTransactionDataForScoring(req.userPhone);
        if (!data) {
            return res.status(404).json({ success: false, message: 'No data available for scoring' });
        }
        const result = creditScore.calculateCreditScore(data);
        const explanation = responsibleAI.explainCreditScore(result);
        responsibleAI.logAIDecision({
            userId: req.userPhone, type: 'credit_score',
            input: 'Transaction data', output: result.creditScore,
            confidence: '94%', explanation: 'Alternative credit scoring model'
        });
        res.json({ ...result, explanation });
    });

    // ===================== BLOCKCHAIN =====================

    app.get('/api/blockchain/status', authMiddleware, (req, res) => {
        res.json(blockchain.getStatus());
    });

    app.get('/api/blockchain/stats', authMiddleware, async (req, res) => {
        try {
            const stats = await blockchain.getFreelancerBlockchainStats(req.userPhone);
            res.json(stats);
        } catch (e) {
            res.json({ success: false, message: 'Blockchain stats unavailable' });
        }
    });

    app.post('/api/blockchain/income-proof', authMiddleware, async (req, res) => {
        try {
            const result = await blockchain.generateOnChainIncomeProof(req.userPhone);
            res.json(result);
        } catch (e) {
            res.json({ success: false, message: 'Blockchain proof generation failed' });
        }
    });

    // ===================== RESPONSIBLE AI =====================

    app.get('/api/ai/consents', authMiddleware, (req, res) => {
        res.json(responsibleAI.getConsentSummary(req.userPhone));
    });

    app.post('/api/ai/consent', authMiddleware, (req, res) => {
        const { consentType, granted } = req.body;
        if (!consentType || granted === undefined) {
            return res.status(400).json({ success: false, message: 'consentType and granted required' });
        }
        res.json(responsibleAI.recordConsent(req.userPhone, consentType, granted));
    });

    app.get('/api/ai/bias-report', authMiddleware, (req, res) => {
        res.json(responsibleAI.generateBiasReport());
    });

    app.get('/api/ai/audit-log', authMiddleware, (req, res) => {
        const limit = parseInt(req.query.limit) || 20;
        res.json(responsibleAI.getAuditLog(req.userPhone, limit));
    });

    // ===================== CROSS-SELL =====================

    app.get('/api/products/recommendations', authMiddleware, (req, res) => {
        const data = banking.getTransactionDataForScoring(req.userPhone);
        if (!data) {
            return res.status(404).json({ success: false, message: 'No data for recommendations' });
        }
        const creditResult = creditScore.calculateCreditScore(data);
        const recs = crossSell.getRecommendations(data, creditResult);
        res.json(recs);
    });

    // ===================== SHARIAH =====================

    app.get('/api/shariah/mode', authMiddleware, (req, res) => {
        res.json({ success: true, enabled: shariahMode.isShariahMode(req.userPhone) });
    });

    app.post('/api/shariah/mode', authMiddleware, (req, res) => {
        const { enabled } = req.body;
        res.json(shariahMode.setShariaMode(req.userPhone, !!enabled));
    });

    app.get('/api/shariah/products', authMiddleware, (req, res) => {
        res.json(shariahMode.getShariahProducts());
    });

    // ===================== ADMIN: ANALYTICS =====================

    app.get('/api/analytics/dashboard', authMiddleware, adminOnly, (req, res) => {
        res.json(analytics.getDashboard());
    });

    app.get('/api/analytics/funnel', authMiddleware, adminOnly, (req, res) => {
        res.json(analytics.getAcquisitionFunnel());
    });

    app.get('/api/analytics/compliance', authMiddleware, adminOnly, (req, res) => {
        res.json(analytics.getSBPComplianceReport());
    });

    // ===================== ADMIN: CUSTOMERS =====================

    app.get('/api/admin/customers', authMiddleware, adminOnly, (req, res) => {
        const allAccounts = banking.listAllAccounts();
        const enriched = allAccounts.map(a => {
            let score = null;
            try {
                const data = banking.getTransactionDataForScoring(a.phone);
                if (data) {
                    const result = creditScore.calculateCreditScore(data);
                    score = result.creditScore ? result.creditScore.score : null;
                }
            } catch (e) { /* scoring optional */ }
            return { ...a, creditScore: score };
        });
        res.json({ success: true, customers: enriched });
    });

    // ===================== ADMIN: FRAUD =====================

    app.get('/api/fraud/dashboard', authMiddleware, adminOnly, (req, res) => {
        res.json(fraudDetection.getFraudDashboard());
    });

    // ===================== ADMIN: BUSINESS CASE =====================

    app.get('/api/business/case', authMiddleware, adminOnly, (req, res) => {
        const opts = {};
        if (req.query.y1) opts.penetrationRate = Number(req.query.y1);
        if (req.query.y2) opts.year2Rate = Number(req.query.y2);
        if (req.query.y3) opts.year3Rate = Number(req.query.y3);
        res.json(businessCase.generateBusinessCase(opts));
    });

    app.get('/api/business/revenue', authMiddleware, adminOnly, (req, res) => {
        res.json(businessCase.calculatePerCustomerRevenue());
    });

    // ===================== DASHBOARD (Static Files) =====================

    const dashboardPath = path.join(__dirname, 'sarmaya-dashboard', 'dist');
    app.use(express.static(dashboardPath));

    // SPA catch-all: serve index.html for any non-API route
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            res.sendFile(path.join(dashboardPath, 'index.html'));
        } else {
            next();
        }
    });

    // ===================== SEED & START =====================

    users.seedAdminUser();

    const host = process.env.RAILWAY_ENVIRONMENT ? '0.0.0.0' : 'localhost';
    app.listen(port, host, () => {
        console.log(`\n🌐 Sarmaya API Server running on http://${host}:${port}`);
        console.log(`   Register: POST http://${host}:${port}/api/auth/register`);
        console.log(`   Login:    POST http://${host}:${port}/api/auth/login\n`);
    });

    return app;
}
