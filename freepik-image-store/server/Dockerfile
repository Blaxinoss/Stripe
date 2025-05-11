FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --verbose
#Triget
# Install Chromium, wget, and required dependencies
RUN apk update && apk add --no-cache \
    chromium \
    wget \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    xdg-utils \
    redis \
    bash \
    dumb-init \
    libgomp \
    libx11 \
    libxcomposite \
    libxrandr \
    libxtst \
    alsa-lib

# Copy the rest of the application
COPY . .

# Set Puppeteer executable path to Chromium binary
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "main.js"]
