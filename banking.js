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

// ============ SEED DEMO CUSTOMERS ============

const DEMO_CUSTOMERS = [
    { phone: '923001234567', name: 'Ahmed Raza', city: 'Lahore', skills: ['Web Development', 'React', 'Node.js'], platforms: [{ name: 'Upwork', rating: 4.9, totalEarned: 12500, currency: 'USD', activeMonths: 24 }, { name: 'Toptal', rating: 4.8, totalEarned: 8200, currency: 'USD', activeMonths: 12 }], totalEarnedUSD: 20700, since: '2024-01-10', balance: 485000 },
    { phone: '923012345678', name: 'Fatima Khan', city: 'Karachi', skills: ['Graphic Design', 'Branding', 'UI/UX'], platforms: [{ name: 'Fiverr', rating: 5.0, totalEarned: 9800, currency: 'USD', activeMonths: 18 }, { name: '99designs', rating: 4.7, totalEarned: 4500, currency: 'USD', activeMonths: 10 }], totalEarnedUSD: 14300, since: '2024-03-22', balance: 320000 },
    { phone: '923023456789', name: 'Usman Ali', city: 'Islamabad', skills: ['Mobile Development', 'Flutter', 'Firebase'], platforms: [{ name: 'Upwork', rating: 4.7, totalEarned: 7600, currency: 'USD', activeMonths: 16 }], totalEarnedUSD: 7600, since: '2024-05-15', balance: 218000 },
    { phone: '923034567890', name: 'Ayesha Siddiqui', city: 'Lahore', skills: ['Content Writing', 'SEO', 'Copywriting'], platforms: [{ name: 'Fiverr', rating: 4.9, totalEarned: 6200, currency: 'USD', activeMonths: 20 }, { name: 'Upwork', rating: 4.6, totalEarned: 3800, currency: 'USD', activeMonths: 14 }], totalEarnedUSD: 10000, since: '2024-02-08', balance: 275000 },
    { phone: '923045678901', name: 'Hassan Mahmood', city: 'Faisalabad', skills: ['Data Science', 'Python', 'Machine Learning'], platforms: [{ name: 'Toptal', rating: 4.9, totalEarned: 18500, currency: 'USD', activeMonths: 22 }, { name: 'Upwork', rating: 4.8, totalEarned: 9200, currency: 'USD', activeMonths: 18 }], totalEarnedUSD: 27700, since: '2023-11-01', balance: 720000 },
    { phone: '923056789012', name: 'Zainab Tariq', city: 'Rawalpindi', skills: ['Video Editing', 'Motion Graphics', 'After Effects'], platforms: [{ name: 'Fiverr', rating: 4.8, totalEarned: 5100, currency: 'USD', activeMonths: 12 }], totalEarnedUSD: 5100, since: '2024-07-01', balance: 142000 },
    { phone: '923067890123', name: 'Bilal Hussain', city: 'Multan', skills: ['WordPress', 'PHP', 'WooCommerce'], platforms: [{ name: 'Freelancer', rating: 4.6, totalEarned: 4300, currency: 'USD', activeMonths: 15 }, { name: 'Fiverr', rating: 4.5, totalEarned: 2800, currency: 'USD', activeMonths: 10 }], totalEarnedUSD: 7100, since: '2024-04-20', balance: 198000 },
    { phone: '923078901234', name: 'Sana Malik', city: 'Karachi', skills: ['Digital Marketing', 'Google Ads', 'Facebook Ads'], platforms: [{ name: 'Upwork', rating: 4.8, totalEarned: 11200, currency: 'USD', activeMonths: 20 }], totalEarnedUSD: 11200, since: '2024-01-30', balance: 390000 },
    { phone: '923089012345', name: 'Imran Sheikh', city: 'Peshawar', skills: ['Full Stack', 'MERN', 'DevOps'], platforms: [{ name: 'Upwork', rating: 4.7, totalEarned: 8900, currency: 'USD', activeMonths: 17 }, { name: 'Toptal', rating: 4.6, totalEarned: 6100, currency: 'USD', activeMonths: 8 }], totalEarnedUSD: 15000, since: '2024-02-14', balance: 410000 },
    { phone: '923090123456', name: 'Maryam Nawaz', city: 'Sialkot', skills: ['3D Modeling', 'Blender', 'Unity'], platforms: [{ name: 'Fiverr', rating: 4.9, totalEarned: 7400, currency: 'USD', activeMonths: 14 }], totalEarnedUSD: 7400, since: '2024-06-10', balance: 205000 },
    { phone: '923101234567', name: 'Tariq Jameel', city: 'Lahore', skills: ['iOS Development', 'Swift', 'SwiftUI'], platforms: [{ name: 'Upwork', rating: 4.8, totalEarned: 14200, currency: 'USD', activeMonths: 22 }, { name: 'Toptal', rating: 4.9, totalEarned: 10800, currency: 'USD', activeMonths: 16 }], totalEarnedUSD: 25000, since: '2023-12-05', balance: 680000 },
    { phone: '923112345678', name: 'Hira Batool', city: 'Quetta', skills: ['Translation', 'Urdu', 'Arabic', 'English'], platforms: [{ name: 'Fiverr', rating: 4.7, totalEarned: 3200, currency: 'USD', activeMonths: 11 }], totalEarnedUSD: 3200, since: '2024-08-15', balance: 89000 },
    { phone: '923123456789', name: 'Waqar Ahmed', city: 'Karachi', skills: ['Blockchain', 'Solidity', 'Web3'], platforms: [{ name: 'Upwork', rating: 4.9, totalEarned: 22000, currency: 'USD', activeMonths: 20 }, { name: 'Toptal', rating: 5.0, totalEarned: 15500, currency: 'USD', activeMonths: 14 }], totalEarnedUSD: 37500, since: '2023-09-20', balance: 950000 },
    { phone: '923134567890', name: 'Nadia Akram', city: 'Islamabad', skills: ['UI/UX Design', 'Figma', 'Prototyping'], platforms: [{ name: 'Upwork', rating: 4.8, totalEarned: 8100, currency: 'USD', activeMonths: 16 }, { name: '99designs', rating: 4.9, totalEarned: 5600, currency: 'USD', activeMonths: 12 }], totalEarnedUSD: 13700, since: '2024-03-10', balance: 375000 },
    { phone: '923145678901', name: 'Kamran Akmal', city: 'Lahore', skills: ['Cloud Architecture', 'AWS', 'Terraform'], platforms: [{ name: 'Toptal', rating: 4.8, totalEarned: 19800, currency: 'USD', activeMonths: 18 }], totalEarnedUSD: 19800, since: '2024-01-01', balance: 550000 },
    { phone: '923156789012', name: 'Rabia Noor', city: 'Faisalabad', skills: ['Social Media', 'Instagram', 'TikTok'], platforms: [{ name: 'Fiverr', rating: 4.6, totalEarned: 4800, currency: 'USD', activeMonths: 13 }, { name: 'Freelancer', rating: 4.5, totalEarned: 2100, currency: 'USD', activeMonths: 8 }], totalEarnedUSD: 6900, since: '2024-05-25', balance: 185000 },
    { phone: '923167890123', name: 'Saad Rafiq', city: 'Rawalpindi', skills: ['Backend Dev', 'Java', 'Spring Boot'], platforms: [{ name: 'Upwork', rating: 4.7, totalEarned: 10500, currency: 'USD', activeMonths: 19 }], totalEarnedUSD: 10500, since: '2024-02-28', balance: 295000 },
    { phone: '923178901234', name: 'Amna Rashid', city: 'Karachi', skills: ['Animation', '2D Animation', 'Illustration'], platforms: [{ name: 'Fiverr', rating: 5.0, totalEarned: 8700, currency: 'USD', activeMonths: 16 }, { name: 'Upwork', rating: 4.8, totalEarned: 5300, currency: 'USD', activeMonths: 10 }], totalEarnedUSD: 14000, since: '2024-04-01', balance: 365000 },
    { phone: '923189012345', name: 'Faisal Qureshi', city: 'Multan', skills: ['Cybersecurity', 'Pentesting', 'SOC'], platforms: [{ name: 'Upwork', rating: 4.9, totalEarned: 16300, currency: 'USD', activeMonths: 21 }], totalEarnedUSD: 16300, since: '2023-10-15', balance: 465000 },
    { phone: '923190123456', name: 'Mehreen Jabbar', city: 'Islamabad', skills: ['Technical Writing', 'API Docs', 'SaaS'], platforms: [{ name: 'Upwork', rating: 4.7, totalEarned: 6800, currency: 'USD', activeMonths: 14 }, { name: 'Fiverr', rating: 4.6, totalEarned: 3500, currency: 'USD', activeMonths: 9 }], totalEarnedUSD: 10300, since: '2024-06-20', balance: 245000 },
    { phone: '923201234567', name: 'Shahzad Khan', city: 'Peshawar', skills: ['E-commerce', 'Shopify', 'Dropshipping'], platforms: [{ name: 'Fiverr', rating: 4.5, totalEarned: 3900, currency: 'USD', activeMonths: 10 }], totalEarnedUSD: 3900, since: '2024-09-01', balance: 105000 },
    { phone: '923212345678', name: 'Samira Abbas', city: 'Lahore', skills: ['Data Entry', 'Virtual Assistant', 'Admin'], platforms: [{ name: 'Freelancer', rating: 4.4, totalEarned: 2500, currency: 'USD', activeMonths: 8 }, { name: 'Fiverr', rating: 4.3, totalEarned: 1800, currency: 'USD', activeMonths: 6 }], totalEarnedUSD: 4300, since: '2025-01-05', balance: 72000 },
    { phone: '923223456789', name: 'Omar Farooq', city: 'Karachi', skills: ['Game Development', 'Unity', 'C#'], platforms: [{ name: 'Upwork', rating: 4.8, totalEarned: 13600, currency: 'USD', activeMonths: 20 }, { name: 'Fiverr', rating: 4.7, totalEarned: 4200, currency: 'USD', activeMonths: 12 }], totalEarnedUSD: 17800, since: '2024-01-20', balance: 498000 },
    { phone: '923234567890', name: 'Kinza Hashmi', city: 'Sialkot', skills: ['Voice Over', 'Podcasting', 'Audio Editing'], platforms: [{ name: 'Fiverr', rating: 4.9, totalEarned: 5600, currency: 'USD', activeMonths: 15 }], totalEarnedUSD: 5600, since: '2024-05-10', balance: 155000 },
    { phone: '923245678901', name: 'Adeel Chaudhry', city: 'Gujranwala', skills: ['SEO', 'Link Building', 'Analytics'], platforms: [{ name: 'Upwork', rating: 4.6, totalEarned: 7200, currency: 'USD', activeMonths: 17 }, { name: 'Freelancer', rating: 4.5, totalEarned: 3100, currency: 'USD', activeMonths: 11 }], totalEarnedUSD: 10300, since: '2024-03-15', balance: 282000 },
];

