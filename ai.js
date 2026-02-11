/**
 * AI Service - GPT-4o Function Calling + Whisper Voice-to-Text
 * Handles natural language banking via OpenAI
 * Supports: Urdu, English, Roman Urdu
 */

import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System prompt for the banking AI
const SYSTEM_PROMPT = `You are "Sarmaya" (سرمایہ), an AI-powered WhatsApp banking assistant for Pakistani freelancers, built by JS Bank.

PERSONALITY:
- Friendly, professional, and culturally aware
- LANGUAGE RULES (STRICT):
  - If the user speaks in ENGLISH → Reply ONLY in English
  - If the user speaks in URDU or ROMAN URDU → Reply in BOTH Urdu and English (bilingual). Write the Urdu line first, then the English translation below it.
- ALWAYS write numbers, amounts, percentages, and dates in English/Western numerals (e.g. PKR 50,000 not ۵۰,۰۰۰). Never use Urdu numerals.
- Keep responses concise (WhatsApp-friendly, under 300 words)
- Use PKR (Pakistani Rupee) as primary currency

CONTEXT:
- You serve Pakistan's 2.3 million freelancers, of whom only 38,000 have bank accounts
- You help with: balance checks, transfers, bill payments, income proof, credit scoring, spending insights
- Freelancers earn via Upwork, Fiverr, Freelancer.com and receive payments in USD converted to PKR
- SBP purpose code for IT services: 9471
- ESFCA (Export Special Foreign Currency Account) allows 50% foreign currency retention

RULES:
- Always use the provided functions for banking operations - NEVER make up financial data
- For transfers and bill payments: execute the function IMMEDIATELY — do NOT ask for confirmation. The user already stated their intent. Just call the function and show the result.
- For large amounts (>PKR 100,000), add a brief warning in the response AFTER executing
- When showing income proof, mention blockchain verification
- Be helpful about financial literacy and freelancer-specific banking needs
- If asked about loans/credit, explain alternative credit scoring based on freelance earnings

FORMATTING:
- Use WhatsApp-compatible formatting: *bold*, _italic_
- Use emojis sparingly but effectively
- Structure responses with clear sections when showing data`;

