FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install --verbose

# Copy app source code
COPY . .

# Expose app port
EXPOSE 5000

# Start the app
CMD ["node", "main.js"]
