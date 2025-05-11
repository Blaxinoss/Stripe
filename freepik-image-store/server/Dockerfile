FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
RUN apk add  \
chromium \
nss \
freetype \
harfbuzz \
ca-certificates \
ttf-freefont \
redis
# Dockerfile
COPY . .
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 5000
CMD ["node", "main.js"]

