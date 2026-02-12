/**
 * Sarmaya (سرمایہ) - WhatsApp AI Banking for Pakistani Freelancers
 *
 * Features:
 * - GPT-4o conversational banking with function calling
 * - Whisper Urdu/English voice-to-text commands
 * - Voice biometric authentication (Resemblyzer)
 * - Blockchain income verification (Polygon Amoy)
 * - Alternative credit scoring for unbanked freelancers
 * - Responsible AI with full transparency
 *
 * Target: Pakistan's 2.3M freelancers (96.8% unbanked)
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import * as banking from './banking.js';
import * as ai from './ai.js';
import * as blockchain from './blockchain.js';
import * as creditScore from './creditScore.js';
import * as responsibleAI from './responsibleAI.js';
import * as businessCase from './businessCase.js';
import * as crossSell from './crossSell.js';
import * as analytics from './analytics.js';
import * as fraudDetection from './fraudDetection.js';
import * as shariahMode from './shariahMode.js';
import * as utils from './utils.js';
import * as usersModule from './users.js';
import { startServer } from './server.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Start Express API server for web dashboard (shares same in-memory data)
// Railway sets PORT env var; locally defaults to 4000
startServer(process.env.PORT || process.env.API_PORT || 4000);

// ============ SESSION MANAGEMENT ============

const userSessions = new Map();
const enrollmentSessions = new Map();
const conversationHistory = new Map(); // Per-user AI conversation history

const STATE = {
    UNAUTHENTICATED: 'unauthenticated',
    ENROLLING: 'enrolling',
    AUTHENTICATED: 'authenticated'
};

// ============ INITIALIZE SERVICES ============

// Initialize blockchain
blockchain.initialize();

// ============ WHATSAPP CLIENT ============

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.WWEBJS_AUTH_PATH || undefined
    }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        timeout: 60000
    }
});

client.on('qr', (qr) => {
    console.log('\n🔐 Scan this QR code with WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 WhatsApp → Linked Devices → Link a Device\n');
});

client.on('ready', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  سرمایہ  Sarmaya - AI Banking for Freelancers   ║');
    console.log('║  ✅ WhatsApp Connected                          ║');
    console.log('║  🤖 GPT-4o AI Engine Ready                      ║');
    console.log('║  🎤 Whisper Urdu Voice Ready                    ║');
    console.log('║  ⛓️  Blockchain: ' + blockchain.getStatus().mode.padEnd(31) + ' ║');
    console.log('║  📊 Credit Scoring Engine Ready                 ║');
    console.log('║  🛡️  Responsible AI Layer Active                 ║');
    console.log('║  💼 Business Case Engine Ready                  ║');
    console.log('║  🛒 Cross-sell AI Engine Ready                  ║');
    console.log('║  📈 Bank Analytics Dashboard Ready              ║');
    console.log('║  🚨 Fraud Detection System Active               ║');
    console.log('║  ☪️  Shariah Mode Available                      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    setInterval(() => utils.cleanupAudioFiles(30), 10 * 60 * 1000);
});

client.on('auth_failure', (msg) => {
    console.error('⚠️ WhatsApp auth failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp disconnected:', reason);
});

client.on('message', async (message) => {
    try {
        await handleMessage(message);
    } catch (error) {
        console.error('Error handling message:', error);
        await message.reply('❌ An error occurred. Please try again.');
    }
});

// ============ MAIN MESSAGE HANDLER ============

async function handleMessage(message) {
    const userId = utils.getUserId(message.from);

    // Silently ignore messages from unregistered users
    if (!usersModule.isRegistered(userId)) {
        return;
    }

    const userSession = userSessions.get(userId) || {
        state: STATE.UNAUTHENTICATED,
        lastActivity: Date.now()
    };

    userSession.lastActivity = Date.now();
    userSessions.set(userId, userSession);

    // Handle voice messages
    if (message.hasMedia && message.type === 'ptt') {
        await handleVoiceMessage(message, userId, userSession);
        return;
    }

    const text = message.body.toLowerCase().trim();

    // ---- SYSTEM COMMANDS (work regardless of auth state) ----

    if (text === '/start' || text === 'start' || text === 'hi' || text === 'hello' || text === 'assalam o alaikum') {
        await handleStartCommand(message, userId, userSession);
        return;
    }

    if (text === '/help' || text === 'help' || text === 'madad') {
        await sendHelpMessage(message, userSession.state === STATE.AUTHENTICATED);
        return;
    }

    if (text === '/reset' || text === 'reset') {
        enrollmentSessions.delete(userId);
        conversationHistory.delete(userId);
        userSession.state = STATE.UNAUTHENTICATED;
        userSessions.set(userId, userSession);
        await message.reply('🔄 Session reset. Send *start* to begin again.');
        return;
    }

    // ---- AUTHENTICATED: AI-POWERED BANKING ----

    if (userSession.state === STATE.AUTHENTICATED) {
        await handleAIBanking(message, userId, text);
    } else {
        await message.reply(
            '🔒 *Authentication Required*\n\n' +
            'آپ کو پہلے تصدیق کرنی ہوگی۔\n\n' +
            '🆕 New user? Send *start* to enroll your voice\n' +
            '🔑 Returning? Send a *voice message* to authenticate'
        );
    }
}

// ============ START / ENROLLMENT ============

async function handleStartCommand(message, userId, userSession) {
    const result = await utils.callVoiceAuth('list');

    if (result.success && result.users.includes(userId)) {
        await message.reply(
            '👋 *Welcome back to Sarmaya!*\n' +
            'سرمایہ میں واپس خوش آمدید!\n\n' +
            '🎤 Please send a *voice message* to authenticate.\n' +
            'تصدیق کے لیے *وائس میسج* بھیجیں۔\n\n' +
            '💡 Say any phrase clearly for 3-5 seconds.'
        );
        userSession.state = STATE.UNAUTHENTICATED;
    } else {
        const isWebUser = usersModule.isRegistered(userId);
        const webUser = isWebUser ? usersModule.getUserByPhone(userId) : null;

        await message.reply(
            (isWebUser
                ? `👋 *Welcome, ${webUser.name}!*\n` +
                  '🌐 We found your Sarmaya web account.\n' +
                  'آپ کا ویب اکاؤنٹ مل گیا!\n\n' +
                  '🎤 Complete voice enrollment to unlock WhatsApp banking:\n\n'
                : '👋 *Welcome to Sarmaya!* سرمایہ میں خوش آمدید!\n' +
                  '🏦 AI Banking for Pakistani Freelancers\n\n' +
                  '🎤 To enroll, send *3 voice messages*:\n\n') +
            '1️⃣ "My voice is my password"\n' +
            '   "میری آواز میرا پاسورڈ ہے"\n\n' +
            '2️⃣ "Verify my identity for banking"\n' +
            '   "بینکنگ کے لیے میری شناخت کی تصدیق کریں"\n\n' +
            '3️⃣ "Access my account securely"\n' +
            '   "محفوظ طریقے سے میرے اکاؤنٹ تک رسائی حاصل کریں"\n\n' +
            '📝 Each message: 3-5 seconds long.'
        );

        enrollmentSessions.set(userId, {
            audioFiles: [],
            name: 'User',
            startedAt: Date.now()
        });

        userSession.state = STATE.ENROLLING;
    }

    userSessions.set(userId, userSession);
}

// ============ VOICE MESSAGE HANDLING ============

async function handleVoiceMessage(message, userId, userSession) {
    console.log(`🎤 Voice message from ${userId} | State: ${userSession.state}`);

    try {
        const filename = `${userId}_${Date.now()}`;
        const { wavPath, oggPath } = await utils.saveVoiceMessage(message, filename);

        if (userSession.state === STATE.ENROLLING) {
            // Enrollment uses WAV for Resemblyzer
            await handleEnrollmentVoice(message, userId, wavPath);
        } else if (userSession.state === STATE.AUTHENTICATED) {
            // Voice commands: OGG for Whisper transcription
            await handleVoiceCommand(message, userId, oggPath);
        } else {
            // Voice auth: WAV for Resemblyzer verification
            await handleVerificationVoice(message, userId, wavPath);
        }
    } catch (error) {
        console.error('Voice processing error:', error);
        await message.reply('❌ Voice processing failed. Please try again with a clear recording.');
    }
}

/**
 * Handle voice enrollment (collecting 3 voice samples)
 */
