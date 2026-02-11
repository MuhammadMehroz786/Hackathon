/**
 * Blockchain Service - Polygon Amoy Integration
 * Logs freelancer transactions on-chain for income verification
 * Uses ethers.js v6 with Alchemy RPC
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
    "function logTransaction(string calldata freelancerId, bytes32 dataHash, uint256 amountPKR, string calldata txType, string calldata category) external",
    "function generateIncomeProof(string calldata freelancerId) external",
    "function verifyTransaction(string calldata freelancerId, bytes32 dataHash) external view returns (bool exists, uint256 timestamp)",
    "function getTransactionCount(string calldata freelancerId) external view returns (uint256)",
    "function getTotalIncome(string calldata freelancerId) external view returns (uint256)",
    "event TransactionLogged(string indexed freelancerId, bytes32 dataHash, uint256 amountPKR, string txType, string category, uint256 timestamp)",
    "event IncomeProofGenerated(string indexed freelancerId, uint256 totalIncome, uint256 transactionCount, uint256 timestamp)"
];

// Polygon Amoy testnet config
const AMOY_CONFIG = {
    chainId: 80002,
    rpcUrl: process.env.ALCHEMY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/demo',
    explorerUrl: 'https://amoy.polygonscan.com',
    name: 'Polygon Amoy Testnet'
};

let provider = null;
let wallet = null;
let contract = null;
let isInitialized = false;

/**
 * Initialize the blockchain connection
 */
export function initialize() {
    try {
        const rpcUrl = process.env.ALCHEMY_RPC_URL;
        const privateKey = process.env.WALLET_PRIVATE_KEY;
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (!rpcUrl || !privateKey || !contractAddress) {
            console.log('⚠️  Blockchain: Missing config (ALCHEMY_RPC_URL, WALLET_PRIVATE_KEY, or CONTRACT_ADDRESS)');
            console.log('   Blockchain logging will run in SIMULATION mode');
            isInitialized = false;
            return false;
        }

        provider = new ethers.JsonRpcProvider(rpcUrl);
        wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
        isInitialized = true;

        console.log('✅ Blockchain: Connected to Polygon Amoy');
        console.log(`   Contract: ${contractAddress}`);
        console.log(`   Wallet: ${wallet.address}`);
        return true;
    } catch (error) {
        console.error('❌ Blockchain init error:', error.message);
        isInitialized = false;
        return false;
    }
}

/**
 * Log a transaction on-chain
 * @param {string} freelancerId - Unique freelancer identifier
 * @param {object} transaction - Transaction data from banking module
 * @returns {object} - { success, txHash, explorerUrl, blockNumber }
 */
export async function logTransaction(freelancerId, transaction) {
    // Create hash of transaction data
    const dataToHash = JSON.stringify({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        timestamp: transaction.timestamp,
        description: transaction.description,
        category: transaction.category
    });

    const dataHash = '0x' + crypto.createHash('sha256').update(dataToHash).digest('hex');
    const amountPKR = Math.round(transaction.amount);

    // If blockchain is not initialized, return simulation result
    if (!isInitialized) {
        const simulatedHash = '0x' + crypto.randomBytes(32).toString('hex');
        return {
            success: true,
            simulated: true,
            txHash: simulatedHash,
            explorerUrl: `${AMOY_CONFIG.explorerUrl}/tx/${simulatedHash}`,
            dataHash: dataHash,
            amountPKR: amountPKR,
            message: 'Transaction logged (simulation mode)'
        };
    }

    try {
        const tx = await contract.logTransaction(
            freelancerId,
            dataHash,
            amountPKR,
            transaction.type,
            transaction.category || 'other'
        );

        console.log(`⛓️  Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Confirmed in block ${receipt.blockNumber}`);

        return {
            success: true,
            simulated: false,
            txHash: receipt.hash,
            explorerUrl: `${AMOY_CONFIG.explorerUrl}/tx/${receipt.hash}`,
            blockNumber: receipt.blockNumber,
            dataHash: dataHash,
            amountPKR: amountPKR,
            gasUsed: receipt.gasUsed.toString()
        };
    } catch (error) {
        console.error('Blockchain log error:', error.message);
        // Fallback to simulation on error
        const simulatedHash = '0x' + crypto.randomBytes(32).toString('hex');
        return {
            success: true,
            simulated: true,
            txHash: simulatedHash,
            explorerUrl: `${AMOY_CONFIG.explorerUrl}/tx/${simulatedHash}`,
            dataHash: dataHash,
            error: error.message,
            message: 'Logged in simulation mode due to network error'
        };
    }
}

/**
 * Generate on-chain income proof for loan applications
 * @param {string} freelancerId - Unique freelancer identifier
 * @returns {object} - { success, txHash, explorerUrl }
 */
export async function generateOnChainIncomeProof(freelancerId) {
    if (!isInitialized) {
        const simulatedHash = '0x' + crypto.randomBytes(32).toString('hex');
        return {
            success: true,
            simulated: true,
            txHash: simulatedHash,
            explorerUrl: `${AMOY_CONFIG.explorerUrl}/tx/${simulatedHash}`,
            message: 'Income proof generated (simulation mode)'
        };
    }

    try {
        const tx = await contract.generateIncomeProof(freelancerId);
        const receipt = await tx.wait();

        return {
            success: true,
            simulated: false,
            txHash: receipt.hash,
            explorerUrl: `${AMOY_CONFIG.explorerUrl}/tx/${receipt.hash}`,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Income proof error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Verify a transaction exists on-chain
 * @param {string} freelancerId - Freelancer identifier
 * @param {object} transaction - Original transaction data to verify
 * @returns {object} - { exists, timestamp }
 */
export async function verifyTransaction(freelancerId, transaction) {
    const dataToHash = JSON.stringify({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        timestamp: transaction.timestamp,
        description: transaction.description,
        category: transaction.category
    });

    const dataHash = '0x' + crypto.createHash('sha256').update(dataToHash).digest('hex');

    if (!isInitialized) {
        return {
            success: true,
            simulated: true,
            exists: true,
            dataHash: dataHash,
            message: 'Verification simulated'
        };
    }

    try {
        const [exists, timestamp] = await contract.verifyTransaction(freelancerId, dataHash);
        return {
            success: true,
            exists: exists,
            timestamp: exists ? new Date(Number(timestamp) * 1000).toISOString() : null,
            dataHash: dataHash
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get blockchain stats for a freelancer
 */
export async function getFreelancerBlockchainStats(freelancerId) {
    if (!isInitialized) {
        return {
            success: true,
            simulated: true,
            transactionCount: Math.floor(Math.random() * 20) + 5,
            totalIncomePKR: Math.floor(Math.random() * 2000000) + 500000,
            network: AMOY_CONFIG.name,
            contractAddress: process.env.CONTRACT_ADDRESS || 'simulation-mode'
        };
    }

    try {
        const count = await contract.getTransactionCount(freelancerId);
        const income = await contract.getTotalIncome(freelancerId);

        return {
            success: true,
            simulated: false,
            transactionCount: Number(count),
            totalIncomePKR: Number(income),
            network: AMOY_CONFIG.name,
            contractAddress: process.env.CONTRACT_ADDRESS
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(txHash) {
    return `${AMOY_CONFIG.explorerUrl}/tx/${txHash}`;
}

/**
 * Check if blockchain is in live or simulation mode
 */
export function getStatus() {
    return {
        initialized: isInitialized,
        mode: isInitialized ? 'LIVE (Polygon Amoy)' : 'SIMULATION',
        network: AMOY_CONFIG.name,
        explorerUrl: AMOY_CONFIG.explorerUrl
    };
}
