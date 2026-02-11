/**
 * Alternative Credit Scoring System for Pakistani Freelancers
 * Scores creditworthiness using freelance earnings data instead of traditional credit history
 * Designed for the 96.8% of freelancers excluded from formal banking
 */

// Score ranges (similar to international credit scoring)
const SCORE_RANGES = {
    EXCELLENT: { min: 750, max: 850, label: 'Excellent', labelUrdu: 'بہترین', emoji: '🌟' },
    GOOD: { min: 650, max: 749, label: 'Good', labelUrdu: 'اچھا', emoji: '✅' },
    FAIR: { min: 550, max: 649, label: 'Fair', labelUrdu: 'ٹھیک', emoji: '⚠️' },
    POOR: { min: 400, max: 549, label: 'Poor', labelUrdu: 'کمزور', emoji: '❌' },
    INSUFFICIENT: { min: 0, max: 399, label: 'Insufficient Data', labelUrdu: 'ناکافی ڈیٹا', emoji: '❓' }
};

// Scoring weights
const WEIGHTS = {
    incomeConsistency: 0.25,    // 25% - How consistent is monthly income
    incomeLevel: 0.20,          // 20% - Average monthly income level
    platformDiversity: 0.10,    // 10% - Number of active platforms
    platformRating: 0.15,       // 15% - Average platform rating
    accountAge: 0.10,           // 10% - How long on freelance platforms
    transactionFrequency: 0.10, // 10% - Regular transaction activity
    spendingBehavior: 0.10      // 10% - Responsible spending patterns
};

/**
 * Calculate alternative credit score
 * @param {object} data - From banking.getTransactionDataForScoring()
 * @returns {object} - Complete credit score report with explanations
 */
export function calculateCreditScore(data) {
    const { profile, transactions, account, monthlyEarnings, platforms } = data;

    // Calculate individual component scores (0-100 each)
    const components = {
        incomeConsistency: scoreIncomeConsistency(monthlyEarnings),
        incomeLevel: scoreIncomeLevel(monthlyEarnings),
        platformDiversity: scorePlatformDiversity(platforms),
        platformRating: scorePlatformRating(platforms),
        accountAge: scoreAccountAge(profile.registeredSince),
        transactionFrequency: scoreTransactionFrequency(transactions),
        spendingBehavior: scoreSpendingBehavior(transactions, monthlyEarnings)
    };

    // Calculate weighted total (0-100)
    let weightedTotal = 0;
    for (const [key, score] of Object.entries(components)) {
        weightedTotal += score.score * WEIGHTS[key];
    }

    // Map 0-100 to 300-850 credit score range
    const creditScore = Math.round(300 + (weightedTotal / 100) * 550);
    const range = getScoreRange(creditScore);

    // Calculate loan eligibility
    const loanEligibility = calculateLoanEligibility(creditScore, monthlyEarnings);

    return {
        success: true,
        creditScore: {
            score: creditScore,
            range: range.label,
            rangeUrdu: range.labelUrdu,
            emoji: range.emoji,
            maxScore: 850,
            generatedAt: new Date().toISOString()
        },
        components: Object.entries(components).map(([key, data]) => ({
            factor: formatFactorName(key),
            score: data.score,
            maxScore: 100,
            weight: `${WEIGHTS[key] * 100}%`,
            explanation: data.explanation,
            explanationUrdu: data.explanationUrdu
        })),
        loanEligibility: loanEligibility,
        recommendations: generateRecommendations(components, creditScore),
        dataUsed: {
            monthsOfData: monthlyEarnings.length,
            platformsAnalyzed: platforms.length,
            transactionsAnalyzed: transactions.length,
            disclaimer: 'Score based on alternative data - freelance earnings, platform ratings, and transaction patterns'
        },
        // Responsible AI: Full transparency
        responsibleAI: {
            methodology: 'Rule-based scoring using 7 weighted factors from freelance platform data',
            weights: WEIGHTS,
            biasCheck: {
                genderNeutral: true,
                locationNeutral: true,
                note: 'Score is based solely on financial behavior and platform performance, not demographic data'
            },
            limitations: [
                'Based on mock data for demonstration',
                'Real implementation would require platform API integration',
                'Score should be one of multiple factors in lending decisions'
            ]
        }
    };
}

// ============ SCORING COMPONENTS ============