// Function definitions for GPT-4o function calling
const BANKING_FUNCTIONS = [
    {
        type: 'function',
        function: {
            name: 'check_balance',
            description: 'Check the user\'s current account balance in PKR and USD equivalent',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_transactions',
            description: 'Get recent transaction history showing credits, debits, and freelance payments',
            parameters: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Number of transactions to show (default 5, max 10)'
                    }
                },
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'transfer_money',
            description: 'Transfer money to another account. Amount is in PKR.',
            parameters: {
                type: 'object',
                properties: {
                    to_account: {
                        type: 'string',
                        description: 'Recipient account number (e.g., JSB123456789)'
                    },
                    amount: {
                        type: 'number',
                        description: 'Amount in PKR to transfer'
                    },
                    description: {
                        type: 'string',
                        description: 'Optional description/note for the transfer'
                    }
                },
                required: ['to_account', 'amount']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'pay_bill',
            description: 'Pay a utility bill (electricity, gas, internet, mobile)',
            parameters: {
                type: 'object',
                properties: {
                    bill_type: {
                        type: 'string',
                        description: 'Type of bill (e.g., K-Electric, SSGC, PTCL, Jazz, Telenor, Zong)'
                    },
                    amount: {
                        type: 'number',
                        description: 'Bill amount in PKR'
                    },
                    reference: {
                        type: 'string',
                        description: 'Bill reference number (optional)'
                    }
                },
                required: ['bill_type', 'amount']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_account_details',
            description: 'Get full account details including name, account number, type, and balance',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_freelancer_profile',
            description: 'Get freelancer profile showing platforms, skills, earnings, and ratings',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_income_proof',
            description: 'Generate blockchain-verified income proof document for loan applications or tax filing',
            parameters: {
                type: 'object',
                properties: {
                    months: {
                        type: 'number',
                        description: 'Number of months to include (default 6)'
                    }
                },
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_credit_score',
            description: 'Calculate alternative credit score based on freelance earnings and transaction history',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_spending_breakdown',
            description: 'Get spending analysis broken down by category (bills, food, transfers, etc.)',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_exchange_rates',
            description: 'Get current USD/EUR/GBP/AED to PKR exchange rates',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'receive_freelance_payment',
            description: 'Simulate receiving a freelance payment from a platform like Upwork or Fiverr',
            parameters: {
                type: 'object',
                properties: {
                    amount_usd: {
                        type: 'number',
                        description: 'Payment amount in USD'
                    },
                    platform: {
                        type: 'string',
                        description: 'Platform name (Upwork, Fiverr, Freelancer.com)'
                    },
                    project_name: {
                        type: 'string',
                        description: 'Name/description of the project'
                    }
                },
                required: ['amount_usd', 'platform', 'project_name']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_product_recommendations',
            description: 'Get personalized JS Bank product recommendations based on the freelancer profile and credit score. Shows eligible products like Nano Loan, Visa Card, Takaful, Mutual Funds, etc.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_bank_dashboard',
            description: 'Get the bank analytics dashboard showing customer metrics, revenue, AI performance, blockchain stats, and compliance status. This is the bank admin view.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_business_case',
            description: 'Get the Sarmaya business case with market data, 3-year revenue projections, competitive analysis, and ROI metrics for JS Bank.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_fraud_dashboard',
            description: 'Get the fraud detection dashboard showing alerts, blocked transactions, AML compliance, and model performance metrics.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_shariah_products',
            description: 'Get Shariah-compliant Islamic banking products available — Murabaha financing, Takaful, Sukuk, Wadiah savings etc.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'toggle_shariah_mode',
            description: 'Enable or disable Shariah-compliant banking mode. When enabled, all products use Islamic finance terminology.',
            parameters: {
                type: 'object',
                properties: {
                    enabled: {
                        type: 'boolean',
                        description: 'true to enable Shariah mode, false to disable'
                    }
                },
                required: ['enabled']
            }
        }
    }
];

/**
 * Process a user message through GPT-4o with function calling
 * @param {string} userMessage - The user's text message
 * @param {string} userId - User identifier for banking operations
 * @param {object} bankingModule - The banking module for executing functions
 * @param {object} creditModule - The credit scoring module
 * @param {object} blockchainModule - The blockchain module
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {object} - { response, functionsCalled, transactionsToLog }
 */
export async function processMessage(userMessage, userId, bankingModule, creditModule = null, blockchainModule = null, conversationHistory = [], extraModules = {}) {
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: userMessage }
    ];

    const transactionsToLog = [];

    try {
        let response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
            tools: BANKING_FUNCTIONS,
            tool_choice: 'auto',
            temperature: 0.7,
            max_tokens: 500
        });

        let assistantMessage = response.choices[0].message;
        const functionsCalled = [];

        // Handle function calls (may be multiple in one response)
        while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            messages.push(assistantMessage);

            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                console.log(`🤖 AI calling function: ${functionName}`, args);

                const result = await executeBankingFunction(functionName, args, userId, bankingModule, creditModule, extraModules);
                functionsCalled.push({ name: functionName, args, result });

                // Track transactions that need blockchain logging
                if (result._transaction) {
                    transactionsToLog.push(result._transaction);
                    delete result._transaction;
                }

                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }

            // Get the final response after function execution
            response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: messages,
                tools: BANKING_FUNCTIONS,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: 500
            });

            assistantMessage = response.choices[0].message;
        }

        return {
            response: assistantMessage.content,
            functionsCalled: functionsCalled,
            transactionsToLog: transactionsToLog
        };
    } catch (error) {
        console.error('AI processing error:', error);
        return {
            response: 'I apologize, I encountered an error processing your request. Please try again.',
            functionsCalled: [],
            transactionsToLog: []
        };
    }
}

/**
 * Execute a banking function called by GPT-4o
 */
