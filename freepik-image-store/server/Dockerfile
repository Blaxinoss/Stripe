FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    redis \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Verify Chromium installation
RUN which chromium || (echo "Chromium not found at /usr/bin/chromium" && exit 1)
RUN chromium --version

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm ci --verbose

# Copy app source code
COPY . .

# Switch to non-root user
USER appuser

# Expose app port
EXPOSE 5000

# Start the app
CMD ["node", "main.js"]
