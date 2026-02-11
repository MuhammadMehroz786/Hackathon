# WhatsApp Voice Banking Chatbot 🏦🎤

A secure WhatsApp chatbot with voice authentication for banking operations using Resemblyzer voice biometrics.

## Features

- ✅ **Voice Authentication**: Secure voice-based user verification
- 🏦 **Mock Banking**: Balance check, transactions, transfers
- 📱 **WhatsApp Integration**: Connect via QR code
- 🔐 **Session Management**: Auto-logout for security
- 🎯 **Lightweight**: Runs locally on your laptop

## Tech Stack

- **WhatsApp**: whatsapp-web.js
- **Voice Auth**: Resemblyzer (Python)
- **Backend**: Node.js
- **Banking**: Mock system with in-memory database

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip3 install -r requirements.txt
```

### 2. Run the Bot

```bash
npm start
```

### 3. Connect WhatsApp

1. Scan the QR code that appears in terminal
2. Open WhatsApp → Linked Devices → Link a Device
3. Wait for "WhatsApp Voice Banking Bot is ready!" message

## How to Use

### First Time Users (Enrollment)

1. Send message: `start` or `hi`
2. Bot will ask for 3 voice samples
3. Record 3 different phrases (3-5 seconds each):
   - "My voice is my password"
   - "Verify my identity for banking"
   - "Access my account securely"
4. Voice profile created! ✅

### Returning Users (Authentication)

1. Send a **voice message** (any phrase, 3-5 seconds)
2. Bot verifies your voice
3. If verified → Access granted to banking features

### Banking Commands

Once authenticated, you can:

- `balance` - Check your account balance
- `transactions` - View recent transactions
- `account` - View account details
- `transfer ACC123456789 100` - Transfer money
- `help` - Show all commands
- `logout` - End your session

## Project Structure

```
whatsapp-voice-banking/
├── index.js              # Main WhatsApp bot
├── voiceAuth.py          # Resemblyzer voice authentication
├── banking.js            # Mock banking system
├── utils.js              # Utility functions
├── package.json          # Node.js dependencies
├── requirements.txt      # Python dependencies
├── .env                  # Configuration
├── voice_profiles/       # Stored voice profiles (created on first run)
└── temp_audio/          # Temporary audio files (created on first run)
```

## System Requirements

- **Node.js**: v16+ (you have v22.22.0 ✅)
- **Python**: 3.8+ (you have 3.11.6 ✅)
- **RAM**: 4GB+
- **Disk**: 500MB free space

## Voice Authentication Details

- **Model**: Resemblyzer (17 MB, lightweight)
- **Threshold**: 75% similarity (configurable in .env)
- **Enrollment**: 3 voice samples required
- **Verification**: Real-time speaker verification
- **Storage**: Voice embeddings stored locally

## Security Features

- ✅ Voice biometric authentication
- ✅ Session timeout (5 minutes)
- ✅ No password storage
- ✅ Local voice profile storage
- ✅ Transaction verification

## Troubleshooting

### Audio conversion issues
If you get audio errors, install ffmpeg:
```bash
brew install ffmpeg  # macOS
```

### Python module not found
```bash
pip3 install --upgrade -r requirements.txt
```

### QR code not appearing
Make sure no other WhatsApp Web session is active on this number.

## Demo Flow

1. User sends "start" → Enrollment begins
2. User sends 3 voice messages → Voice profile created
3. User sends voice message → Voice verified
4. User types "balance" → See account balance
5. User types "transactions" → View history
6. User types "transfer ACC123456789 100" → Transfer money

## Configuration

Edit `.env` to customize:

- `VOICE_THRESHOLD`: Similarity threshold (0.0-1.0, default 0.75)
- `SESSION_TIMEOUT`: Auto-logout time in ms (default 300000 = 5 min)

## Notes

- This is a **mock banking system** for demonstration
- Voice profiles are stored locally in `voice_profiles/`
- Audio files are auto-cleaned after 30 minutes
- Sessions expire after 5 minutes of inactivity

## Commands Reference

| Command | Description |
|---------|-------------|
| `start` | Start enrollment or login |
| `balance` | Check account balance |
| `transactions` | View transaction history |
| `account` | View account details |
| `transfer <acc> <amt>` | Transfer money |
| `help` | Show help message |
| `reset` | Reset enrollment session |
| `logout` | End authenticated session |

## Hackathon Tips

- Demo the voice enrollment first
- Show the similarity score during verification
- Demonstrate failed authentication (different voice)
- Show banking operations after successful auth
- Highlight the lightweight nature (runs on laptop!)

---

Built with ❤️ for Hackathon 2026
