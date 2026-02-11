#!/bin/bash

echo "🚀 Setting up Sarmaya (سرمایہ) - AI Banking for Freelancers..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python3 first."
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi
echo "✅ Node.js dependencies installed"

# Install Python dependencies
echo ""
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    echo "💡 Try: pip3 install --user -r requirements.txt"
    exit 1
fi
echo "✅ Python dependencies installed"

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p voice_profiles temp_audio contracts scripts

echo "✅ Directories created"

# Check ffmpeg
echo ""
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg found"
else
    echo "⚠️  FFmpeg not found - install with: brew install ffmpeg"
fi

# Check .env
echo ""
if [ -f .env ]; then
    if grep -q "your_openai_api_key_here" .env; then
        echo "⚠️  OpenAI API key not set in .env"
        echo "   Get one at: https://platform.openai.com/api-keys"
    else
        echo "✅ OpenAI API key configured"
    fi
else
    echo "⚠️  .env file not found"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                              ║"
echo "║                                                  ║"
echo "║  Next steps:                                     ║"
echo "║  1. Add OPENAI_API_KEY to .env                  ║"
echo "║  2. Run: npm test (verify components)            ║"
echo "║  3. Run: npm start (launch bot)                  ║"
echo "║                                                  ║"
echo "║  Optional (Blockchain):                          ║"
echo "║  4. Add ALCHEMY_RPC_URL to .env                 ║"
echo "║  5. Add WALLET_PRIVATE_KEY to .env              ║"
echo "║  6. Deploy: npm run deploy-contract              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
