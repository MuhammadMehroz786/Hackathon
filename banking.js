/**
 * Freelancer Banking System for Pakistan
 * Mock banking operations tailored for Pakistani freelancers
 * Currency: PKR | Target: 2.3M underserved freelancers
 */

// Mock database
const accounts = {};
const transactions = {};
const freelancerProfiles = {};

// PKR exchange rates (mock)
const EXCHANGE_RATES = {
    USD_TO_PKR: 278.50,
    EUR_TO_PKR: 302.30,
    GBP_TO_PKR: 352.10,
    AED_TO_PKR: 75.85
};

/**
 * Create a new freelancer banking account
 */
export function createAccount(phoneNumber, name, platformData = null) {
    if (accounts[phoneNumber]) {
        return { success: false, message: 'Account already exists' };
    }

    const accountNumber = generateAccountNumber();

    accounts[phoneNumber] = {
        name: name,
        accountNumber: accountNumber,
        balance: Math.floor(Math.random() * 500000) + 50000, // PKR 50,000 - 550,000
        currency: 'PKR',
        accountType: 'Freelancer Digital Account',
        createdAt: new Date().toISOString(),
        phone: phoneNumber
    };

    // Create freelancer profile
    freelancerProfiles[phoneNumber] = {
        name: name,
        phone: phoneNumber,
        accountNumber: accountNumber,
        platforms: platformData?.platforms || [
            { name: 'Upwork', rating: 4.8, totalEarned: 5200, currency: 'USD', activeMonths: 14 },
            { name: 'Fiverr', rating: 4.9, totalEarned: 3100, currency: 'USD', activeMonths: 10 }
        ],
        skills: platformData?.skills || ['Graphic Design', 'UI/UX', 'Web Development'],
        monthlyEarnings: platformData?.monthlyEarnings || generateMonthlyEarnings(),
        totalEarnedUSD: platformData?.totalEarnedUSD || 8300,
        registeredSince: platformData?.registeredSince || '2024-06-15',
        kycVerified: true,
        esfcaEnabled: true, // Export Special Foreign Currency Account
        city: platformData?.city || 'Lahore',
        cnic: platformData?.cnic || '35201-XXXXXXX-X'
    };

    transactions[phoneNumber] = [];
    addFreelancerTransactions(phoneNumber);

    return {
        success: true,
        message: 'Freelancer account created successfully',
        account: accounts[phoneNumber],
        profile: freelancerProfiles[phoneNumber]
    };
}

/**
 * Get account balance
 */
export function getBalance(phoneNumber) {
    const account = accounts[phoneNumber];
    if (!account) return { success: false, message: 'Account not found' };

    return {
        success: true,
        balance: account.balance,
        currency: account.currency,
        accountNumber: account.accountNumber,
        balanceUSD: (account.balance / EXCHANGE_RATES.USD_TO_PKR).toFixed(2)
    };
}

/**
 * Get transaction history
 */
export function getTransactionHistory(phoneNumber, limit = 5) {
    const account = accounts[phoneNumber];
    if (!account) return { success: false, message: 'Account not found' };

    const userTransactions = transactions[phoneNumber] || [];
    return {
        success: true,
        transactions: userTransactions.slice(0, limit),
        count: Math.min(userTransactions.length, limit),
        totalTransactions: userTransactions.length
    };
}

/**
 * Transfer money
 */
export function transferMoney(fromPhone, toAccountNumber, amount, description = '') {
    const account = accounts[fromPhone];
    if (!account) return { success: false, message: 'Account not found' };
    if (amount <= 0) return { success: false, message: 'Invalid amount' };
    if (account.balance < amount) return { success: false, message: 'Insufficient balance' };

    account.balance -= amount;

    const transaction = {
        id: generateTransactionId(),
        type: 'DEBIT',
        amount: amount,
        currency: 'PKR',
        to: toAccountNumber,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        description: description || `Transfer to ${toAccountNumber}`,
        category: 'transfer',
        blockchainHash: null // Will be set by blockchain service
    };

    transactions[fromPhone].unshift(transaction);

    return {
        success: true,
        message: 'Transfer successful',
        transaction: transaction,
        newBalance: account.balance
    };
}

/**
 * Receive freelance payment (simulate platform payout)
 */
