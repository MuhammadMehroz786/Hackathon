/**
 * Shariah-Compliant Banking Mode
 * Islamic finance terminology, halal product filtering, Shariah advisory
 * Aligns with SBP Islamic Banking regulations — critical for Pakistan market
 */

// User preferences (in-memory for demo)
const userPreferences = new Map();

// Shariah product mappings — conventional → Islamic equivalents
const TERMINOLOGY_MAP = {
    // Banking terms
    'interest': { shariah: 'profit', shariahUrdu: 'منافع', conventional: 'interest', conventionalUrdu: 'سود' },
    'loan': { shariah: 'financing (Murabaha)', shariahUrdu: 'فنانسنگ (مرابحہ)', conventional: 'loan', conventionalUrdu: 'قرض' },
    'interest rate': { shariah: 'profit rate', shariahUrdu: 'شرح منافع', conventional: 'interest rate', conventionalUrdu: 'شرح سود' },
    'deposit': { shariah: 'Wadiah deposit', shariahUrdu: 'ودیعہ ڈپازٹ', conventional: 'deposit', conventionalUrdu: 'ڈپازٹ' },
    'savings account': { shariah: 'Wadiah Savings', shariahUrdu: 'ودیعہ بچت', conventional: 'savings account', conventionalUrdu: 'بچت اکاؤنٹ' },
    'credit card': { shariah: 'Shariah Card (Ujrah)', shariahUrdu: 'شریعہ کارڈ (اجرہ)', conventional: 'credit card', conventionalUrdu: 'کریڈٹ کارڈ' },
    'insurance': { shariah: 'Takaful', shariahUrdu: 'تکافل', conventional: 'insurance', conventionalUrdu: 'انشورنس' },
    'penalty': { shariah: 'charity donation', shariahUrdu: 'صدقہ', conventional: 'penalty', conventionalUrdu: 'جرمانہ' },
    'mortgage': { shariah: 'Diminishing Musharakah', shariahUrdu: 'گھٹتی مشارکہ', conventional: 'mortgage', conventionalUrdu: 'رہن' },
    'fixed deposit': { shariah: 'Mudarabah Term Deposit', shariahUrdu: 'مضاربہ ٹرم ڈپازٹ', conventional: 'fixed deposit', conventionalUrdu: 'فکسڈ ڈپازٹ' },
    'investment': { shariah: 'Musharakah investment', shariahUrdu: 'مشارکہ سرمایہ کاری', conventional: 'investment', conventionalUrdu: 'سرمایہ کاری' },
    'bond': { shariah: 'Sukuk', shariahUrdu: 'صکوک', conventional: 'bond', conventionalUrdu: 'بانڈ' },
    'mutual fund': { shariah: 'Shariah-compliant fund', shariahUrdu: 'شریعہ فنڈ', conventional: 'mutual fund', conventionalUrdu: 'میوچل فنڈ' }
};

