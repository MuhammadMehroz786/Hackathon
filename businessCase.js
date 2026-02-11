/**
 * Business Case & Revenue Engine for JS Bank
 * Shows bank-side ROI, revenue projections, and market opportunity
 * This is what wins the hackathon — hard numbers for the bank
 */

// ============ MARKET DATA (Pakistan Freelancer Economy) ============

const MARKET = {
    totalFreelancers: 2_320_000,
    freelancersWithBankAccounts: 38_000,
    bankingExclusionRate: 0.968, // 96.8%
    whatsappUsersInPakistan: 52_000_000,
    avgMonthlyEarningUSD: 735,
    itExportsFY24: 400_000_000, // $400M formal, ~$2B actual
    itExportsTarget2030: 15_000_000_000, // $15B government target
    avgPlatformRating: 4.6,
    femaleFreelancerShare: 0.28, // 28% from DigiSkills data
    population: 241_000_000,
    financialInclusionRate: 0.64, // 64% as of 2023
    sbpTargetInclusion2028: 0.75 // 75% target
};

// ============ BANK REVENUE ASSUMPTIONS ============

const REVENUE_MODEL = {
    // FX Revenue
    fxSpreadPercent: 0.02, // 2% spread on USD→PKR conversion
    esfcaMandatoryConversion: 0.50, // 50% must be converted

    // Lending
    avgLoanSizePKR: 150_000,
    loanInterestRate: 0.16, // 16% avg (12-20% based on score)
    loanApprovalRate: 0.30, // 30% of scored freelancers qualify
    expectedNPLRate: 0.03, // 3% default rate with alt credit scoring
    traditionalNPLRate: 0.08, // 8% industry average without alt data

    // Deposits
    avgDepositRetentionDays: 15, // avg days money sits in account
    bankLendingSpread: 0.04, // 4% spread bank earns on deposits

    // Cross-sell
    creditCardAnnualFee: 3000, // PKR
    creditCardPenetration: 0.15, // 15% of active customers
    takafulCommissionRate: 0.20, // 20% first-year commission
    takafulAvgPremiumPKR: 12000, // annual
    takafulPenetration: 0.08, // 8% uptake
    investmentCommissionRate: 0.015, // 1.5% on AUM
    investmentAvgPKR: 100_000, // avg investment amount
    investmentPenetration: 0.05, // 5% uptake

    // Transaction Fees
    billPaymentFee: 10, // PKR per bill payment
    avgBillPaymentsPerMonth: 3,

    // Cost
    whatsappCAC: 50, // PKR per customer acquired via WhatsApp
    branchCAC: 3000, // PKR per customer via traditional branch
    monthlyOperatingCostPerUser: 15, // PKR (server, API costs)

    // Conversion
    usdToPkr: 278.50
};

// ============ CORE FUNCTIONS ============

/**
 * Generate complete business case for JS Bank
 * @param {object} options - Projection parameters
 * @returns {object} - Complete business case with revenue, costs, ROI
 */
