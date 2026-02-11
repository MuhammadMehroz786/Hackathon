# 🚀 Quick Start Guide - 2 Hour Hackathon

## ✅ Setup Complete!

All dependencies are installed and ready to go!

## 🏃 Run the Bot (1 Minute)

```bash
npm start
```

## 📱 Connect WhatsApp (30 Seconds)

1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to: **Settings → Linked Devices → Link a Device**
4. Scan the QR code
5. Wait for "✅ WhatsApp Voice Banking Bot is ready!"

## 🎯 Demo Flow (Perfect for Hackathon Presentation)

### Step 1: Enrollment (Show Voice Registration)
1. **Send message to bot:** `start`
2. **Bot response:** Asks for 3 voice samples
3. **Record 3 voice messages** (3-5 seconds each):
   - "My voice is my password"
   - "Verify my identity for banking"
   - "Access my account securely"
4. **Bot creates voice profile** ✅

### Step 2: Authentication (Show Voice Verification)
1. **Send a voice message** (any phrase)
2. **Bot verifies your voice**
3. **Shows similarity score** (e.g., 87.3% match)
4. **Grants access** if verified ✅

### Step 3: Banking Operations (Show Features)
1. Type: `balance` → See account balance
2. Type: `transactions` → View transaction history
3. Type: `account` → See account details
4. Type: `transfer ACC123456789 100` → Transfer money

### Step 4: Security Demo (Show Voice Protection)
1. **Have someone else send a voice message**
2. **Bot rejects** - similarity too low ❌
3. **Shows security in action** 🔐

## 💡 Hackathon Tips

### What to Highlight:
1. ✅ **Local voice AI** - Runs on laptop (no cloud API needed)
2. ✅ **Lightweight** - Only 17 MB model
3. ✅ **Secure** - Voice biometric authentication
4. ✅ **Real WhatsApp** - Not a simulator
5. ✅ **Banking features** - Complete mock system

### Demo Script (2 Minutes):
```
"This is a WhatsApp banking bot with voice authentication.

Instead of passwords, users authenticate using their voice.

Let me show you:
1. [Enroll with 3 voice samples]
2. [Authenticate with voice message - shows 87% match]
3. [Check balance, view transactions]
4. [Have friend try - gets rejected]

The voice AI runs locally using Resemblyzer - only 17 MB!
Perfect for secure banking on WhatsApp."
```

## 🎤 Voice Commands Reference

| Action | What to Say/Type |
|--------|------------------|
| **Start enrollment** | "start" or "hi" (text) |
| **Authenticate** | Send any voice message |
| **Check balance** | "balance" (text after auth) |
| **View transactions** | "transactions" (text) |
| **Transfer money** | "transfer ACC123456789 100" |
| **Get help** | "help" |

## 🔧 Troubleshooting

### Bot not receiving messages?
- Make sure you scanned the QR code successfully
- Check terminal for "WhatsApp Voice Banking Bot is ready!"

### Voice not recognized?
- Speak clearly for 3-5 seconds
- Make sure it's actually a voice message (not audio file)
- Check similarity threshold in .env (default: 0.75)

### Audio errors?
- FFmpeg is installed ✅
- If issues persist, voice messages might be in unsupported format

## 📊 Project Stats (Good for Presentation)

- **Lines of code:** ~600
- **Technologies:** Node.js, Python, Resemblyzer, WhatsApp Web
- **Model size:** 17 MB (lightweight!)
- **Setup time:** 5 minutes
- **Build time:** 2 hours

## 🏆 Key Achievements

✅ Voice biometric authentication
✅ Real WhatsApp integration
✅ Mock banking system
✅ Session management
✅ Runs completely locally
✅ Production-ready architecture

---

**Good luck with your hackathon! 🚀**