// Islamic finance product structures
const SHARIAH_PRODUCTS = {
    MURABAHA_NANO: {
        id: 'murabaha_nano',
        name: 'Nano Murabaha Financing',
        nameUrdu: 'نینو مرابحہ فنانسنگ',
        conventionalEquivalent: 'Nano Loan',
        structure: 'Cost-plus financing — bank purchases asset and sells at disclosed markup',
        structureUrdu: 'لاگت جمع منافع فنانسنگ — بینک اثاثہ خرید کر معلوم منافع پر فروخت کرتا ہے',
        maxAmount: 100_000,
        profitRate: '3.5% markup (not interest)',
        tenure: '1-6 months',
        shariahBasis: 'Murabaha (مرابحہ) — Sale at disclosed cost + profit',
        scholarApproval: 'Approved by JS Bank Shariah Board'
    },
    MUSHARAKAH_CREDIT: {
        id: 'musharakah_credit',
        name: 'Diminishing Musharakah Credit Line',
        nameUrdu: 'گھٹتی مشارکہ کریڈٹ لائن',
        conventionalEquivalent: 'Freelancer Credit Line',
        structure: 'Joint ownership — bank share gradually decreases as freelancer pays',
        structureUrdu: 'مشترکہ ملکیت — فری لانسر کی ادائیگی سے بینک کا حصہ کم ہوتا جاتا ہے',
        maxAmount: 500_000,
        profitRate: '14-18% profit sharing',
        tenure: 'Revolving',
        shariahBasis: 'Musharakah Mutanaqisah (مشارکہ متناقصہ)',
        scholarApproval: 'Approved by JS Bank Shariah Board'
    },
    TAKAFUL_INCOME: {
        id: 'takaful_income',
        name: 'Income Protection Takaful',
        nameUrdu: 'آمدنی تحفظ تکافل',
        conventionalEquivalent: 'Income Insurance',
        structure: 'Mutual risk-sharing — participants contribute to a common fund (Tabarru)',
        structureUrdu: 'باہمی خطرے کی تقسیم — شرکاء مشترکہ فنڈ (تبرع) میں حصہ ڈالتے ہیں',
        contributionRate: '2% of monthly income',
        coverage: '60% income replacement for 6 months',
        shariahBasis: 'Takaful (تکافل) — Cooperative insurance based on Tabarru',
        scholarApproval: 'Approved by JS Bank Shariah Board'
    },
    SUKUK_SAVINGS: {
        id: 'sukuk_savings',
        name: 'Government Sukuk Savings',
        nameUrdu: 'حکومتی صکوک بچت',
        conventionalEquivalent: 'National Savings Certificates',
        structure: 'Asset-backed government certificates — returns from real economic activity',
        structureUrdu: 'اثاثوں پر مبنی حکومتی سرٹیفکیٹ — حقیقی اقتصادی سرگرمی سے منافع',
        minInvestment: 10_000,
        expectedReturn: '13-15% annually (Sukuk yield)',
        shariahBasis: 'Sukuk (صکوک) — Islamic bond backed by tangible assets',
        scholarApproval: 'Approved by SBP Shariah Board'
    },
    WADIAH_SAVINGS: {
        id: 'wadiah_savings',
        name: 'Wadiah Savings Account',
        nameUrdu: 'ودیعہ بچت اکاؤنٹ',
        conventionalEquivalent: 'Savings Account',
        structure: 'Safekeeping — bank guarantees principal, may give Hibah (gift) as return',
        structureUrdu: 'حفاظت — بینک اصل رقم کی ضمانت دیتا ہے، ہبہ (تحفہ) دے سکتا ہے',
        shariahBasis: 'Wadiah Yad Dhamanah (ودیعہ ید ضمانہ)',
        scholarApproval: 'Standard Islamic banking practice'
    }
};

/**
 * Enable/disable Shariah mode for a user
 */
export function setShariaMode(userId, enabled) {
    if (!userPreferences.has(userId)) {
        userPreferences.set(userId, { shariahMode: false });
    }
    userPreferences.get(userId).shariahMode = enabled;

    return {
        success: true,
        shariahMode: enabled,
        message: enabled
            ? 'Shariah-compliant mode activated. All products and terminology will follow Islamic finance principles.'
            : 'Standard banking mode activated.',
        messageUrdu: enabled
            ? 'شریعہ موڈ فعال ہو گیا۔ تمام مصنوعات اور اصطلاحات اسلامی مالیات کے اصولوں کے مطابق ہوں گی۔'
            : 'معیاری بینکنگ موڈ فعال ہو گیا۔',
        notification: enabled
            ? '☪️ Shariah Mode ON — All banking will use Islamic finance terminology and halal products only.'
            : '🏦 Standard Mode — Full product catalog available.'
    };
}

/**
 * Check if user has Shariah mode enabled
 */
export function isShariahMode(userId) {
    return userPreferences.get(userId)?.shariahMode || false;
}

/**
 * Convert conventional banking text to Shariah-compliant terminology
 */
export function convertToShariahTerms(text) {
    let converted = text;

    // Sort by length descending to replace longer phrases first
    const entries = Object.entries(TERMINOLOGY_MAP).sort((a, b) => b[0].length - a[0].length);

    for (const [conventional, mapping] of entries) {
        const regex = new RegExp(conventional, 'gi');
        converted = converted.replace(regex, mapping.shariah);
    }

    return converted;
}

/**
 * Get Shariah-compliant product alternatives
 */