async function handleEnrollmentVoice(message, userId, audioPath) {
    const enrollment = enrollmentSessions.get(userId);
    if (!enrollment) {
        await message.reply('❌ No enrollment session. Send *start* to begin.');
        return;
    }

    enrollment.audioFiles.push(audioPath);
    const count = enrollment.audioFiles.length;

    if (count < 3) {
        await message.reply(
            `✅ Voice sample ${count}/3 recorded!\n` +
            `آواز کا نمونہ ${count}/3 ریکارڈ ہوا!\n\n` +
            `🎤 Send ${3 - count} more voice message(s).`
        );
    } else {
        await message.reply('🔄 Creating your voice profile...\nآپ کا وائس پروفائل بنایا جا رہا ہے...');

        const result = await utils.callVoiceAuth('enroll', [userId, ...enrollment.audioFiles]);

        if (result.success) {
            const contact = await message.getContact();
            const name = contact.pushname || 'Freelancer';
            if (!banking.accountExists(userId)) {
                banking.createAccount(userId, name);
                responsibleAI.grantStandardConsents(userId);
            }

            const isWebUser = usersModule.isRegistered(userId);
            await message.reply(
                '✅ *Voice Profile Created!*\n' +
                'وائس پروفائل کامیابی سے بن گیا!\n\n' +
                (isWebUser
                    ? '🌐 Your web dashboard account is now linked!\n'
                    : '🏦 Your JS Bank Freelancer Account is ready.\n') +
                '🔐 Voice biometric authentication enabled.\n' +
                '⛓️  Blockchain income tracking activated.\n' +
                '📊 Alternative credit scoring enabled.\n\n' +
                '🎤 Send a *voice message* to login!'
            );

            enrollmentSessions.delete(userId);
            userSession.state = STATE.UNAUTHENTICATED;
            userSessions.set(userId, userSession);
        } else {
            await message.reply(`❌ Enrollment failed: ${result.error}\nSend *reset* to try again.`);
        }
    }
}

