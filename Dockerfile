FROM node:22-bookworm-slim

# Install Chromium, Python3, pip, build tools, and audio tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium

WORKDIR /app

# Install Python dependencies (CPU-only torch to save ~4GB)
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy dashboard and install its deps + build
COPY sarmaya-dashboard/package.json sarmaya-dashboard/package-lock.json ./sarmaya-dashboard/
RUN cd sarmaya-dashboard && npm ci
COPY sarmaya-dashboard/ ./sarmaya-dashboard/
RUN cd sarmaya-dashboard && npm run build

# Copy all source files
COPY . .

# Create directories for voice and audio
RUN mkdir -p voice_profiles temp_audio

# Expose port (Railway sets PORT env var)
ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