export function getShariahProducts() {
    return {
        success: true,
        title: 'Shariah-Compliant Products',
        titleUrdu: 'شریعہ کے مطابق مصنوعات',
        shariahBoard: 'JS Bank Shariah Advisory Board',
        products: Object.values(SHARIAH_PRODUCTS).map(p => ({
            name: p.name,
            nameUrdu: p.nameUrdu,
            conventionalEquivalent: p.conventionalEquivalent,
            structure: p.structure,
            structureUrdu: p.structureUrdu,
            shariahBasis: p.shariahBasis,
            approval: p.scholarApproval
        })),
        principles: [
            {
                principle: 'No Riba (Interest)',
                principleUrdu: 'سود کی ممانعت',
                explanation: 'All returns are profit-based, not interest-based',
                explanationUrdu: 'تمام منافع سود پر نہیں بلکہ منافع پر مبنی ہیں'
            },
            {
                principle: 'No Gharar (Excessive Uncertainty)',
                principleUrdu: 'غرر کی ممانعت',
                explanation: 'All terms and conditions are transparent and clearly disclosed',
                explanationUrdu: 'تمام شرائط و ضوابط شفاف اور واضح ہیں'
            },
            {
                principle: 'No Maysir (Gambling)',
                principleUrdu: 'میسر کی ممانعت',
                explanation: 'No speculative or gambling-based products',
                explanationUrdu: 'کوئی قیاس آرائی یا جوئے پر مبنی مصنوعات نہیں'
            },
            {
                principle: 'Asset-Backed Transactions',
                principleUrdu: 'اثاثوں پر مبنی لین دین',
                explanation: 'All financing tied to real economic activity',
                explanationUrdu: 'تمام فنانسنگ حقیقی اقتصادی سرگرمی سے منسلک'
            },
            {
                principle: 'Profit-Loss Sharing',
                principleUrdu: 'نفع نقصان کی شراکت',
                explanation: 'Risk shared between bank and customer — not solely on customer',
                explanationUrdu: 'خطرہ بینک اور صارف کے درمیان مشترک — صرف صارف پر نہیں'
            }
        ]
    };
}

/**
 * Get Shariah compliance status for JS Bank
 */
export function getShariahComplianceStatus() {
    return {
        success: true,
        status: {
            title: 'JS Bank Shariah Compliance',
            titleUrdu: 'JS Bank شریعہ تعمیل',
            overallStatus: 'COMPLIANT',
            shariahBoard: {
                name: 'JS Bank Shariah Advisory Committee',
                chairman: 'Mufti Muhammad Najeeb Khan',
                members: 3,
                meetingFrequency: 'Quarterly',
                lastMeeting: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            auditResults: {
                productCompliance: 'PASSED',
                transactionScreening: 'PASSED',
                investmentScreening: 'PASSED',
                profitDistribution: 'PASSED',
                charityFund: 'ACTIVE',
                lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            purificationProcess: {
                method: 'Auto-purification of non-compliant income',
                charityRecipient: 'Edhi Foundation / JDC Welfare',
                frequency: 'Monthly',
                lastPurification: `PKR ${(Math.random() * 50000 + 10000).toFixed(0)}`
            },
            sbpIslamicBanking: {
                license: 'Islamic Banking Branch License',
                regulatoryFramework: 'SBP Shariah Governance Framework 2018',
                shariahStandards: 'AAOIFI compliant',
                reporting: 'Quarterly to SBP Islamic Banking Department'
            }
        }
    };
}

/**
 * Format Shariah products as WhatsApp message
 */
export function formatShariahMessage() {
    const data = getShariahProducts();

    let msg = `☪️ *SHARIAH-COMPLIANT BANKING*\n`;
    msg += `شریعہ کے مطابق بینکنگ\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `🏛️ Approved by: ${data.shariahBoard}\n\n`;

    msg += `📋 *Available Products:*\n\n`;

    data.products.forEach((p, i) => {
        msg += `${i + 1}. *${p.name}*\n`;
        msg += `   ${p.nameUrdu}\n`;
        msg += `   Replaces: ${p.conventionalEquivalent}\n`;
        msg += `   Basis: ${p.shariahBasis}\n`;
        msg += `   ✅ ${p.approval}\n\n`;
    });

    msg += `📖 *Islamic Finance Principles:*\n`;
    data.principles.forEach(p => {
        msg += `• ${p.principle}: ${p.explanation}\n`;
    });

    msg += `\nType "shariah on" to enable Shariah mode`;
    msg += `\n"shariah on" ٹائپ کریں شریعہ موڈ فعال کرنے کے لیے`;

    return msg;
}
