#!/bin/bash

echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo "║  سرمایہ  Sarmaya - AI Banking for Freelancers   ║"
echo "║  🏦 WhatsApp | 🤖 GPT-4o | ⛓️  Blockchain       ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Run tests first
echo "🧪 Running component tests..."
node test.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tests failed! Check errors above."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting Sarmaya..."
echo "⏳ WhatsApp Web initializing (~30 seconds)..."
echo "📱 QR code will appear - scan with WhatsApp!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