function scoreIncomeConsistency(earnings) {
    if (earnings.length < 2) {
        return {
            score: 20,
            explanation: 'Insufficient earning history (need 2+ months)',
            explanationUrdu: 'کمائی کی تاریخ ناکافی ہے (2+ مہینے درکار)'
        };
    }

    const amounts = earnings.map(e => e.amountUSD);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const cv = Math.sqrt(variance) / avg; // coefficient of variation

    let score;
    if (cv < 0.15) score = 95;
    else if (cv < 0.25) score = 80;
    else if (cv < 0.40) score = 65;
    else if (cv < 0.60) score = 45;
    else score = 25;

    const consistency = cv < 0.25 ? 'highly consistent' : cv < 0.5 ? 'moderately consistent' : 'variable';

    return {
        score,
        explanation: `Income is ${consistency} over ${earnings.length} months (CV: ${(cv * 100).toFixed(1)}%)`,
        explanationUrdu: `${earnings.length} مہینوں میں آمدنی ${consistency === 'highly consistent' ? 'بہت مستحکم' : consistency === 'moderately consistent' ? 'معتدل طور پر مستحکم' : 'غیر مستحکم'} ہے`
    };
}

function scoreIncomeLevel(earnings) {
    if (earnings.length === 0) {
        return { score: 0, explanation: 'No earnings data', explanationUrdu: 'کمائی کا ڈیٹا نہیں' };
    }

    const avgMonthly = earnings.reduce((sum, e) => sum + e.amountUSD, 0) / earnings.length;

    let score;
    if (avgMonthly >= 2000) score = 95;
    else if (avgMonthly >= 1000) score = 80;
    else if (avgMonthly >= 500) score = 65;
    else if (avgMonthly >= 200) score = 45;
    else score = 25;

    return {
        score,
        explanation: `Average monthly income: $${avgMonthly.toFixed(0)} USD`,
        explanationUrdu: `اوسط ماہانہ آمدنی: $${avgMonthly.toFixed(0)} امریکی ڈالر`
    };
}

function scorePlatformDiversity(platforms) {
    const activePlatforms = platforms.filter(p => p.activeMonths > 0).length;

    let score;
    if (activePlatforms >= 3) score = 95;
    else if (activePlatforms === 2) score = 75;
    else if (activePlatforms === 1) score = 50;
    else score = 15;

    return {
        score,
        explanation: `Active on ${activePlatforms} freelance platform(s)`,
        explanationUrdu: `${activePlatforms} فری لانس پلیٹ فارم پر فعال`
    };
}

function scorePlatformRating(platforms) {
    if (platforms.length === 0) {
        return { score: 0, explanation: 'No platform data', explanationUrdu: 'پلیٹ فارم ڈیٹا نہیں' };
    }

    const avgRating = platforms.reduce((sum, p) => sum + p.rating, 0) / platforms.length;

    let score;
    if (avgRating >= 4.8) score = 95;
    else if (avgRating >= 4.5) score = 80;
    else if (avgRating >= 4.0) score = 65;
    else if (avgRating >= 3.5) score = 45;
    else score = 25;

    return {
        score,
        explanation: `Average platform rating: ${avgRating.toFixed(1)}/5.0`,
        explanationUrdu: `اوسط پلیٹ فارم ریٹنگ: ${avgRating.toFixed(1)}/5.0`
    };
}

function scoreAccountAge(registeredSince) {
    const months = Math.floor((Date.now() - new Date(registeredSince).getTime()) / (30 * 24 * 60 * 60 * 1000));

    let score;
    if (months >= 24) score = 95;
    else if (months >= 12) score = 75;
    else if (months >= 6) score = 55;
    else if (months >= 3) score = 35;
    else score = 15;

    return {
        score,
        explanation: `Freelancing for ${months} months`,
        explanationUrdu: `${months} مہینوں سے فری لانسنگ کر رہے ہیں`
    };
}

function scoreTransactionFrequency(transactions) {
    const last30Days = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return (Date.now() - txDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
    });

    let score;
    if (last30Days.length >= 10) score = 90;
    else if (last30Days.length >= 5) score = 70;
    else if (last30Days.length >= 2) score = 50;
    else score = 20;

    return {
        score,
        explanation: `${last30Days.length} transactions in last 30 days`,
        explanationUrdu: `پچھلے 30 دنوں میں ${last30Days.length} لین دین`
    };
}

