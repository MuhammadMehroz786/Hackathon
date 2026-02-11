/**
 * Cross-sell AI Recommendation Engine
 * Analyzes freelancer profiles to recommend JS Bank products
 * This is how the bank generates revenue beyond basic banking
 */

// JS Bank product catalog
const PRODUCTS = {
    NANO_LOAN: {
        id: 'nano_loan',
        name: 'Zindigi Nano Loan',
        nameUrdu: 'زندگی نینو لون',
        type: 'lending',
        description: 'Instant micro-financing up to PKR 100,000 via Optasia AI',
        minCreditScore: 600,
        maxAmount: 100_000,
        interestRate: '0% for 30 days, then 3.5%/month',
        tenure: '1-6 months',
        bankRevenuePerCustomer: 8500, // PKR annual
        eligibilityCriteria: 'Credit score 600+, 3+ months income history'
    },
    FREELANCER_CREDIT_LINE: {
        id: 'credit_line',
        name: 'Freelancer Credit Line',
        nameUrdu: 'فری لانسر کریڈٹ لائن',
        type: 'lending',
        description: 'Revolving credit up to PKR 500,000 based on blockchain-verified income',
        minCreditScore: 700,
        maxAmount: 500_000,
        interestRate: '14-18% annually',
        tenure: 'Revolving',
        bankRevenuePerCustomer: 42000,
        eligibilityCriteria: 'Credit score 700+, 6+ months consistent income, blockchain verified'
    },
    VISA_DEBIT: {
        id: 'visa_debit',
        name: 'Zindigi Visa Debit Card',
        nameUrdu: 'زندگی ویزا ڈیبٹ کارڈ',
        type: 'card',
        description: 'Virtual + physical Visa debit card for international payments',
        minCreditScore: 0,
        annualFee: 0,
        bankRevenuePerCustomer: 1800, // interchange fees
        eligibilityCriteria: 'Any active account'
    },
    VISA_CREDIT: {
        id: 'visa_credit',
        name: 'JS Bank Visa Credit Card',
        nameUrdu: 'JS Bank ویزا کریڈٹ کارڈ',
        type: 'card',
        description: 'Credit card with limit based on freelance income',
        minCreditScore: 680,
        annualFee: 3000,
        creditLimit: 'Up to 2x monthly income',
        bankRevenuePerCustomer: 15000,
        eligibilityCriteria: 'Credit score 680+, avg income $500+/month'
    },
    TAKAFUL_INCOME: {
        id: 'takaful_income',
        name: 'Freelancer Income Takaful',
        nameUrdu: 'فری لانسر آمدنی تکافل',
        type: 'insurance',
        description: 'Shariah-compliant income protection — pays 60% of avg income if earnings drop',
        premiumRate: 0.02, // 2% of monthly income
        coverage: '60% income replacement for up to 6 months',
        bankRevenuePerCustomer: 4800, // commission
        eligibilityCriteria: '6+ months income history'
    },
    TAKAFUL_HEALTH: {
        id: 'takaful_health',
        name: 'Family Health Takaful',
        nameUrdu: 'فیملی ہیلتھ تکافل',
        type: 'insurance',
        description: 'Shariah-compliant health coverage for freelancer + family',
        annualPremium: 18000,
        coverage: 'PKR 500,000 hospitalization cover',
        bankRevenuePerCustomer: 3600,
        eligibilityCriteria: 'Any active account holder'
    },
    MUTUAL_FUND: {
        id: 'mutual_fund',
        name: 'JS Investments Growth Fund',
        nameUrdu: 'JS سرمایہ کاری گروتھ فنڈ',
        type: 'investment',
        description: 'Start investing from PKR 1,000 — diversified equity + fixed income',
        minInvestment: 1000,
        expectedReturn: '12-18% annually',
        bankRevenuePerCustomer: 2500, // management fee
        eligibilityCriteria: 'Savings rate > 20%'
    },
    NSS_SAVINGS: {
        id: 'nss_savings',
        name: 'National Savings via JS Bank',
        nameUrdu: 'نیشنل سیونگز',
        type: 'investment',
        description: 'Government-backed savings certificates — PKR guaranteed returns',
        minInvestment: 10000,
        expectedReturn: '13-15% annually (government rate)',
        bankRevenuePerCustomer: 1500,
        eligibilityCriteria: 'Balance > PKR 50,000'
    },
    ESFCA_PREMIUM: {
        id: 'esfca_premium',
        name: 'ESFCA Premium Account',
        nameUrdu: 'ESFCA پریمیم اکاؤنٹ',
        type: 'account_upgrade',
        description: 'Premium foreign currency account — better FX rates, priority service',
        monthlyFee: 500,
        benefit: 'Better FX rate (0.5% improvement), priority WhatsApp support',
        bankRevenuePerCustomer: 6000,
        eligibilityCriteria: 'Monthly earnings > $1,000'
    }
};