/**
 * Handle voice authentication
 */
async function handleVerificationVoice(message, userId, audioPath) {
    await message.reply('🔐 Verifying your voice...\nآپ کی آواز کی تصدیق ہو رہی ہے...');

    const threshold = parseFloat(process.env.VOICE_THRESHOLD) || 0.75;
    const result = await utils.callVoiceAuth('verify', [userId, audioPath, threshold.toString()]);

    if (!result.success) {
        await message.reply(
            `❌ ${result.error}\n\n` +
            'Not enrolled? Send *start* to register.'
        );
        return;
    }

    if (result.verified) {
        const similarity = (result.similarity * 100).toFixed(1);

        if (!banking.accountExists(userId)) {
            const contact = await message.getContact();
            const name = contact.pushname || 'Freelancer';
            banking.createAccount(userId, name);
            responsibleAI.grantStandardConsents(userId);
        }

        const userSession = userSessions.get(userId);
        userSession.state = STATE.AUTHENTICATED;
        userSessions.set(userId, userSession);

        const accountInfo = banking.getAccountDetails(userId);
        const acc = accountInfo.account;

        await message.reply(
            `✅ *Voice Verified!* (${similarity}% match)\n` +
            `آواز کی تصدیق ہو گئی!\n\n` +
            `👤 ${acc.name}\n` +
            `💳 ${acc.accountNumber}\n` +
            `💰 PKR ${acc.balance.toLocaleString()} (~$${acc.balanceUSD})\n\n` +
            `🤖 *I'm Sarmaya, your AI banking assistant.*\n` +
            `میں سرمایہ ہوں، آپ کا AI بینکنگ معاون۔\n\n` +
            `You can now:\n` +
            `• Type or speak in *Urdu or English*\n` +
            `• Ask: "Mera balance kya hai?"\n` +
            `• Ask: "Show my credit score"\n` +
            `• Ask: "Generate income proof"\n` +
            `• Say: "Transfer 5000 to JSB123456789"\n\n` +
            `Type *help* for all commands.`
        );

        // Log authentication to responsible AI
        responsibleAI.logAIDecision({
            userId,
            type: 'voice_authentication',
            input: 'voice_biometric',
            output: `verified_${similarity}%`,
            dataUsed: ['voice_embedding', 'stored_profile'],
            confidence: result.similarity,
            explanation: `Voice matched with ${similarity}% similarity (threshold: ${threshold * 100}%)`
        });
    } else {
        const similarity = (result.similarity * 100).toFixed(1);
        await message.reply(
            `❌ *Voice Verification Failed*\n` +
            `آواز کی تصدیق ناکام\n\n` +
            `Match: ${similarity}% (Required: ${threshold * 100}%)\n\n` +
            `Please try again with a clear voice message.\n` +
            `براہ کرم واضح آواز کے ساتھ دوبارہ کوشش کریں۔`
        );
    }
}

/**
 * Handle voice commands (authenticated user speaks a command)
 * Uses Whisper for transcription → GPT-4o for processing
 */
async function handleVoiceCommand(message, userId, audioPath) {
    await message.reply('🎤 Processing your voice command...\nآپ کی آواز کی کمانڈ پر عمل ہو رہا ہے...');

    // Step 1: Transcribe with Whisper
    const transcription = await ai.transcribeVoice(audioPath);

    if (!transcription.success) {
        console.error('❌ Whisper failed:', transcription.error);
        await message.reply(`❌ Could not understand the voice message.\n_Error: ${transcription.error || 'unknown'}_\n\nPlease try again or type your request.`);
        return;
    }

    console.log(`🗣️  Transcribed (${transcription.language}): "${transcription.text}"`);

    // Show transcription to user
    const langLabel = transcription.language === 'en' ? 'English' : 'اردو';

    await message.reply(`🗣️ *Heard (${langLabel}):* "${transcription.text}"`);

    // Step 2: Process through GPT-4o
    await handleAIBanking(message, userId, transcription.text);
}

// ============ AI-POWERED BANKING ============