function scoreSpendingBehavior(transactions, earnings) {
    const debits = transactions.filter(t => t.type === 'DEBIT');
    const credits = transactions.filter(t => t.type === 'CREDIT');

    const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = credits.reduce((sum, t) => sum + t.amount, 0);

    if (totalEarned === 0) {
        return { score: 50, explanation: 'No income data for comparison', explanationUrdu: 'موازنے کے لیے آمدنی کا ڈیٹا نہیں' };
    }

    const spendingRatio = totalSpent / totalEarned;

    let score;
    if (spendingRatio < 0.3) score = 90; // Saves 70%+
    else if (spendingRatio < 0.5) score = 80; // Saves 50%+
    else if (spendingRatio < 0.7) score = 65; // Saves 30%+
    else if (spendingRatio < 0.9) score = 45;
    else score = 25;

    const savingsRate = ((1 - spendingRatio) * 100).toFixed(0);

    return {
        score,
        explanation: `Savings rate: ${savingsRate}% of income`,
        explanationUrdu: `بچت کی شرح: آمدنی کا ${savingsRate}%`
    };
}

// ============ HELPERS ============

function getScoreRange(score) {
    for (const range of Object.values(SCORE_RANGES)) {
        if (score >= range.min && score <= range.max) return range;
    }
    return SCORE_RANGES.INSUFFICIENT;
}

function calculateLoanEligibility(creditScore, earnings) {
    const avgMonthly = earnings.reduce((sum, e) => sum + e.amountPKR, 0) / Math.max(earnings.length, 1);

    let maxLoanMultiplier;
    if (creditScore >= 750) maxLoanMultiplier = 12;
    else if (creditScore >= 650) maxLoanMultiplier = 8;
    else if (creditScore >= 550) maxLoanMultiplier = 4;
    else maxLoanMultiplier = 0;

    const maxLoanAmount = Math.round(avgMonthly * maxLoanMultiplier);
    const eligible = creditScore >= 550;

    return {
        eligible: eligible,
        eligibleUrdu: eligible ? 'ہاں - آپ قرض کے اہل ہیں' : 'ابھی نہیں - اپنا سکور بہتر کریں',
        maxLoanAmount: maxLoanAmount,
        maxLoanAmountFormatted: `PKR ${maxLoanAmount.toLocaleString()}`,
        monthlyEMI: eligible ? Math.round(maxLoanAmount / 12) : 0,
        interestRate: creditScore >= 750 ? '12%' : creditScore >= 650 ? '16%' : '20%',
        tenure: '12 months',
        type: creditScore >= 750 ? 'Nano Loan (Instant)' : creditScore >= 650 ? 'Micro Loan' : 'Basic Credit Line'
    };
}

function generateRecommendations(components, score) {
    const recs = [];

    if (components.incomeConsistency.score < 60) {
        recs.push({
            tip: 'Maintain more consistent monthly earnings to improve your score',
            tipUrdu: 'اپنا سکور بہتر بنانے کے لیے ماہانہ آمدنی کو مستقل رکھیں',
            impact: 'High'
        });
    }

    if (components.platformDiversity.score < 60) {
        recs.push({
            tip: 'Register on more freelance platforms to diversify income sources',
            tipUrdu: 'آمدنی کے ذرائع کو متنوع بنانے کے لیے مزید فری لانس پلیٹ فارمز پر رجسٹر کریں',
            impact: 'Medium'
        });
    }

    if (components.spendingBehavior.score < 60) {
        recs.push({
            tip: 'Increase your savings rate - aim to save at least 30% of income',
            tipUrdu: 'اپنی بچت کی شرح بڑھائیں - آمدنی کا کم از کم 30% بچانے کا ہدف رکھیں',
            impact: 'High'
        });
    }

    if (components.platformRating.score < 70) {
        recs.push({
            tip: 'Focus on maintaining high client ratings on freelance platforms',
            tipUrdu: 'فری لانس پلیٹ فارمز پر اعلی کلائنٹ ریٹنگ برقرار رکھنے پر توجہ دیں',
            impact: 'Medium'
        });
    }

    if (score >= 700) {
        recs.push({
            tip: 'Great score! You qualify for JS Bank\'s Nano Loan program for freelancers',
            tipUrdu: 'بہترین سکور! آپ JS Bank کے فری لانسرز کے لیے نینو لون پروگرام کے اہل ہیں',
            impact: 'Info'
        });
    }

    return recs;
}

function formatFactorName(key) {
    const names = {
        incomeConsistency: 'Income Consistency',
        incomeLevel: 'Income Level',
        platformDiversity: 'Platform Diversity',
        platformRating: 'Platform Rating',
        accountAge: 'Freelancing Experience',
        transactionFrequency: 'Transaction Activity',
        spendingBehavior: 'Spending Behavior'
    };
    return names[key] || key;
}