export function generateBusinessCase(options = {}) {
    const year1Penetration = options.penetrationRate || 0.05; // 5% of TAM
    const year2Penetration = options.year2Rate || 0.12;
    const year3Penetration = options.year3Rate || 0.22;

    const projections = [
        calculateYearProjection(1, year1Penetration),
        calculateYearProjection(2, year2Penetration),
        calculateYearProjection(3, year3Penetration)
    ];

    const year1 = projections[0];

    return {
        success: true,
        marketOpportunity: {
            totalAddressableMarket: MARKET.totalFreelancers,
            currentlyBanked: MARKET.freelancersWithBankAccounts,
            exclusionRate: `${(MARKET.bankingExclusionRate * 100).toFixed(1)}%`,
            gapSize: MARKET.totalFreelancers - MARKET.freelancersWithBankAccounts,
            annualFreelanceEarnings: `$${(MARKET.totalFreelancers * MARKET.avgMonthlyEarningUSD * 12 / 1e9).toFixed(1)}B USD`,
            annualEarningsPKR: `PKR ${(MARKET.totalFreelancers * MARKET.avgMonthlyEarningUSD * 12 * REVENUE_MODEL.usdToPkr / 1e12).toFixed(1)}T`,
            governmentTarget: '$15B IT exports by 2030',
            whatsappReach: `${(MARKET.whatsappUsersInPakistan / 1e6).toFixed(0)}M users`
        },
        threeYearProjections: projections,
        year1Summary: {
            newCustomers: year1.customers.toLocaleString(),
            totalDeposits: formatPKR(year1.revenue.totalDeposits),
            totalRevenue: formatPKR(year1.revenue.total),
            totalCost: formatPKR(year1.costs.total),
            netProfit: formatPKR(year1.revenue.total - year1.costs.total),
            roi: `${(((year1.revenue.total - year1.costs.total) / year1.costs.total) * 100).toFixed(0)}%`,
            cacPayback: `${(year1.costs.acquisition / year1.revenue.perCustomer).toFixed(1)} months`
        },
        competitiveAdvantage: {
            cacReduction: `${((1 - REVENUE_MODEL.whatsappCAC / REVENUE_MODEL.branchCAC) * 100).toFixed(0)}% lower CAC (PKR ${REVENUE_MODEL.whatsappCAC} vs PKR ${REVENUE_MODEL.branchCAC})`,
            nplReduction: `${((1 - REVENUE_MODEL.expectedNPLRate / REVENUE_MODEL.traditionalNPLRate) * 100).toFixed(0)}% lower default rate with alt credit scoring`,
            channelAdvantage: 'WhatsApp = 52M users, zero app download friction',
            inclusionImpact: `Brings ${(year1Penetration * MARKET.totalFreelancers / 1000).toFixed(0)}K unbanked into formal banking`,
            regulatoryAlignment: 'Supports SBP NFIS 2024-28 target of 75% financial inclusion'
        },
        revenueBreakdown: {
            fxRevenue: { amount: formatPKR(year1.revenue.fx), share: pct(year1.revenue.fx, year1.revenue.total), description: '2% spread on USD→PKR conversion (50% mandatory ESFCA conversion)' },
            lendingRevenue: { amount: formatPKR(year1.revenue.lending), share: pct(year1.revenue.lending, year1.revenue.total), description: 'Nano loans at 12-20% to credit-scored freelancers' },
            depositRevenue: { amount: formatPKR(year1.revenue.deposits), share: pct(year1.revenue.deposits, year1.revenue.total), description: '4% spread on deposit utilization' },
            crossSellRevenue: { amount: formatPKR(year1.revenue.crossSell), share: pct(year1.revenue.crossSell, year1.revenue.total), description: 'Credit cards, Takaful, investments' },
            transactionFees: { amount: formatPKR(year1.revenue.transactionFees), share: pct(year1.revenue.transactionFees, year1.revenue.total), description: 'Bill payments, transfers' }
        },
        sbpAlignment: {
            nfisTarget: 'NFIS 2024-28: 75% financial inclusion by 2028',
            digitalBanking: 'Meets all SBP Digital Banking Framework requirements',
            financialLiteracy: 'AI-powered financial education in Urdu',
            genderInclusion: `28% female freelancers = ${Math.round(year1.customers * 0.28).toLocaleString()} women banked`,
            bankingOnEquality: 'Aligned with SBP Banking on Equality policy'
        }
    };
}

/**
 * Calculate per-customer revenue for the bank
 */
export function calculatePerCustomerRevenue() {
    const monthly = MARKET.avgMonthlyEarningUSD;
    const pkrMonthly = monthly * REVENUE_MODEL.usdToPkr;

    // FX Revenue: 2% of 50% mandatory conversion
    const fxMonthly = monthly * REVENUE_MODEL.esfcaMandatoryConversion * REVENUE_MODEL.fxSpreadPercent * REVENUE_MODEL.usdToPkr;

    // Deposit Revenue: money sitting in account
    const depositRevMonthly = pkrMonthly * (REVENUE_MODEL.avgDepositRetentionDays / 365) * REVENUE_MODEL.bankLendingSpread;

    // Transaction Fees
    const txnFeesMonthly = REVENUE_MODEL.billPaymentFee * REVENUE_MODEL.avgBillPaymentsPerMonth;

    // Lending (amortized per customer, weighted by approval rate)
    const lendingPerCustomerMonthly = REVENUE_MODEL.avgLoanSizePKR * REVENUE_MODEL.loanInterestRate * REVENUE_MODEL.loanApprovalRate / 12;

    // Cross-sell (amortized per customer, weighted by penetration)
    const creditCardMonthly = (REVENUE_MODEL.creditCardAnnualFee * REVENUE_MODEL.creditCardPenetration) / 12;
    const takafulMonthly = (REVENUE_MODEL.takafulAvgPremiumPKR * REVENUE_MODEL.takafulCommissionRate * REVENUE_MODEL.takafulPenetration) / 12;
    const investmentMonthly = (REVENUE_MODEL.investmentAvgPKR * REVENUE_MODEL.investmentCommissionRate * REVENUE_MODEL.investmentPenetration) / 12;

    const totalMonthly = fxMonthly + depositRevMonthly + txnFeesMonthly + lendingPerCustomerMonthly + creditCardMonthly + takafulMonthly + investmentMonthly;
    const totalAnnual = totalMonthly * 12;

    return {
        success: true,
        perCustomer: {
            monthly: {
                fx: Math.round(fxMonthly),
                deposits: Math.round(depositRevMonthly),
                transactionFees: Math.round(txnFeesMonthly),
                lending: Math.round(lendingPerCustomerMonthly),
                creditCard: Math.round(creditCardMonthly),
                takaful: Math.round(takafulMonthly),
                investment: Math.round(investmentMonthly),
                total: Math.round(totalMonthly)
            },
            annual: {
                total: Math.round(totalAnnual),
                formatted: formatPKR(totalAnnual)
            }
        },
        lifetimeValue: {
            threeYear: formatPKR(totalAnnual * 3),
            fiveYear: formatPKR(totalAnnual * 5)
        },
        cac: REVENUE_MODEL.whatsappCAC,
        ltvToCacRatio: `${(totalAnnual * 3 / REVENUE_MODEL.whatsappCAC).toFixed(0)}:1`,
        paybackPeriod: `${(REVENUE_MODEL.whatsappCAC / totalMonthly).toFixed(1)} months`
    };
}