/**
 * Generate personalized product recommendations for a freelancer
 * @param {object} data - From banking.getTransactionDataForScoring()
 * @param {object} creditResult - From creditScore.calculateCreditScore()
 * @returns {object} - Ranked recommendations with bank revenue projections
 */
export function getRecommendations(data, creditResult) {
    const { profile, transactions, account, monthlyEarnings } = data;
    const score = creditResult.creditScore.score;
    const avgMonthlyUSD = monthlyEarnings.reduce((s, e) => s + e.amountUSD, 0) / Math.max(monthlyEarnings.length, 1);
    const avgMonthlyPKR = avgMonthlyUSD * 278.50;
    const savingsRate = calculateSavingsRate(transactions);

    const recommendations = [];
    let totalBankRevenue = 0;

    // Evaluate each product
    for (const [key, product] of Object.entries(PRODUCTS)) {
        const eligible = evaluateEligibility(product, score, avgMonthlyUSD, avgMonthlyPKR, savingsRate, monthlyEarnings.length, account.balance);

        if (eligible.isEligible) {
            const priority = calculatePriority(product, score, avgMonthlyUSD, eligible.matchScore);
            totalBankRevenue += product.bankRevenuePerCustomer;

            recommendations.push({
                product: {
                    id: product.id,
                    name: product.name,
                    nameUrdu: product.nameUrdu,
                    type: product.type,
                    description: product.description
                },
                eligibility: eligible,
                priority: priority,
                bankRevenue: {
                    annual: product.bankRevenuePerCustomer,
                    formatted: `PKR ${product.bankRevenuePerCustomer.toLocaleString()}`
                },
                personalizedPitch: generatePitch(product, profile, avgMonthlyUSD, score)
            });
        }
    }

    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    return {
        success: true,
        freelancerName: profile.name,
        creditScore: score,
        avgMonthlyIncome: `$${avgMonthlyUSD.toFixed(0)}`,
        recommendations: recommendations,
        bankImpact: {
            totalProductsEligible: recommendations.length,
            projectedAnnualRevenue: `PKR ${totalBankRevenue.toLocaleString()}`,
            projectedRevenuePerMonth: `PKR ${Math.round(totalBankRevenue / 12).toLocaleString()}`,
            customerTier: score >= 750 ? 'Platinum' : score >= 650 ? 'Gold' : score >= 550 ? 'Silver' : 'Bronze',
            crossSellPotential: recommendations.length >= 5 ? 'HIGH' : recommendations.length >= 3 ? 'MEDIUM' : 'LOW'
        }
    };
}

/**
 * Get the top recommendation for WhatsApp display
 */
export function getTopRecommendation(data, creditResult) {
    const all = getRecommendations(data, creditResult);
    if (all.recommendations.length === 0) return null;
    return all.recommendations[0];
}

/**
 * Calculate total bank revenue from a specific customer segment
 */
export function calculateSegmentRevenue(customerCount, avgCreditScore) {
    // Simulate product penetration based on credit score
    let revenuePerCustomer = 0;

    if (avgCreditScore >= 750) {
        revenuePerCustomer = 65000; // High-value customers
    } else if (avgCreditScore >= 650) {
        revenuePerCustomer = 38000; // Good customers
    } else if (avgCreditScore >= 550) {
        revenuePerCustomer = 18000; // Fair customers
    } else {
        revenuePerCustomer = 5000; // Basic (debit card + bills only)
    }

    return {
        success: true,
        segment: {
            customers: customerCount,
            avgCreditScore: avgCreditScore,
            tier: avgCreditScore >= 750 ? 'Platinum' : avgCreditScore >= 650 ? 'Gold' : avgCreditScore >= 550 ? 'Silver' : 'Bronze',
            revenuePerCustomer: `PKR ${revenuePerCustomer.toLocaleString()}`,
            totalAnnualRevenue: `PKR ${(customerCount * revenuePerCustomer).toLocaleString()}`,
            totalAnnualRevenueFormatted: formatLargeNumber(customerCount * revenuePerCustomer)
        }
    };
}

// ============ HELPERS ============