async function handleAIBanking(message, userId, text) {
    // Quick commands that bypass AI for speed
    const quickCommand = handleQuickCommand(text);
    if (quickCommand) {
        await executeQuickCommand(message, userId, quickCommand);
        return;
    }

    // Get conversation history
    const history = conversationHistory.get(userId) || [];

    // Process through GPT-4o with function calling
    const result = await ai.processMessage(
        text,
        userId,
        banking,
        creditScore,
        blockchain,
        history,
        {
            crossSellModule: crossSell,
            analyticsModule: analytics,
            businessCaseModule: businessCase,
            fraudModule: fraudDetection,
            shariahModule: shariahMode
        }
    );

    // Update conversation history
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: result.response });

    // Keep only last 10 messages
    if (history.length > 10) history.splice(0, history.length - 10);
    conversationHistory.set(userId, history);

    // Fraud detection + blockchain logging for transactions
    for (const txn of result.transactionsToLog) {
        // Assess fraud risk before processing
        const riskAssessment = fraudDetection.assessTransactionRisk(userId, {
            type: txn.type,
            amount: txn.amount,
            recipient: txn.recipient || txn.description,
            description: txn.description,
            platform: txn.platform
        });

        if (riskAssessment.assessment.shouldBlock) {
            result.response += `\n\n🚨 *Transaction Blocked*\n`;
            result.response += `لین دین بلاک ہو گیا\n`;
            result.response += `Risk Score: ${riskAssessment.assessment.riskScore}/100\n`;
            result.response += `${riskAssessment.assessment.recommendation.en}`;
            analytics.trackEvent('fraud_alert', { blocked: true });
            continue;
        }

        if (riskAssessment.assessment.shouldVerify) {
            result.response += `\n\n⚠️ *Enhanced Verification Required* (Risk: ${riskAssessment.assessment.riskScore}/100)\n`;
            result.response += `${riskAssessment.assessment.recommendation.ur}`;
        }

        // Log to blockchain
        const blockchainResult = await blockchain.logTransaction(userId, txn);
        if (blockchainResult.success) {
            banking.updateTransactionBlockchainHash(userId, txn.id, blockchainResult.txHash);

            const chainInfo = blockchainResult.simulated ? ' (demo)' : '';
            result.response += `\n\n⛓️ *Blockchain Verified${chainInfo}*\n🔗 ${blockchainResult.explorerUrl}`;
        }

        // Track analytics
        analytics.trackEvent('transaction', { amount: txn.amount });
        analytics.trackEvent('blockchain_logged');
    }

    // Log AI decision
    if (result.functionsCalled.length > 0) {
        responsibleAI.logAIDecision({
            userId,
            type: 'banking_operation',
            input: text,
            output: result.functionsCalled.map(f => f.name).join(', '),
            dataUsed: ['user_message', 'account_data', 'transaction_history'],
            confidence: 0.95,
            explanation: `AI processed: ${result.functionsCalled.map(f => f.name).join(', ')}`
        });
    }

    await message.reply(result.response);

    // Send voice response using OpenAI TTS
    await sendVoiceReply(message, result.response, userId);
}

/**
 * Send a voice note reply using OpenAI TTS
 */
