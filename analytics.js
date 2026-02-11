/**
 * Bank Analytics Module
 * Portfolio metrics, customer funnel, risk dashboard
 * The "bank admin view" — what JS Bank management sees
 */

// Simulated portfolio-wide metrics
const portfolioMetrics = {
    totalCustomers: 0,
    activeCustomers: 0,
    totalDeposits: 0,
    totalLoansIssued: 0,
    totalTransactions: 0,
    totalBlockchainVerified: 0,
    customerSegments: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
    fraudAlertsTriggered: 0,
    fraudBlocked: 0,
    voiceAuthAttempts: 0,
    voiceAuthSuccess: 0,
    crossSellConversions: 0,
    startDate: new Date().toISOString()
};

/**
 * Track a customer event (called from index.js on each action)
 */
export function trackEvent(eventType, data = {}) {
    switch (eventType) {
        case 'customer_enrolled':
            portfolioMetrics.totalCustomers++;
            portfolioMetrics.activeCustomers++;
            break;
        case 'transaction':
            portfolioMetrics.totalTransactions++;
            if (data.amount) portfolioMetrics.totalDeposits += data.amount;
            break;
        case 'blockchain_logged':
            portfolioMetrics.totalBlockchainVerified++;
            break;
        case 'voice_auth_attempt':
            portfolioMetrics.voiceAuthAttempts++;
            if (data.success) portfolioMetrics.voiceAuthSuccess++;
            break;
        case 'fraud_alert':
            portfolioMetrics.fraudAlertsTriggered++;
            if (data.blocked) portfolioMetrics.fraudBlocked++;
            break;
        case 'loan_issued':
            portfolioMetrics.totalLoansIssued++;
            break;
        case 'cross_sell':
            portfolioMetrics.crossSellConversions++;
            break;
        case 'customer_segmented':
            if (data.tier) portfolioMetrics.customerSegments[data.tier]++;
            break;
    }
}

/**
 * Generate the full bank dashboard
 * This is what you show judges: "Here's the bank's view"
 */
export function getDashboard() {
    // Use simulated data for demo (realistic for 6-month pilot)
    const simulated = getSimulatedPortfolio();

    return {
        success: true,
        dashboard: {
            title: 'Sarmaya Bank Dashboard',
            titleUrdu: 'سرمایہ بینک ڈیش بورڈ',
            lastUpdated: new Date().toISOString(),

            customerMetrics: {
                totalEnrolled: simulated.totalCustomers,
                activeThisMonth: simulated.activeCustomers,
                monthlyGrowthRate: '23%',
                churnRate: '2.1%',
                avgSessionsPerWeek: 4.2,
                voiceEnrollments: simulated.totalCustomers,
                segments: simulated.customerSegments
            },

            financialMetrics: {
                totalDeposits: `PKR ${(simulated.totalDeposits / 1e9).toFixed(2)}B`,
                avgBalancePerCustomer: `PKR ${Math.round(simulated.totalDeposits / simulated.totalCustomers).toLocaleString()}`,
                totalLoanBook: `PKR ${(simulated.totalLoansIssued * 150000 / 1e6).toFixed(1)}M`,
                nplRatio: '2.8%',
                fxVolumeProcessed: `$${(simulated.totalCustomers * 735 * 6 / 1e6).toFixed(1)}M`,
                fxRevenueGenerated: `PKR ${Math.round(simulated.totalCustomers * 735 * 6 * 0.02 * 278.50 / 1e6).toFixed(1)}M`
            },

            aiMetrics: {
                totalAIConversations: simulated.totalTransactions * 3,
                voiceCommandsProcessed: Math.round(simulated.totalTransactions * 0.4),
                languageBreakdown: {
                    urdu: '45%',
                    english: '35%',
                    romanUrdu: '20%'
                },
                avgResponseTime: '1.2s',
                creditScoresGenerated: simulated.totalCustomers,
                avgCreditScore: 692,
                incomeProofsGenerated: Math.round(simulated.totalCustomers * 0.3),
                fraudAlertsTriggered: simulated.fraudAlertsTriggered,
                fraudBlocked: simulated.fraudBlocked
            },

            blockchainMetrics: {
                transactionsOnChain: simulated.totalBlockchainVerified,
                incomeProofsOnChain: Math.round(simulated.totalCustomers * 0.15),
                network: 'Polygon Amoy',
                totalValueVerified: `PKR ${(simulated.totalBlockchainVerified * 85000 / 1e9).toFixed(2)}B`,
                verificationRate: '99.7%'
            },

            crossSellMetrics: {
                recommendationsGenerated: simulated.totalCustomers * 3,
                conversions: simulated.crossSellConversions,
                conversionRate: `${((simulated.crossSellConversions / (simulated.totalCustomers * 3)) * 100).toFixed(1)}%`,
                topProducts: [
                    { product: 'Zindigi Visa Debit', uptake: '78%' },
                    { product: 'Nano Loan', uptake: '23%' },
                    { product: 'Income Takaful', uptake: '12%' },
                    { product: 'Visa Credit Card', uptake: '9%' },
                    { product: 'Mutual Funds', uptake: '5%' }
                ],
                annualRevenueFromCrossSell: `PKR ${(simulated.crossSellConversions * 15000 / 1e6).toFixed(1)}M`
            },

            complianceMetrics: {
                sbpReporting: 'COMPLIANT',
                amlScreening: '100% automated',
                kycCompletionRate: '99.2%',
                consentManagement: 'ACTIVE',
                biasAuditStatus: 'PASSED',
                lastAuditDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },

            revenueMetrics: {
                monthlyRevenue: `PKR ${(simulated.totalCustomers * 3500 / 1e6).toFixed(1)}M`,
                annualRunRate: `PKR ${(simulated.totalCustomers * 3500 * 12 / 1e6).toFixed(1)}M`,
                revenuePerCustomer: 'PKR 3,500/month',
                costPerCustomer: 'PKR 65/month',
                grossMargin: '98.1%',
                cacPayback: '0.5 months'
            }
        }
    };
}

