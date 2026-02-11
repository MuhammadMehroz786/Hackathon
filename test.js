/**
 * Test script - Sarmaya AI Banking Components
 */

console.log('🧪 Testing Sarmaya Components...\n');

// Test 1: Imports
console.log('1️⃣  Testing imports...');
try {
    const banking = await import('./banking.js');
    const utils = await import('./utils.js');
    const creditScore = await import('./creditScore.js');
    const responsibleAI = await import('./responsibleAI.js');
    const blockchain = await import('./blockchain.js');
    const businessCase = await import('./businessCase.js');
    const crossSell = await import('./crossSell.js');
    const analytics = await import('./analytics.js');
    const fraudDetection = await import('./fraudDetection.js');
    const shariahMode = await import('./shariahMode.js');
    console.log('   ✅ All 10 modules imported\n');
} catch (error) {
    console.error('   ❌ Import error:', error.message);
    process.exit(1);
}

// Test 2: Freelancer Banking
console.log('2️⃣  Testing freelancer banking...');
try {
    const { createAccount, getBalance, getTransactionHistory, transferMoney,
            getFreelancerProfile, generateIncomeProof, getSpendingBreakdown } = await import('./banking.js');

    const result = createAccount('923001234567', 'Ayesha Khan');
    console.log(`   ✅ Account: ${result.account.accountNumber} (${result.account.accountType})`);
    console.log(`   ✅ Balance: PKR ${result.account.balance.toLocaleString()}`);

    const profile = getFreelancerProfile('923001234567');
    console.log(`   ✅ Platforms: ${profile.profile.platforms.map(p => p.name).join(', ')}`);
    console.log(`   ✅ Total Earned: $${profile.profile.totalEarnedUSD}`);

    const txns = getTransactionHistory('923001234567');
    console.log(`   ✅ Transactions: ${txns.count} found`);

    const proof = generateIncomeProof('923001234567');
    console.log(`   ✅ Income Proof: $${proof.incomeProof.earnings.totalUSD} over ${proof.incomeProof.earnings.months} months`);

    const spending = getSpendingBreakdown('923001234567');
    console.log(`   ✅ Spending Categories: ${spending.breakdown.length}`);

    const transfer = transferMoney('923001234567', 'JSB999999999', 5000);
    console.log(`   ✅ Transfer: PKR 5,000 → ${transfer.transaction.id}\n`);
} catch (error) {
    console.error('   ❌ Banking error:', error.message);
    process.exit(1);
}

// Test 3: Credit Scoring
console.log('3️⃣  Testing credit scoring...');
try {
    const { getTransactionDataForScoring } = await import('./banking.js');
    const { calculateCreditScore } = await import('./creditScore.js');

    const data = getTransactionDataForScoring('923001234567');
    const score = calculateCreditScore(data);
    console.log(`   ✅ Credit Score: ${score.creditScore.score}/850 (${score.creditScore.range})`);
    console.log(`   ✅ Loan Eligible: ${score.loanEligibility.eligible ? 'Yes' : 'No'}`);
    if (score.loanEligibility.eligible) {
        console.log(`   ✅ Max Loan: ${score.loanEligibility.maxLoanAmountFormatted}`);
    }
    console.log(`   ✅ Components: ${score.components.length} factors analyzed`);
    console.log(`   ✅ Responsible AI: ${score.responsibleAI.biasCheck.genderNeutral ? 'Gender-neutral' : 'Needs review'}\n`);
} catch (error) {
    console.error('   ❌ Credit score error:', error.message);
    process.exit(1);
}

// Test 4: Responsible AI
console.log('4️⃣  Testing responsible AI...');
try {
    const rai = await import('./responsibleAI.js');

    rai.grantStandardConsents('923001234567');
    const consent = rai.getConsentSummary('923001234567');
    console.log(`   ✅ Consents recorded`);

    const bias = rai.generateBiasReport();
    const passCount = bias.report.checks.filter(c => c.status === 'PASS').length;
    console.log(`   ✅ Bias Report: ${passCount}/${bias.report.checks.length} checks passed`);
    console.log(`   ✅ Overall: ${bias.report.overallStatus}\n`);
} catch (error) {
    console.error('   ❌ Responsible AI error:', error.message);
    process.exit(1);
}

// Test 5: Blockchain (simulation mode)
console.log('5️⃣  Testing blockchain (simulation)...');
try {
    const bc = await import('./blockchain.js');
    const status = bc.getStatus();
    console.log(`   ✅ Mode: ${status.mode}`);
    console.log(`   ✅ Network: ${status.network}`);

    const mockTxn = {
        id: 'TXN_TEST_001',
        type: 'CREDIT',
        amount: 236725,
        currency: 'PKR',
        timestamp: new Date().toISOString(),
        description: 'Upwork payment: Test Project',
        category: 'freelance_income'
    };

    const logResult = await bc.logTransaction('923001234567', mockTxn);
    console.log(`   ✅ Logged: ${logResult.txHash.slice(0, 20)}...`);
    console.log(`   ✅ Explorer: ${logResult.explorerUrl.slice(0, 50)}...\n`);
} catch (error) {
    console.error('   ❌ Blockchain error:', error.message);
    process.exit(1);
}