export function receiveFreelancePayment(phoneNumber, amountUSD, platform, projectName) {
    const account = accounts[phoneNumber];
    if (!account) return { success: false, message: 'Account not found' };

    const amountPKR = Math.round(amountUSD * EXCHANGE_RATES.USD_TO_PKR);
    account.balance += amountPKR;

    const transaction = {
        id: generateTransactionId(),
        type: 'CREDIT',
        amount: amountPKR,
        amountUSD: amountUSD,
        currency: 'PKR',
        from: platform,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        description: `${platform} payment: ${projectName}`,
        category: 'freelance_income',
        exchangeRate: EXCHANGE_RATES.USD_TO_PKR,
        purposeCode: 'SBP-9471', // SBP purpose code for IT services
        blockchainHash: null
    };

    transactions[phoneNumber].unshift(transaction);

    // Update freelancer profile earnings
    if (freelancerProfiles[phoneNumber]) {
        freelancerProfiles[phoneNumber].totalEarnedUSD += amountUSD;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const earnings = freelancerProfiles[phoneNumber].monthlyEarnings;
        const existing = earnings.find(e => e.month === currentMonth);
        if (existing) {
            existing.amountUSD += amountUSD;
            existing.amountPKR += amountPKR;
        } else {
            earnings.push({ month: currentMonth, amountUSD, amountPKR });
        }
    }

    return {
        success: true,
        message: 'Payment received',
        transaction: transaction,
        newBalance: account.balance,
        convertedAmount: { usd: amountUSD, pkr: amountPKR, rate: EXCHANGE_RATES.USD_TO_PKR }
    };
}

/**
 * Pay bill
 */
export function payBill(phoneNumber, billType, amount, billReference = '') {
    const account = accounts[phoneNumber];
    if (!account) return { success: false, message: 'Account not found' };
    if (account.balance < amount) return { success: false, message: 'Insufficient balance' };

    account.balance -= amount;

    const transaction = {
        id: generateTransactionId(),
        type: 'DEBIT',
        amount: amount,
        currency: 'PKR',
        to: billType,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        description: `${billType} bill payment${billReference ? ': ' + billReference : ''}`,
        category: 'bill_payment',
        blockchainHash: null
    };

    transactions[phoneNumber].unshift(transaction);

    return {
        success: true,
        message: `${billType} bill paid successfully`,
        transaction: transaction,
        newBalance: account.balance
    };
}

/**
 * Get account details
 */
export function getAccountDetails(phoneNumber) {
    const account = accounts[phoneNumber];
    if (!account) return { success: false, message: 'Account not found' };

    return {
        success: true,
        account: {
            name: account.name,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: account.balance,
            currency: account.currency,
            balanceUSD: (account.balance / EXCHANGE_RATES.USD_TO_PKR).toFixed(2)
        }
    };
}

/**
 * Get freelancer profile
 */
export function getFreelancerProfile(phoneNumber) {
    const profile = freelancerProfiles[phoneNumber];
    if (!profile) return { success: false, message: 'Freelancer profile not found' };

    return {
        success: true,
        profile: profile
    };
}

/**
 * Generate income proof data for blockchain verification
 */
export function generateIncomeProof(phoneNumber, months = 6) {
    const profile = freelancerProfiles[phoneNumber];
    const userTxns = transactions[phoneNumber];
    if (!profile || !userTxns) return { success: false, message: 'Profile not found' };

    const freelanceIncome = userTxns.filter(t => t.category === 'freelance_income');
    const earnings = profile.monthlyEarnings.slice(-months);

    const totalUSD = earnings.reduce((sum, e) => sum + e.amountUSD, 0);
    const totalPKR = earnings.reduce((sum, e) => sum + e.amountPKR, 0);
    const avgMonthlyUSD = totalUSD / Math.max(earnings.length, 1);
    const consistencyScore = calculateConsistency(earnings);

    return {
        success: true,
        incomeProof: {
            freelancerName: profile.name,
            accountNumber: profile.accountNumber,
            cnic: profile.cnic,
            period: `Last ${months} months`,
            platforms: profile.platforms.map(p => ({
                name: p.name,
                rating: p.rating,
                totalEarned: `$${p.totalEarned}`,
                activeMonths: p.activeMonths
            })),
            earnings: {
                totalUSD: totalUSD.toFixed(2),
                totalPKR: Math.round(totalPKR),
                avgMonthlyUSD: avgMonthlyUSD.toFixed(2),
                avgMonthlyPKR: Math.round(avgMonthlyUSD * EXCHANGE_RATES.USD_TO_PKR),
                months: earnings.length
            },
            incomeConsistency: consistencyScore,
            transactionCount: freelanceIncome.length,
            verificationTimestamp: new Date().toISOString(),
            sbpPurposeCode: 'SBP-9471',
            blockchainVerified: false // Will be set to true after on-chain logging
        }
    };
}

/**
 * Get spending breakdown by category
 */
export function getSpendingBreakdown(phoneNumber) {
    const userTxns = transactions[phoneNumber];
    if (!userTxns) return { success: false, message: 'No transactions found' };

    const debits = userTxns.filter(t => t.type === 'DEBIT');
    const categories = {};

    debits.forEach(t => {
        const cat = t.category || 'other';
        if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
        categories[cat].total += t.amount;
        categories[cat].count += 1;
    });

    const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);

    return {
        success: true,
        breakdown: Object.entries(categories).map(([category, data]) => ({
            category: formatCategoryName(category),
            total: data.total,
            count: data.count,
            percentage: ((data.total / totalSpent) * 100).toFixed(1)
        })).sort((a, b) => b.total - a.total),
        totalSpent: totalSpent,
        currency: 'PKR'
    };
}