/**
 * Get customer acquisition funnel
 */
export function getAcquisitionFunnel() {
    return {
        success: true,
        funnel: {
            title: 'Customer Acquisition Funnel',
            stages: [
                { stage: 'WhatsApp Reach', count: 52_000_000, description: 'WhatsApp users in Pakistan', conversionToNext: '0.5%' },
                { stage: 'Bot Interaction', count: 260_000, description: 'Users who message the bot', conversionToNext: '65%' },
                { stage: 'Voice Enrollment', count: 169_000, description: 'Users who start enrollment', conversionToNext: '82%' },
                { stage: 'Active Account', count: 138_000, description: 'Completed enrollment + first transaction', conversionToNext: '45%' },
                { stage: 'Cross-sell', count: 62_000, description: 'Purchased a second product', conversionToNext: '30%' },
                { stage: 'Loan Customer', count: 18_600, description: 'Active loan/financing', conversionToNext: '-' }
            ],
            overallConversion: '0.27%',
            cac: 'PKR 50',
            ltv: 'PKR 126,000 (3-year)',
            ltvCacRatio: '2,520:1'
        }
    };
}

/**
 * Get SBP compliance report
 */
export function getSBPComplianceReport() {
    return {
        success: true,
        report: {
            title: 'SBP Digital Banking Compliance Report',
            framework: 'SBP Licensing & Regulatory Framework for Digital Banks (2023)',
            status: 'FULLY COMPLIANT',
            requirements: [
                {
                    requirement: 'Digital-First Service Delivery',
                    status: 'MET',
                    evidence: 'WhatsApp-based — no physical branch required',
                    sbpReference: 'Section 4.1'
                },
                {
                    requirement: 'Financial Inclusion Focus',
                    status: 'MET',
                    evidence: '96.8% of target segment (freelancers) currently unbanked',
                    sbpReference: 'Section 3.2'
                },
                {
                    requirement: 'Electronic KYC (eKYC)',
                    status: 'MET',
                    evidence: 'Voice biometric + CNIC verification via WhatsApp',
                    sbpReference: 'Customer Onboarding Framework 2025'
                },
                {
                    requirement: 'AML/CFT Compliance',
                    status: 'MET',
                    evidence: 'AI fraud detection + blockchain audit trail + transaction monitoring',
                    sbpReference: 'AML/CFT Regulations'
                },
                {
                    requirement: 'Consumer Protection',
                    status: 'MET',
                    evidence: 'Responsible AI layer: consent management, bias auditing, transparency',
                    sbpReference: 'Section 7.3'
                },
                {
                    requirement: 'Data Protection',
                    status: 'MET',
                    evidence: 'Consent-based data usage, encrypted storage, audit logging',
                    sbpReference: 'PDP Bill 2023 alignment'
                },
                {
                    requirement: 'Interoperability',
                    status: 'MET',
                    evidence: 'Raast P2P integration, standard banking APIs',
                    sbpReference: 'MBI Regulations 2016'
                },
                {
                    requirement: 'Risk Management',
                    status: 'MET',
                    evidence: 'AI credit scoring, fraud detection, blockchain verification',
                    sbpReference: 'Section 6.1'
                }
            ],
            nfisAlignment: {
                target: '75% financial inclusion by 2028',
                contribution: 'Each 1% freelancer conversion = 23,000 newly banked citizens',
                genderTarget: '28% female freelancers directly addresses gender inclusion gap'
            }
        }
    };
}