/**
 * Generate risk assessment for the bank
 */
export function generateRiskAssessment() {
    return {
        success: true,
        creditRisk: {
            nplWithAltScoring: `${(REVENUE_MODEL.expectedNPLRate * 100).toFixed(1)}%`,
            nplWithoutAltScoring: `${(REVENUE_MODEL.traditionalNPLRate * 100).toFixed(1)}%`,
            nplReduction: `${((1 - REVENUE_MODEL.expectedNPLRate / REVENUE_MODEL.traditionalNPLRate) * 100).toFixed(0)}%`,
            mitigationFactors: [
                'Blockchain-verified income records (immutable proof)',
                'Platform ratings from Upwork/Fiverr (third-party validation)',
                'Voice biometric authentication (identity security)',
                'Real-time transaction monitoring (fraud prevention)',
                'AI-powered spending behavior analysis'
            ]
        },
        operationalRisk: {
            level: 'LOW',
            factors: [
                'Runs on WhatsApp (99.9% uptime, Meta infrastructure)',
                'Voice biometric prevents account takeover',
                'Blockchain audit trail for all transactions',
                'Automated KYC reduces manual processing errors',
                'Session timeout and auto-logout security'
            ]
        },
        regulatoryRisk: {
            level: 'LOW',
            factors: [
                'Multiple Pakistani banks already operate WhatsApp banking (HBL, Allied, JS BOT)',
                'SBP actively promotes digital banking and financial inclusion',
                'Pakistan Crypto Council (2025) supports blockchain for financial services',
                'Responsible AI layer ensures compliance with emerging data protection laws',
                'All transactions follow SBP purpose codes'
            ]
        },
        reputationalRisk: {
            level: 'LOW-MEDIUM',
            factors: [
                'Responsible AI transparency mitigates algorithmic bias concerns',
                'Shariah-compliant mode addresses religious sensitivity',
                'Consent management gives users control over data',
                'Gender-neutral credit scoring prevents discrimination claims'
            ]
        }
    };
}

/**
 * Compare Sarmaya vs traditional banking approach
 */
export function generateCompetitiveAnalysis() {
    return {
        success: true,
        comparison: [
            {
                metric: 'Customer Acquisition Cost',
                sarmaya: `PKR ${REVENUE_MODEL.whatsappCAC}`,
                traditional: `PKR ${REVENUE_MODEL.branchCAC}`,
                advantage: `${((1 - REVENUE_MODEL.whatsappCAC / REVENUE_MODEL.branchCAC) * 100).toFixed(0)}% cheaper`,
                winner: 'Sarmaya'
            },
            {
                metric: 'Time to Onboard',
                sarmaya: '3 minutes (voice enrollment)',
                traditional: '2-3 days (branch visit + paperwork)',
                advantage: '99% faster',
                winner: 'Sarmaya'
            },
            {
                metric: 'Loan Application Processing',
                sarmaya: 'Instant (AI credit scoring)',
                traditional: '5-7 business days',
                advantage: 'Real-time vs days',
                winner: 'Sarmaya'
            },
            {
                metric: 'Income Verification',
                sarmaya: 'Blockchain-verified (immutable)',
                traditional: 'Salary slip (forgeable)',
                advantage: 'Unforgeable',
                winner: 'Sarmaya'
            },
            {
                metric: 'Channel Reach',
                sarmaya: '52M WhatsApp users',
                traditional: '~16K bank branches',
                advantage: '3,250x more reach',
                winner: 'Sarmaya'
            },
            {
                metric: 'Language Support',
                sarmaya: 'Urdu voice + English + Roman Urdu',
                traditional: 'English forms only',
                advantage: 'Native language banking',
                winner: 'Sarmaya'
            },
            {
                metric: 'Default Rate (NPL)',
                sarmaya: `${(REVENUE_MODEL.expectedNPLRate * 100)}%`,
                traditional: `${(REVENUE_MODEL.traditionalNPLRate * 100)}%`,
                advantage: `${((1 - REVENUE_MODEL.expectedNPLRate / REVENUE_MODEL.traditionalNPLRate) * 100).toFixed(0)}% lower`,
                winner: 'Sarmaya'
            },
            {
                metric: 'Operating Cost per User',
                sarmaya: `PKR ${REVENUE_MODEL.monthlyOperatingCostPerUser}/month`,
                traditional: 'PKR 200-500/month',
                advantage: '90%+ lower',
                winner: 'Sarmaya'
            }
        ]
    };
}