function evaluateEligibility(product, creditScore, avgMonthlyUSD, avgMonthlyPKR, savingsRate, monthsOfData, balance) {
    let matchScore = 50; // base score
    let reasons = [];

    if (product.minCreditScore && creditScore < product.minCreditScore) {
        return { isEligible: false, matchScore: 0, reason: `Credit score ${creditScore} below minimum ${product.minCreditScore}` };
    }

    // Credit score bonus
    if (creditScore >= 750) matchScore += 25;
    else if (creditScore >= 650) matchScore += 15;

    // Income level bonus
    if (product.type === 'lending' && avgMonthlyUSD >= 1000) matchScore += 20;
    if (product.type === 'investment' && savingsRate > 0.3) matchScore += 20;
    if (product.type === 'insurance' && monthsOfData >= 6) matchScore += 15;
    if (product.id === 'esfca_premium' && avgMonthlyUSD >= 1000) matchScore += 25;
    if (product.id === 'visa_credit' && avgMonthlyUSD >= 500) matchScore += 15;

    return { isEligible: true, matchScore: Math.min(matchScore, 100), reasons };
}

function calculatePriority(product, creditScore, avgMonthlyUSD, matchScore) {
    // Priority = match score * revenue weight
    const revenueWeight = Math.log10(product.bankRevenuePerCustomer + 1) / 5;
    return Math.round(matchScore * (0.6 + revenueWeight * 0.4));
}

function generatePitch(product, profile, avgMonthlyUSD, creditScore) {
    const name = profile.name.split(' ')[0]; // First name

    const pitches = {
        nano_loan: {
            en: `${name}, with your credit score of ${creditScore}, you qualify for instant financing up to PKR 100,000. First 30 days interest-free!`,
            ur: `${name}، آپ کے ${creditScore} کریڈٹ سکور کے ساتھ، آپ PKR 100,000 تک فوری فنانسنگ کے اہل ہیں۔ پہلے 30 دن بغیر سود!`
        },
        credit_line: {
            en: `${name}, your consistent income of $${avgMonthlyUSD.toFixed(0)}/month qualifies you for a PKR 500,000 credit line — verified by blockchain.`,
            ur: `${name}، آپ کی $${avgMonthlyUSD.toFixed(0)}/ماہ مستقل آمدنی آپ کو PKR 500,000 کریڈٹ لائن کا اہل بناتی ہے۔`
        },
        visa_debit: {
            en: `Get a Zindigi Visa debit card for international payments — works anywhere Visa is accepted.`,
            ur: `بین الاقوامی ادائیگیوں کے لیے زندگی ویزا ڈیبٹ کارڈ حاصل کریں۔`
        },
        visa_credit: {
            en: `${name}, you qualify for a credit card with a limit up to PKR ${Math.round(avgMonthlyUSD * 278.50 * 2).toLocaleString()}.`,
            ur: `${name}، آپ PKR ${Math.round(avgMonthlyUSD * 278.50 * 2).toLocaleString()} تک کی حد کے ساتھ کریڈٹ کارڈ کے اہل ہیں۔`
        },
        takaful_income: {
            en: `Protect your freelance income — if earnings drop, get 60% of your average income for up to 6 months. Shariah-compliant.`,
            ur: `اپنی فری لانس آمدنی کی حفاظت کریں — اگر کمائی کم ہو تو 6 ماہ تک اوسط آمدنی کا 60% حاصل کریں۔ شریعت کے مطابق۔`
        },
        takaful_health: {
            en: `Health coverage for you and your family — PKR 500,000 hospitalization cover for just PKR 1,500/month.`,
            ur: `آپ اور آپ کے خاندان کے لیے صحت کی کوریج — صرف PKR 1,500/ماہ میں۔`
        },
        mutual_fund: {
            en: `${name}, your savings rate is strong. Start investing from PKR 1,000 in diversified funds — expected 12-18% returns.`,
            ur: `${name}، آپ کی بچت کی شرح اچھی ہے۔ PKR 1,000 سے سرمایہ کاری شروع کریں — 12-18% متوقع منافع۔`
        },
        nss_savings: {
            en: `Government-backed savings certificates — guaranteed 13-15% returns, zero risk. Start with PKR 10,000.`,
            ur: `حکومت کی ضمانت شدہ بچت — 13-15% یقینی منافع، صفر خطرہ۔ PKR 10,000 سے شروع کریں۔`
        },
        esfca_premium: {
            en: `${name}, with $${avgMonthlyUSD.toFixed(0)}/month in earnings, upgrade to ESFCA Premium for better FX rates and priority service.`,
            ur: `${name}، $${avgMonthlyUSD.toFixed(0)}/ماہ کمائی کے ساتھ، بہتر FX شرح کے لیے ESFCA پریمیم میں اپ گریڈ کریں۔`
        }
    };

    return pitches[product.id] || { en: product.description, ur: product.nameUrdu };
}

function calculateSavingsRate(transactions) {
    const credits = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const debits = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
    if (credits === 0) return 0;
    return (credits - debits) / credits;
}

function formatLargeNumber(amount) {
    if (amount >= 1e12) return `PKR ${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `PKR ${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `PKR ${(amount / 1e6).toFixed(1)} Million`;
    return `PKR ${amount.toLocaleString()}`;
}