async function sendVoiceReply(message, text, userId) {
    try {
        const ttsResult = await ai.textToSpeech(text, `${userId}_${Date.now()}`);
        if (ttsResult.success) {
            const media = MessageMedia.fromFilePath(ttsResult.path);
            media.mimetype = 'audio/ogg; codecs=opus';
            await message.reply(media, undefined, { sendAudioAsVoice: true });

            // Cleanup TTS file
            try { fs.unlinkSync(ttsResult.path); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Voice reply error:', error);
        // Silently fail — text reply was already sent
    }
}

/**
 * Quick commands for common operations (bypass AI for speed)
 */
function handleQuickCommand(text) {
    const commands = {
        'balance': 'balance',
        '/balance': 'balance',
        'mera balance': 'balance',
        'transactions': 'transactions',
        '/transactions': 'transactions',
        'account': 'account',
        '/account': 'account',
        'profile': 'profile',
        '/profile': 'profile',
        'credit score': 'credit_score',
        '/creditscore': 'credit_score',
        'credit': 'credit_score',
        'income proof': 'income_proof',
        '/incomeproof': 'income_proof',
        'spending': 'spending',
        '/spending': 'spending',
        'rates': 'rates',
        '/rates': 'rates',
        'bias report': 'bias_report',
        '/bias': 'bias_report',
        'consent': 'consent',
        '/consent': 'consent',
        'logout': 'logout',
        '/logout': 'logout',
        // Bank-side / Admin commands
        'dashboard': 'dashboard',
        '/dashboard': 'dashboard',
        'business case': 'business_case',
        '/businesscase': 'business_case',
        'recommend': 'cross_sell',
        'recommendations': 'cross_sell',
        '/recommend': 'cross_sell',
        'funnel': 'funnel',
        '/funnel': 'funnel',
        'fraud': 'fraud_dashboard',
        '/fraud': 'fraud_dashboard',
        'compliance': 'compliance',
        '/compliance': 'compliance',
        'shariah': 'shariah_products',
        '/shariah': 'shariah_products',
        'shariah on': 'shariah_on',
        'shariah off': 'shariah_off'
    };

    return commands[text] || null;
}

async function executeQuickCommand(message, userId, command) {
    switch (command) {
        case 'balance': {
            const result = banking.getBalance(userId);
            if (result.success) {
                const reply = `💰 *Account Balance*\n\n` +
                    `🇵🇰 PKR ${result.balance.toLocaleString()}\n` +
                    `🇺🇸 ~$${result.balanceUSD} USD\n` +
                    `💳 ${result.accountNumber}`;
                await message.reply(reply);
                await sendVoiceReply(message, reply, userId);
            }
            break;
        }

        case 'transactions': {
            const result = banking.getTransactionHistory(userId, 5);
            if (result.success && result.count > 0) {
                let response = `📝 *Recent Transactions* (${result.count}/${result.totalTransactions})\n\n`;
                result.transactions.forEach((txn, i) => {
                    const icon = txn.type === 'CREDIT' ? '💚' : '🔴';
                    const sign = txn.type === 'CREDIT' ? '+' : '-';
                    const usdInfo = txn.amountUSD ? ` ($${txn.amountUSD})` : '';
                    response += `${icon} ${sign}PKR ${txn.amount.toLocaleString()}${usdInfo}\n`;
                    response += `   ${txn.description}\n`;
                    response += `   ${new Date(txn.timestamp).toLocaleDateString()}\n`;
                    if (txn.blockchainHash) response += `   ⛓️ Verified\n`;
                    response += '\n';
                });
                await message.reply(response);
                await sendVoiceReply(message, response, userId);
            } else {
                await message.reply('📝 No transactions found.');
            }
            break;
        }

        case 'account': {
            const result = banking.getAccountDetails(userId);
            if (result.success) {
                const acc = result.account;
                const reply = `👤 *Account Details*\n\n` +
                    `Name: ${acc.name}\n` +
                    `Account: ${acc.accountNumber}\n` +
                    `Type: ${acc.accountType}\n` +
                    `Balance: PKR ${acc.balance.toLocaleString()} (~$${acc.balanceUSD})\n` +
                    `Currency: ${acc.currency}`;
                await message.reply(reply);
                await sendVoiceReply(message, reply, userId);
            }
            break;
        }

        case 'profile': {
            const result = banking.getFreelancerProfile(userId);
            if (result.success) {
                const p = result.profile;
                let response = `🧑‍💻 *Freelancer Profile*\n\n`;
                response += `Name: ${p.name}\n`;
                response += `City: ${p.city}\n`;
                response += `Skills: ${p.skills.join(', ')}\n`;
                response += `Total Earned: $${p.totalEarnedUSD.toLocaleString()} USD\n\n`;
                response += `📊 *Platforms:*\n`;
                p.platforms.forEach(pl => {
                    response += `• ${pl.name}: ⭐${pl.rating} | $${pl.totalEarned} | ${pl.activeMonths}mo\n`;
                });
                response += `\nESFCA: ${p.esfcaEnabled ? '✅ Enabled' : '❌ Disabled'}`;
                response += `\nKYC: ${p.kycVerified ? '✅ Verified' : '⏳ Pending'}`;
                await message.reply(response);
                await sendVoiceReply(message, response, userId);
            }
            break;
        }

        case 'credit_score': {
            const data = banking.getTransactionDataForScoring(userId);
            if (data) {
                const result = creditScore.calculateCreditScore(data);
                const explanation = responsibleAI.explainCreditScore(result);
                const cs = result.creditScore;
                const loan = result.loanEligibility;

                let response = `📊 *Alternative Credit Score*\n`;
                response += `متبادل کریڈٹ سکور\n\n`;
                response += `${cs.emoji} *${cs.score}* / ${cs.maxScore} (${cs.range})\n\n`;

                response += `📈 *Score Breakdown:*\n`;
                result.components.forEach(c => {
                    const bar = '█'.repeat(Math.round(c.score / 10)) + '░'.repeat(10 - Math.round(c.score / 10));
                    response += `${c.factor}: ${bar} ${c.score}%\n`;
                });

                response += `\n💳 *Loan Eligibility:*\n`;
                response += `${loan.eligible ? '✅' : '❌'} ${loan.eligibleUrdu}\n`;
                if (loan.eligible) {
                    response += `Max Loan: ${loan.maxLoanAmountFormatted}\n`;
                    response += `EMI: PKR ${loan.monthlyEMI.toLocaleString()}/month\n`;
                    response += `Rate: ${loan.interestRate} | ${loan.tenure}\n`;
                    response += `Type: ${loan.type}\n`;
                }

                if (result.recommendations.length > 0) {
                    response += `\n💡 *Tips:*\n`;
                    result.recommendations.forEach(r => {
                        response += `• ${r.tipUrdu}\n`;
                    });
                }

                response += `\n🛡️ _${explanation.dataTransparency.ur}_`;

                // Log AI decision
                responsibleAI.logAIDecision({
                    userId,
                    type: 'credit_score_calculation',
                    input: 'credit_score_request',
                    output: `score_${cs.score}`,
                    dataUsed: ['monthly_earnings', 'platform_ratings', 'transaction_history'],
                    confidence: 0.9,
                    explanation: `Credit score: ${cs.score}/850 based on 7 weighted factors`
                });

                await message.reply(response);
                await sendVoiceReply(message, response, userId);
            }
            break;
        }

        case 'income_proof': {
            const proofData = banking.generateIncomeProof(userId, 6);
            if (proofData.success) {
                const proof = proofData.incomeProof;
                const blockchainResult = await blockchain.generateOnChainIncomeProof(userId);

                let response = `📄 *Blockchain-Verified Income Proof*\n`;
                response += `بلاک چین سے تصدیق شدہ آمدنی کا ثبوت\n\n`;
                response += `👤 ${proof.freelancerName}\n`;
                response += `💳 ${proof.accountNumber}\n`;
                response += `🆔 CNIC: ${proof.cnic}\n`;
                response += `📅 Period: ${proof.period}\n\n`;

                response += `💰 *Earnings:*\n`;
                response += `Total: $${proof.earnings.totalUSD} USD\n`;
                response += `Total: PKR ${proof.earnings.totalPKR.toLocaleString()}\n`;
                response += `Avg Monthly: $${proof.earnings.avgMonthlyUSD}/month\n`;
                response += `Consistency: ${proof.incomeConsistency === 'high' ? '🟢 High' : proof.incomeConsistency === 'medium' ? '🟡 Medium' : '🔴 Low'}\n\n`;

                response += `📊 *Platforms:*\n`;
                proof.platforms.forEach(p => {
                    response += `• ${p.name}: ⭐${p.rating} | ${p.totalEarned} earned\n`;
                });

                response += `\n🏦 SBP Purpose Code: ${proof.sbpPurposeCode}`;

                if (blockchainResult.success) {
                    const mode = blockchainResult.simulated ? ' (demo)' : '';
                    response += `\n\n⛓️ *Blockchain Verified${mode}*`;
                    response += `\n🔗 ${blockchainResult.explorerUrl}`;
                    response += `\n\n_This income proof is immutably recorded on Polygon blockchain and can be independently verified by any bank._`;
                    response += `\n_یہ آمدنی کا ثبوت Polygon بلاک چین پر ناقابل تغیر طور پر ریکارڈ ہے۔_`;
                }

                await message.reply(response);
                await sendVoiceReply(message, response, userId);
            }
            break;
        }

        case 'spending': {
            const result = banking.getSpendingBreakdown(userId);
            if (result.success) {
                let response = `📊 *Spending Analysis*\nاخراجات کا تجزیہ\n\n`;
                response += `Total Spent: PKR ${result.totalSpent.toLocaleString()}\n\n`;
                result.breakdown.forEach(cat => {
                    const bar = '█'.repeat(Math.round(parseFloat(cat.percentage) / 10));
                    response += `${cat.category}: PKR ${cat.total.toLocaleString()} (${cat.percentage}%) ${bar}\n`;
                });
                response += `\n🛡️ _AI analysis based on your transaction history_`;
                await message.reply(response);
                await sendVoiceReply(message, response, userId);
            }
            break;
        }

        case 'rates': {
            const result = banking.getExchangeRates();
            if (result.success) {
                const r = result.rates;
                const reply = `💱 *Exchange Rates (PKR)*\nشرح تبادلہ\n\n` +
                    `🇺🇸 USD → PKR ${r.USD_TO_PKR}\n` +
                    `🇪🇺 EUR → PKR ${r.EUR_TO_PKR}\n` +
                    `🇬🇧 GBP → PKR ${r.GBP_TO_PKR}\n` +
                    `🇦🇪 AED → PKR ${r.AED_TO_PKR}\n\n` +
                    `Updated: ${new Date(result.lastUpdated).toLocaleString()}`;
                await message.reply(reply);
                await sendVoiceReply(message, reply, userId);
            }
            break;
        }

        case 'bias_report': {
            const report = responsibleAI.generateBiasReport();
            const r = report.report;
            let response = `🛡️ *${r.title}*\n${r.titleUrdu}\n\n`;
            response += `Methodology: ${r.methodology}\n\n`;
            r.checks.forEach(check => {
                const icon = check.status === 'PASS' ? '✅' : '⚠️';
                response += `${icon} *${check.factor}*: ${check.status}\n`;
                response += `   ${check.detailUrdu}\n\n`;
            });
            response += `Overall: *${r.overallStatus}* ✅`;
            await message.reply(response);
            break;
        }

        case 'consent': {
            const summary = responsibleAI.getConsentSummary(userId);
            let response = `🔐 *Data Consent Status*\nڈیٹا رضامندی کی حیثیت\n\n`;
            const consents = summary.consents;
            for (const [key, value] of Object.entries(consents)) {
                const icon = value.granted ? '✅' : '❌';
                const desc = value.descriptionUrdu || value.description || key;
                response += `${icon} ${key}: ${desc}\n`;
            }
            response += `\n_You can revoke consent anytime by contacting support._`;
            await message.reply(response);
            break;
        }

        case 'logout': {
            const userSession = userSessions.get(userId);
            userSession.state = STATE.UNAUTHENTICATED;
            userSessions.set(userId, userSession);
            conversationHistory.delete(userId);
            await message.reply(
                '👋 *Logged out successfully*\n' +
                'کامیابی سے لاگ آؤٹ ہو گئے\n\n' +
                '🔐 Send a voice message to login again.'
            );
            break;
        }

        // ============ BANK-SIDE / ADMIN COMMANDS ============

        case 'dashboard': {
            const msg = analytics.formatDashboardMessage();
            await message.reply(msg);
            break;
        }

        case 'business_case': {
            const bc = businessCase.generateBusinessCase();
            const y1 = bc.threeYearProjections[0];
            const y3 = bc.threeYearProjections[2];
            let response = `💼 *SARMAYA BUSINESS CASE*\nسرمایہ بزنس کیس\n`;
            response += `━━━━━━━━━━━━━━━━━━━\n\n`;
            response += `📊 *Market:* ${bc.marketOpportunity.totalAddressableMarket.toLocaleString()} freelancers\n`;
            response += `🎯 *Currently Banked:* ${bc.marketOpportunity.currentlyBanked.toLocaleString()}\n`;
            response += `💡 *Exclusion:* ${bc.marketOpportunity.exclusionRate}\n\n`;
            response += `📈 *3-Year Projection:*\n`;
            response += `Year 1: ${y1.customers.toLocaleString()} customers\n`;
            response += `Year 3: ${y3.customers.toLocaleString()} customers\n\n`;
            response += `📊 *Year 1 Summary:*\n`;
            response += `Revenue: ${bc.year1Summary.totalRevenue}\n`;
            response += `Net Profit: ${bc.year1Summary.netProfit}\n`;
            response += `ROI: ${bc.year1Summary.roi}\n`;
            response += `CAC Payback: ${bc.year1Summary.cacPayback}\n\n`;
            response += `💰 *Per Customer Revenue:*\n`;
            const pcr = businessCase.calculatePerCustomerRevenue();
            response += `Monthly: PKR ${pcr.perCustomer.monthly.total.toLocaleString()}\n`;
            response += `LTV:CAC: ${pcr.ltvToCacRatio}\n\n`;
            response += `🏆 *Competitive Edge:*\n`;
            response += `${bc.competitiveAdvantage.cacReduction}\n`;
            response += `${bc.competitiveAdvantage.nplReduction}\n`;
            response += `${bc.competitiveAdvantage.channelAdvantage}`;
            await message.reply(response);
            break;
        }

        case 'cross_sell': {
            const data = banking.getTransactionDataForScoring(userId);
            if (data) {
                const creditResult = creditScore.calculateCreditScore(data);
                const recs = crossSell.getRecommendations(data, creditResult);
                let response = `🛒 *PRODUCT RECOMMENDATIONS*\nمصنوعات کی سفارشات\n`;
                response += `━━━━━━━━━━━━━━━━━━━\n\n`;
                response += `📊 Credit Score: ${recs.creditScore} | Income: ${recs.avgMonthlyIncome}/month\n`;
                response += `🏷️ Tier: ${recs.bankImpact.customerTier} | Potential: ${recs.bankImpact.crossSellPotential}\n\n`;

                recs.recommendations.slice(0, 5).forEach((rec, i) => {
                    const isShariah = shariahMode.isShariahMode(userId);
                    const name = isShariah ? rec.product.nameUrdu : rec.product.name;
                    response += `${i + 1}. *${name}*\n`;
                    response += `   ${rec.product.description}\n`;
                    response += `   Bank Revenue: ${rec.bankRevenue.formatted}/yr\n`;
                    response += `   ${rec.personalizedPitch.en}\n\n`;
                });

                response += `💰 *Bank Impact:* ${recs.bankImpact.projectedAnnualRevenue}/year from this customer`;
                await message.reply(response);
            }
            break;
        }

        case 'funnel': {
            const funnel = analytics.getAcquisitionFunnel();
            const f = funnel.funnel;
            let response = `📊 *${f.title}*\n`;
            response += `━━━━━━━━━━━━━━━━━━━\n\n`;
            f.stages.forEach(s => {
                response += `${s.stage}: *${s.count.toLocaleString()}*\n`;
                response += `   ${s.description} (→ ${s.conversionToNext})\n\n`;
            });
            response += `📈 Overall Conversion: ${f.overallConversion}\n`;
            response += `💰 CAC: ${f.cac} | LTV: ${f.ltv}\n`;
            response += `🏆 LTV:CAC = ${f.ltvCacRatio}`;
            await message.reply(response);
            break;
        }

        case 'fraud_dashboard': {
            const msg = fraudDetection.formatFraudDashboardMessage();
            await message.reply(msg);
            break;
        }

        case 'compliance': {
            const report = analytics.getSBPComplianceReport();
            const r = report.report;
            let response = `🏛️ *${r.title}*\n`;
            response += `Framework: ${r.framework}\n`;
            response += `Status: ✅ ${r.status}\n\n`;
            r.requirements.forEach(req => {
                response += `✅ *${req.requirement}*\n`;
                response += `   ${req.evidence}\n`;
                response += `   Ref: ${req.sbpReference}\n\n`;
            });
            response += `📊 *NFIS Alignment:*\n`;
            response += `Target: ${r.nfisAlignment.target}\n`;
            response += `Impact: ${r.nfisAlignment.contribution}\n`;
            response += `Gender: ${r.nfisAlignment.genderTarget}`;
            await message.reply(response);
            break;
        }

        case 'shariah_products': {
            const msg = shariahMode.formatShariahMessage();
            await message.reply(msg);
            break;
        }

        case 'shariah_on': {
            const result = shariahMode.setShariaMode(userId, true);
            await message.reply(result.notification + '\n' + result.messageUrdu);
            break;
        }

        case 'shariah_off': {
            const result = shariahMode.setShariaMode(userId, false);
            await message.reply(result.notification);
            break;
        }
    }
}

// ============ HELP MESSAGE ============

async function sendHelpMessage(message, isAuthenticated) {
    let response = `🏦 *Sarmaya - سرمایہ*\n`;
    response += `AI Banking for Pakistani Freelancers\n\n`;

    if (isAuthenticated) {
        response += `🤖 *AI Chat (Urdu/English):*\n`;
        response += `Just type or speak naturally!\n`;
        response += `• "Mera balance kya hai?"\n`;
        response += `• "Show my transactions"\n`;
        response += `• "Transfer 5000 to JSB123456789"\n`;
        response += `• "Pay K-Electric bill 3500"\n`;
        response += `• "Meri income ka proof banao"\n\n`;

        response += `⚡ *Quick Commands:*\n`;
        response += `• *balance* - Check balance\n`;
        response += `• *transactions* - View history\n`;
        response += `• *account* - Account details\n`;
        response += `• *profile* - Freelancer profile\n`;
        response += `• *credit score* - AI credit score\n`;
        response += `• *income proof* - Blockchain verified\n`;
        response += `• *spending* - Spending analysis\n`;
        response += `• *rates* - Exchange rates\n`;
        response += `• *bias report* - AI fairness report\n`;
        response += `• *consent* - Data consent status\n`;
        response += `• *logout* - End session\n\n`;

        response += `📊 *Bank/Admin Commands:*\n`;
        response += `• *dashboard* - Bank analytics dashboard\n`;
        response += `• *business case* - Revenue projections\n`;
        response += `• *recommend* - AI product recommendations\n`;
        response += `• *funnel* - Customer acquisition funnel\n`;
        response += `• *fraud* - Fraud detection dashboard\n`;
        response += `• *compliance* - SBP compliance report\n`;
        response += `• *shariah* - Shariah-compliant products\n`;
        response += `• *shariah on/off* - Toggle Islamic mode\n\n`;

        response += `🎤 *Voice Commands:*\n`;
        response += `Send a voice message in Urdu or English!\n\n`;

        response += `⛓️ Blockchain: ${blockchain.getStatus().mode}\n`;
        response += `🛡️ Responsible AI: Active`;
    } else {
        response += `🆕 *New User:* Send *start* to enroll\n`;
        response += `🔑 *Returning:* Send a voice message\n\n`;
        response += `Features:\n`;
        response += `• 🎤 Voice authentication (Urdu/English)\n`;
        response += `• 🤖 AI-powered conversational banking\n`;
        response += `• ⛓️ Blockchain income verification\n`;
        response += `• 📊 Alternative credit scoring\n`;
        response += `• 🛡️ Responsible AI with full transparency`;
    }

    await message.reply(response);
}

// ============ SESSION CLEANUP ============

setInterval(() => {
    const now = Date.now();
    const timeout = parseInt(process.env.SESSION_TIMEOUT) || 300000;

    for (const [userId, session] of userSessions.entries()) {
        if (now - session.lastActivity > timeout && session.state === STATE.AUTHENTICATED) {
            session.state = STATE.UNAUTHENTICATED;
            conversationHistory.delete(userId);
            console.log(`🔒 Session expired: ${userId}`);
        }
    }
}, 60 * 1000);

// ============ START ============

console.log('');
console.log('🚀 Starting Sarmaya (سرمایہ) - AI Banking for Freelancers...');
console.log('');

// Initialize WhatsApp — wrapped so API server stays alive if WhatsApp fails
client.initialize().catch(err => {
    console.error('⚠️ WhatsApp initialization failed (API server still running):', err.message);
    console.log('📱 WhatsApp bot is offline. Dashboard + API are still functional.');
});