// ============ INTERNAL CALCULATION FUNCTIONS ============

function calculateYearProjection(year, penetrationRate) {
    const customers = Math.round(MARKET.totalFreelancers * penetrationRate);
    const monthlyEarningPKR = MARKET.avgMonthlyEarningUSD * REVENUE_MODEL.usdToPkr;

    // Revenue streams
    const fxRevenue = customers * MARKET.avgMonthlyEarningUSD * REVENUE_MODEL.esfcaMandatoryConversion * REVENUE_MODEL.fxSpreadPercent * REVENUE_MODEL.usdToPkr * 12;

    const totalDeposits = customers * monthlyEarningPKR;
    const depositRevenue = totalDeposits * (REVENUE_MODEL.avgDepositRetentionDays / 365) * REVENUE_MODEL.bankLendingSpread * 12;

    const loanCustomers = Math.round(customers * REVENUE_MODEL.loanApprovalRate);
    const lendingRevenue = loanCustomers * REVENUE_MODEL.avgLoanSizePKR * REVENUE_MODEL.loanInterestRate;

    const creditCardRevenue = customers * REVENUE_MODEL.creditCardPenetration * REVENUE_MODEL.creditCardAnnualFee;
    const takafulRevenue = customers * REVENUE_MODEL.takafulPenetration * REVENUE_MODEL.takafulAvgPremiumPKR * REVENUE_MODEL.takafulCommissionRate;
    const investmentRevenue = customers * REVENUE_MODEL.investmentPenetration * REVENUE_MODEL.investmentAvgPKR * REVENUE_MODEL.investmentCommissionRate;
    const crossSellRevenue = creditCardRevenue + takafulRevenue + investmentRevenue;

    const transactionFees = customers * REVENUE_MODEL.billPaymentFee * REVENUE_MODEL.avgBillPaymentsPerMonth * 12;

    const totalRevenue = fxRevenue + depositRevenue + lendingRevenue + crossSellRevenue + transactionFees;

    // Costs
    const acquisitionCost = customers * REVENUE_MODEL.whatsappCAC;
    const operatingCost = customers * REVENUE_MODEL.monthlyOperatingCostPerUser * 12;
    const totalCost = acquisitionCost + operatingCost;

    return {
        year: year,
        penetrationRate: `${(penetrationRate * 100).toFixed(1)}%`,
        customers: customers,
        revenue: {
            fx: Math.round(fxRevenue),
            deposits: Math.round(depositRevenue),
            lending: Math.round(lendingRevenue),
            crossSell: Math.round(crossSellRevenue),
            transactionFees: Math.round(transactionFees),
            total: Math.round(totalRevenue),
            totalDeposits: Math.round(totalDeposits),
            perCustomer: Math.round(totalRevenue / customers)
        },
        costs: {
            acquisition: Math.round(acquisitionCost),
            operating: Math.round(operatingCost),
            total: Math.round(totalCost)
        },
        profit: Math.round(totalRevenue - totalCost),
        roi: `${(((totalRevenue - totalCost) / totalCost) * 100).toFixed(0)}%`
    };
}

// ============ FORMATTERS ============

function formatPKR(amount) {
    if (amount >= 1e12) return `PKR ${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `PKR ${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `PKR ${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `PKR ${(amount / 1e3).toFixed(1)}K`;
    return `PKR ${Math.round(amount).toLocaleString()}`;
}

function pct(part, total) {
    return `${((part / total) * 100).toFixed(1)}%`;
}
