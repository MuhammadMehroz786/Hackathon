/**
 * Utility functions for Sarmaya WhatsApp AI Banking
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const TEMP_AUDIO_DIR = './temp_audio';
if (!fs.existsSync(TEMP_AUDIO_DIR)) {
    fs.mkdirSync(TEMP_AUDIO_DIR, { recursive: true });
}

/**
 * Convert audio to WAV format (required for Resemblyzer + Whisper)
 */
export async function convertToWav(inputPath, outputPath) {
    try {
        try {
            await execAsync('which ffmpeg');
        } catch (e) {
            console.log('FFmpeg not found, copying audio as-is...');
            fs.copyFileSync(inputPath, outputPath);
            return outputPath;
        }

        const command = `ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -y "${outputPath}"`;
        await execAsync(command);
        return outputPath;
    } catch (error) {
        console.error('Audio conversion error:', error);
        throw error;
    }
}

/**
 * Call Python voice authentication script
 */
export async function callVoiceAuth(command, args = []) {
    try {
        const pythonArgs = [command, ...args].map(arg => `"${arg}"`).join(' ');
        const cmd = `python3 voiceAuth.py ${pythonArgs}`;

        const { stdout, stderr } = await execAsync(cmd);

        if (stderr && !stderr.includes('UserWarning')) {
            console.error('Python stderr:', stderr);
        }

        // Extract only the JSON line — Resemblyzer may print extra text to stdout
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.reverse().find(line => line.trim().startsWith('{'));
        if (!jsonLine) {
            throw new Error(`No JSON in Python output: ${stdout.trim()}`);
        }
        const result = JSON.parse(jsonLine.trim());
        return result;
    } catch (error) {
        console.error('Voice auth error:', error);
        return {
            success: false,
            error: error.message || 'Voice authentication failed'
        };
    }
}

/**
 * Save voice message from WhatsApp
 * Returns { wavPath, oggPath } — WAV for Resemblyzer, OGG for Whisper
 */
export async function saveVoiceMessage(message, filename) {
    try {
        const audioData = await message.downloadMedia();

        if (!audioData) {
            throw new Error('Failed to download audio data');
        }

        const buffer = Buffer.from(audioData.data, 'base64');
        const oggPath = path.join(TEMP_AUDIO_DIR, `${filename}.ogg`);
        const wavPath = path.join(TEMP_AUDIO_DIR, `${filename}.wav`);

        fs.writeFileSync(oggPath, buffer);
        console.log(`📁 Saved OGG: ${oggPath} (${buffer.length} bytes)`);

        await convertToWav(oggPath, wavPath);
        console.log(`📁 Converted WAV: ${wavPath}`);

        return { wavPath, oggPath };
    } catch (error) {
        console.error('Error saving voice message:', error);
        throw error;
    }
}

/**
 * Clean up old audio files
 */
export function cleanupAudioFiles(olderThanMinutes = 30) {
    try {
        const files = fs.readdirSync(TEMP_AUDIO_DIR);
        const now = Date.now();
        const threshold = olderThanMinutes * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(TEMP_AUDIO_DIR, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtimeMs > threshold) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up: ${file}`);
            }
        });
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

/**
 * Format currency (PKR as default)
 */
export function formatCurrency(amount, currency = 'PKR') {
    if (currency === 'PKR') {
        return `PKR ${Math.round(amount).toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format transaction for display
 */
export function formatTransaction(txn) {
    const icon = txn.type === 'CREDIT' ? '💚' : '🔴';
    const sign = txn.type === 'CREDIT' ? '+' : '-';
    const amount = formatCurrency(txn.amount, txn.currency);
    const usdInfo = txn.amountUSD ? ` ($${txn.amountUSD})` : '';
    const date = new Date(txn.timestamp).toLocaleDateString();
    const chain = txn.blockchainHash ? ' ⛓️' : '';

    return `${icon} ${sign}${amount}${usdInfo}\n${txn.description}\n${date}${chain}`;
}

/**
 * Generate unique user ID from phone number
 */
export function getUserId(phoneNumber) {
    return phoneNumber.replace(/[^0-9]/g, '');
}

/**
 * Sleep utility
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