/**
 * Check if account exists
 */
export function accountExists(phoneNumber) {
    return !!accounts[phoneNumber];
}

/**
 * Get all transaction data for credit scoring
 */
export function getTransactionDataForScoring(phoneNumber) {
    const profile = freelancerProfiles[phoneNumber];
    const userTxns = transactions[phoneNumber];
    const account = accounts[phoneNumber];
    if (!profile || !userTxns || !account) return null;

    return {
        profile: profile,
        transactions: userTxns,
        account: account,
        monthlyEarnings: profile.monthlyEarnings,
        platforms: profile.platforms
    };
}

/**
 * Update transaction with blockchain hash
 */
export function updateTransactionBlockchainHash(phoneNumber, transactionId, hash) {
    const userTxns = transactions[phoneNumber];
    if (!userTxns) return false;

    const txn = userTxns.find(t => t.id === transactionId);
    if (txn) {
        txn.blockchainHash = hash;
        return true;
    }
    return false;
}

/**
 * Get exchange rates
 */
export function getExchangeRates() {
    return {
        success: true,
        rates: EXCHANGE_RATES,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * List all accounts (for admin dashboard)
 */
export function listAllAccounts() {
    return Object.entries(accounts).map(([phone, account]) => ({
        phone,
        ...account,
        profile: freelancerProfiles[phone] || null
    }));
}

// ============ HELPER FUNCTIONS ============

function generateAccountNumber() {
    return 'JSB' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
}

function generateTransactionId() {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
}

function calculateConsistency(earnings) {
    if (earnings.length < 2) return 'insufficient_data';
    const amounts = earnings.map(e => e.amountUSD);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const cv = Math.sqrt(variance) / avg; // coefficient of variation
    if (cv < 0.2) return 'high';
    if (cv < 0.5) return 'medium';
    return 'low';
}

function formatCategoryName(category) {
    const names = {
        'freelance_income': 'Freelance Income',
        'transfer': 'Transfers',
        'bill_payment': 'Bill Payments',
        'mobile_topup': 'Mobile Top-up',
        'shopping': 'Shopping',
        'food': 'Food & Dining',
        'transport': 'Transport',
        'other': 'Other'
    };
    return names[category] || category;
}

function generateMonthlyEarnings() {
    const earnings = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.toISOString().slice(0, 7);
        const amountUSD = Math.floor(Math.random() * 800) + 400; // $400-1200/month
        earnings.push({
            month: month,
            amountUSD: amountUSD,
            amountPKR: Math.round(amountUSD * EXCHANGE_RATES.USD_TO_PKR)
        });
    }
    return earnings;
}

function addFreelancerTransactions(phoneNumber) {
    const profile = freelancerProfiles[phoneNumber];
    const dummyTransactions = [
        {
            id: generateTransactionId(),
            type: 'CREDIT',
            amount: Math.round(850 * EXCHANGE_RATES.USD_TO_PKR),
            amountUSD: 850,
            currency: 'PKR',
            from: 'Upwork',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'Upwork payment: Website Redesign Project',
            category: 'freelance_income',
            exchangeRate: EXCHANGE_RATES.USD_TO_PKR,
            purposeCode: 'SBP-9471',
            blockchainHash: null
        },
        {
            id: generateTransactionId(),
            type: 'CREDIT',
            amount: Math.round(320 * EXCHANGE_RATES.USD_TO_PKR),
            amountUSD: 320,
            currency: 'PKR',
            from: 'Fiverr',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'Fiverr payment: Logo Design Bundle',
            category: 'freelance_income',
            exchangeRate: EXCHANGE_RATES.USD_TO_PKR,
            purposeCode: 'SBP-9471',
            blockchainHash: null
        },
        {
            id: generateTransactionId(),
            type: 'DEBIT',
            amount: 3500,
            currency: 'PKR',
            to: 'K-Electric',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'K-Electric bill payment',
            category: 'bill_payment',
            blockchainHash: null
        },
        {
            id: generateTransactionId(),
            type: 'DEBIT',
            amount: 1200,
            currency: 'PKR',
            to: 'Jazz',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'Jazz mobile top-up',
            category: 'mobile_topup',
            blockchainHash: null
        },
        {
            id: generateTransactionId(),
            type: 'CREDIT',
            amount: Math.round(500 * EXCHANGE_RATES.USD_TO_PKR),
            amountUSD: 500,
            currency: 'PKR',
            from: 'Upwork',
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'Upwork payment: Mobile App UI Design',
            category: 'freelance_income',
            exchangeRate: EXCHANGE_RATES.USD_TO_PKR,
            purposeCode: 'SBP-9471',
            blockchainHash: null
        },
        {
            id: generateTransactionId(),
            type: 'DEBIT',
            amount: 2800,
            currency: 'PKR',
            to: 'Foodpanda',
            timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
            description: 'Foodpanda order',
            category: 'food',
            blockchainHash: null
        }
    ];

    transactions[phoneNumber] = dummyTransactions;
}