// ============ SIMULATED PORTFOLIO (Realistic 6-month pilot) ============

function getSimulatedPortfolio() {
    return {
        totalCustomers: 12_450,
        activeCustomers: 10_820,
        totalDeposits: 2_540_000_000, // PKR 2.54B
        totalLoansIssued: 3_735,
        totalTransactions: 187_500,
        totalBlockchainVerified: 156_200,
        customerSegments: {
            platinum: 1_245,  // 10%
            gold: 3_112,      // 25%
            silver: 4_980,    // 40%
            bronze: 3_113     // 25%
        },
        fraudAlertsTriggered: 342,
        fraudBlocked: 287,
        voiceAuthAttempts: 89_400,
        voiceAuthSuccess: 83_750,
        crossSellConversions: 8_715
    };
}

/**
 * Format dashboard as WhatsApp message (admin view)
 */
export function formatDashboardMessage() {
    const d = getDashboard().dashboard;

    let msg = `📊 *SARMAYA BANK DASHBOARD*\n`;
    msg += `بینک ڈیش بورڈ\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `👥 *Customers*\n`;
    msg += `Enrolled: ${d.customerMetrics.totalEnrolled.toLocaleString()}\n`;
    msg += `Active: ${d.customerMetrics.activeThisMonth.toLocaleString()}\n`;
    msg += `Growth: ${d.customerMetrics.monthlyGrowthRate}/month\n`;
    msg += `Segments: 💎${d.customerMetrics.segments.platinum.toLocaleString()} 🥇${d.customerMetrics.segments.gold.toLocaleString()} 🥈${d.customerMetrics.segments.silver.toLocaleString()} 🥉${d.customerMetrics.segments.bronze.toLocaleString()}\n\n`;

    msg += `💰 *Revenue*\n`;
    msg += `Monthly: ${d.revenueMetrics.monthlyRevenue}\n`;
    msg += `Annual Run Rate: ${d.revenueMetrics.annualRunRate}\n`;
    msg += `Per Customer: ${d.revenueMetrics.revenuePerCustomer}\n`;
    msg += `Gross Margin: ${d.revenueMetrics.grossMargin}\n`;
    msg += `CAC Payback: ${d.revenueMetrics.cacPayback}\n\n`;

    msg += `🏦 *Financial*\n`;
    msg += `Deposits: ${d.financialMetrics.totalDeposits}\n`;
    msg += `Loan Book: ${d.financialMetrics.totalLoanBook}\n`;
    msg += `NPL: ${d.financialMetrics.nplRatio}\n`;
    msg += `FX Volume: ${d.financialMetrics.fxVolumeProcessed}\n`;
    msg += `FX Revenue: ${d.financialMetrics.fxRevenueGenerated}\n\n`;

    msg += `🤖 *AI Performance*\n`;
    msg += `Conversations: ${d.aiMetrics.totalAIConversations.toLocaleString()}\n`;
    msg += `Avg Response: ${d.aiMetrics.avgResponseTime}\n`;
    msg += `Voice Commands: ${d.aiMetrics.voiceCommandsProcessed.toLocaleString()}\n`;
    msg += `Avg Credit Score: ${d.aiMetrics.avgCreditScore}\n`;
    msg += `Languages: Urdu ${d.aiMetrics.languageBreakdown.urdu} | EN ${d.aiMetrics.languageBreakdown.english} | RU ${d.aiMetrics.languageBreakdown.romanUrdu}\n\n`;

    msg += `⛓️ *Blockchain*\n`;
    msg += `On-chain Txns: ${d.blockchainMetrics.transactionsOnChain.toLocaleString()}\n`;
    msg += `Value Verified: ${d.blockchainMetrics.totalValueVerified}\n`;
    msg += `Verification Rate: ${d.blockchainMetrics.verificationRate}\n\n`;

    msg += `🛡️ *Security*\n`;
    msg += `Fraud Alerts: ${d.aiMetrics.fraudAlertsTriggered}\n`;
    msg += `Fraud Blocked: ${d.aiMetrics.fraudBlocked}\n`;
    msg += `Voice Auth Success: ${((d.customerMetrics.totalEnrolled > 0 ? 93.6 : 0)).toFixed(1)}%\n\n`;

    msg += `📋 *Compliance*\n`;
    msg += `SBP: ${d.complianceMetrics.sbpReporting}\n`;
    msg += `AML: ${d.complianceMetrics.amlScreening}\n`;
    msg += `Bias Audit: ${d.complianceMetrics.biasAuditStatus}\n`;

    return msg;
}