/**
 * Seed demo customers for admin dashboard display
 */
export function seedDemoCustomers() {
    const billTypes = ['K-Electric', 'LESCO', 'SSGC', 'Sui Gas', 'PTCL', 'Jazz', 'Telenor', 'Zong'];
    const foodVendors = ['Foodpanda', 'Careem Food', 'Cheetay', 'Local Restaurant'];
    const shopVendors = ['Daraz', 'Amazon', 'Software License', 'Hosting'];

    for (const cust of DEMO_CUSTOMERS) {
        if (accounts[cust.phone]) continue; // skip if already exists

        const acctNum = 'JSB' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');

        accounts[cust.phone] = {
            name: cust.name,
            accountNumber: acctNum,
            balance: cust.balance,
            currency: 'PKR',
            accountType: 'Freelancer Digital Account',
            createdAt: new Date(cust.since).toISOString(),
            phone: cust.phone
        };

        // Build varied monthly earnings
        const earnings = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const base = cust.totalEarnedUSD / 12;
            const variance = base * (0.7 + Math.random() * 0.6); // 70%-130% of base
            const amountUSD = Math.round(variance);
            earnings.push({
                month: date.toISOString().slice(0, 7),
                amountUSD,
                amountPKR: Math.round(amountUSD * EXCHANGE_RATES.USD_TO_PKR)
            });
        }

        freelancerProfiles[cust.phone] = {
            name: cust.name,
            phone: cust.phone,
            accountNumber: acctNum,
            platforms: cust.platforms,
            skills: cust.skills,
            monthlyEarnings: earnings,
            totalEarnedUSD: cust.totalEarnedUSD,
            registeredSince: cust.since,
            kycVerified: true,
            esfcaEnabled: true,
            city: cust.city,
            cnic: `3${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(Math.random() * 10)}`
        };

        // Generate realistic transaction history (8-15 transactions per customer)
        const txnCount = 8 + Math.floor(Math.random() * 8);
        const txns = [];
        for (let i = 0; i < txnCount; i++) {
            const daysAgo = Math.floor(Math.random() * 45) + 1;
            const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
            const isCredit = Math.random() < 0.45;

            if (isCredit) {
                const platform = cust.platforms[Math.floor(Math.random() * cust.platforms.length)];
                const amountUSD = Math.floor(Math.random() * 1200) + 150;
                const projects = ['Website Redesign', 'Mobile App', 'Logo Design', 'SEO Audit', 'API Development', 'Data Analysis', 'Video Edit', 'Brand Kit', 'Landing Page', 'Dashboard UI'];
                txns.push({
                    id: 'TXN' + Date.now() + Math.floor(Math.random() * 100000),
                    type: 'CREDIT', amount: Math.round(amountUSD * EXCHANGE_RATES.USD_TO_PKR),
                    amountUSD, currency: 'PKR', from: platform.name, timestamp: ts,
                    status: 'COMPLETED',
                    description: `${platform.name} payment: ${projects[Math.floor(Math.random() * projects.length)]}`,
                    category: 'freelance_income', exchangeRate: EXCHANGE_RATES.USD_TO_PKR,
                    purposeCode: 'SBP-9471', blockchainHash: null
                });
            } else {
                const catRoll = Math.random();
                let category, description, amount, to;
                if (catRoll < 0.35) {
                    category = 'bill_payment';
                    to = billTypes[Math.floor(Math.random() * billTypes.length)];
                    amount = Math.floor(Math.random() * 8000) + 1500;
                    description = `${to} bill payment`;
                } else if (catRoll < 0.55) {
                    category = 'transfer';
                    to = 'JSB' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
                    amount = Math.floor(Math.random() * 50000) + 5000;
                    description = `Transfer to ${to}`;
                } else if (catRoll < 0.75) {
                    category = 'food';
                    to = foodVendors[Math.floor(Math.random() * foodVendors.length)];
                    amount = Math.floor(Math.random() * 3000) + 500;
                    description = `${to} order`;
                } else if (catRoll < 0.9) {
                    category = 'shopping';
                    to = shopVendors[Math.floor(Math.random() * shopVendors.length)];
                    amount = Math.floor(Math.random() * 15000) + 2000;
                    description = `${to} purchase`;
                } else {
                    category = 'mobile_topup';
                    to = ['Jazz', 'Telenor', 'Zong', 'Ufone'][Math.floor(Math.random() * 4)];
                    amount = [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)];
                    description = `${to} mobile top-up`;
                }
                txns.push({
                    id: 'TXN' + Date.now() + Math.floor(Math.random() * 100000),
                    type: 'DEBIT', amount, currency: 'PKR', to, timestamp: ts,
                    status: 'COMPLETED', description, category, blockchainHash: null
                });
            }
        }
        // Sort by timestamp descending
        txns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        transactions[cust.phone] = txns;
    }

    console.log(`📊 Seeded ${DEMO_CUSTOMERS.length} demo freelancer accounts for admin dashboard`);
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