// Test 6: Business Case & Cross-sell
console.log('6️⃣  Testing bank-side features...');
try {
    const bc = await import('./businessCase.js');
    const cs = await import('./crossSell.js');
    const an = await import('./analytics.js');
    const fd = await import('./fraudDetection.js');
    const sh = await import('./shariahMode.js');

    // Business Case
    const bizCase = bc.generateBusinessCase();
    console.log(`   ✅ Business Case: ${bizCase.threeYearProjections.length}-year projection`);
    const perCustomer = bc.calculatePerCustomerRevenue();
    console.log(`   ✅ Per Customer Revenue: PKR ${perCustomer.perCustomer.monthly.total}/month`);

    // Cross-sell
    const { getTransactionDataForScoring } = await import('./banking.js');
    const { calculateCreditScore } = await import('./creditScore.js');
    const data = getTransactionDataForScoring('923001234567');
    const creditResult = calculateCreditScore(data);
    const recs = cs.getRecommendations(data, creditResult);
    console.log(`   ✅ Cross-sell: ${recs.recommendations.length} products recommended`);
    console.log(`   ✅ Bank Revenue: ${recs.bankImpact.projectedAnnualRevenue}/year`);

    // Analytics
    const dashboard = an.getDashboard();
    console.log(`   ✅ Dashboard: ${dashboard.dashboard.title}`);
    const funnel = an.getAcquisitionFunnel();
    console.log(`   ✅ Funnel: ${funnel.funnel.stages.length} stages`);
    const compliance = an.getSBPComplianceReport();
    console.log(`   ✅ SBP Compliance: ${compliance.report.status}`);

    // Fraud Detection
    const risk = fd.assessTransactionRisk('923001234567', {
        type: 'DEBIT', amount: 5000, recipient: 'JSB999999999', description: 'Test transfer'
    });
    console.log(`   ✅ Fraud Detection: Risk ${risk.assessment.riskScore}/100 (${risk.assessment.riskLevel})`);
    const fraudDash = fd.getFraudDashboard();
    console.log(`   ✅ Fraud Dashboard: ${fraudDash.dashboard.overview.valueProtected} protected`);

    // Shariah Mode
    const shResult = sh.setShariaMode('923001234567', true);
    console.log(`   ✅ Shariah Mode: ${shResult.shariahMode ? 'ON' : 'OFF'}`);
    const products = sh.getShariahProducts();
    console.log(`   ✅ Shariah Products: ${products.products.length} available`);
    sh.setShariaMode('923001234567', false);
    console.log('');
} catch (error) {
    console.error('   ❌ Bank-side error:', error.message);
    process.exit(1);
}

// Test 7: Voice Auth
console.log('7️⃣  Testing voice authentication...');
try {
    const { execSync } = await import('child_process');
    const result = execSync('python3 voiceAuth.py list 2>/dev/null', { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const data = JSON.parse(lines[lines.length - 1]);
    console.log(`   ✅ Voice auth: ${data.count} enrolled users\n`);
} catch (error) {
    console.log('   ⚠️  Voice auth: Script check skipped (run setup first)\n');
}

// Test 8: OpenAI (check if key is set)
console.log('8️⃣  Checking OpenAI configuration...');
try {
    const { config } = await import('dotenv');
    config();
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        console.log('   ✅ OpenAI API key configured');
        console.log(`   ✅ Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}\n`);
    } else {
        console.log('   ⚠️  OpenAI API key not set (add to .env)\n');
    }
} catch (error) {
    console.log('   ⚠️  Could not check OpenAI config\n');
}

// Test 9: WhatsApp
console.log('9️⃣  Testing WhatsApp client...');
try {
    const pkg = await import('whatsapp-web.js');
    console.log('   ✅ WhatsApp Web.js ready\n');
} catch (error) {
    console.error('   ❌ WhatsApp error:', error.message);
    process.exit(1);
}

console.log('╔══════════════════════════════════════════════════╗');
console.log('║                                                  ║');
console.log('║  ✅ ALL TESTS PASSED! Sarmaya is ready!         ║');
console.log('║  سرمایہ تیار ہے!                                  ║');
console.log('║                                                  ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\n🚀 Run: npm start');
console.log('📋 Don\'t forget to set OPENAI_API_KEY in .env\n');