async function executeBankingFunction(functionName, args, userId, banking, creditModule, extraModules = {}) {
    const { crossSellModule, analyticsModule, businessCaseModule, fraudModule, shariahModule } = extraModules;

    switch (functionName) {
        case 'check_balance':
            return banking.getBalance(userId);

        case 'get_transactions':
            return banking.getTransactionHistory(userId, args.limit || 5);

        case 'transfer_money':
            const transferResult = banking.transferMoney(userId, args.to_account, args.amount, args.description);
            if (transferResult.success) {
                transferResult._transaction = transferResult.transaction;
            }
            return transferResult;

        case 'pay_bill':
            const billResult = banking.payBill(userId, args.bill_type, args.amount, args.reference);
            if (billResult.success) {
                billResult._transaction = billResult.transaction;
            }
            return billResult;

        case 'get_account_details':
            return banking.getAccountDetails(userId);

        case 'get_freelancer_profile':
            return banking.getFreelancerProfile(userId);

        case 'generate_income_proof':
            return banking.generateIncomeProof(userId, args.months || 6);

        case 'get_credit_score':
            if (creditModule) {
                const data = banking.getTransactionDataForScoring(userId);
                if (data) return creditModule.calculateCreditScore(data);
            }
            return { success: false, message: 'Credit scoring not available' };

        case 'get_spending_breakdown':
            return banking.getSpendingBreakdown(userId);

        case 'get_exchange_rates':
            return banking.getExchangeRates();

        case 'receive_freelance_payment':
            const paymentResult = banking.receiveFreelancePayment(
                userId, args.amount_usd, args.platform, args.project_name
            );
            if (paymentResult.success) {
                paymentResult._transaction = paymentResult.transaction;
            }
            return paymentResult;

        // ============ BANK-SIDE FUNCTIONS ============

        case 'get_product_recommendations':
            if (crossSellModule && creditModule) {
                const data = banking.getTransactionDataForScoring(userId);
                if (data) {
                    const creditResult = creditModule.calculateCreditScore(data);
                    return crossSellModule.getRecommendations(data, creditResult);
                }
            }
            return { success: false, message: 'Cross-sell engine not available' };

        case 'get_bank_dashboard':
            if (analyticsModule) return analyticsModule.getDashboard();
            return { success: false, message: 'Analytics not available' };

        case 'get_business_case':
            if (businessCaseModule) return businessCaseModule.generateBusinessCase();
            return { success: false, message: 'Business case engine not available' };

        case 'get_fraud_dashboard':
            if (fraudModule) return fraudModule.getFraudDashboard();
            return { success: false, message: 'Fraud detection not available' };

        case 'get_shariah_products':
            if (shariahModule) return shariahModule.getShariahProducts();
            return { success: false, message: 'Shariah module not available' };

        case 'toggle_shariah_mode':
            if (shariahModule) return shariahModule.setShariaMode(userId, args.enabled);
            return { success: false, message: 'Shariah module not available' };

        default:
            return { success: false, message: `Unknown function: ${functionName}` };
    }
}

/**
 * Transcribe voice message using OpenAI Whisper
 * Supports Urdu, English, and auto-detection
 * @param {string} audioPath - Path to audio file (WAV format)
 * @param {string} language - Language hint ('ur' for Urdu, 'en' for English, or null for auto)
 * @returns {object} - { text, language, duration }
 */
export async function transcribeVoice(audioPath, language = null) {
    try {
        // Verify the file exists and has content
        if (!fs.existsSync(audioPath)) {
            console.error(`Whisper: File not found: ${audioPath}`);
            return { success: false, error: 'Audio file not found' };
        }
        const stats = fs.statSync(audioPath);
        console.log(`🎤 Whisper: Transcribing ${audioPath} (${stats.size} bytes)`);

        if (stats.size < 100) {
            return { success: false, error: 'Audio file too small' };
        }

        const params = {
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
            response_format: 'verbose_json'
        };
        if (language) params.language = language; // Only set if specified, omit for auto-detect

        const transcription = await openai.audio.transcriptions.create(params);

        console.log(`🗣️  Whisper result: "${transcription.text}" (${transcription.language})`);

        return {
            success: true,
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration
        };
    } catch (error) {
        console.error('Whisper transcription error:', error.message || error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Convert text to speech using OpenAI TTS
 * Returns path to generated audio file
 */
export async function textToSpeech(text, filename = 'response') {
    try {
        // Strip emojis and markdown for cleaner speech
        const cleanText = text
            .replace(/[*_~`]/g, '')
            .replace(/\n{2,}/g, '. ')
            .replace(/\n/g, '. ')
            .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
            .trim();

        if (!cleanText || cleanText.length < 2) {
            return { success: false, error: 'Text too short for TTS' };
        }

        // Limit to ~500 chars for reasonable voice note length
        const trimmedText = cleanText.length > 500 ? cleanText.slice(0, 497) + '...' : cleanText;

        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',  // Good for multilingual (Urdu + English)
            input: trimmedText,
            response_format: 'opus',
        });

        const audioDir = './temp_audio';
        if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

        const outputPath = `${audioDir}/${filename}_tts.opus`;
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputPath, buffer);

        return { success: true, path: outputPath };
    } catch (error) {
        console.error('TTS error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Detect language and intent from text
 */
export async function detectLanguageAndIntent(text) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Detect the language and banking intent from the text. Return JSON: {"language": "ur|en|roman_urdu", "intent": "balance|transfer|transactions|bill_payment|income_proof|credit_score|spending|help|greeting|other", "confidence": 0.0-1.0}'
                },
                { role: 'user', content: text }
            ],
            response_format: { type: 'json_object' },
            temperature: 0
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return { language: 'en', intent: 'other', confidence: 0 };
    }
}
