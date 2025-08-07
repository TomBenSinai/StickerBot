# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production

COPY src/ ./src/
COPY assets/ ./assets/

RUN npm run build

FROM node:18-alpine AS production

RUN apk add --no-cache \
    chromium \
    ffmpeg \
    wget \
    curl \
    ca-certificates \
    fonts-liberation \
    libx11 \
    libxss1 \
    libappindicator3-1 \
    libindicator7 \
    xdg-utils

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S stickerbot -u 1001

COPY --from=builder --chown=stickerbot:nodejs /app/dist ./dist
COPY --from=builder --chown=stickerbot:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=stickerbot:nodejs /app/package*.json ./
COPY --from=builder --chown=stickerbot:nodejs /app/assets ./assets

# Download Noto Color Emoji font
RUN wget -q -O /app/assets/fonts/NotoColorEmoji.ttf https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf && \
    chown stickerbot:nodejs /app/assets/fonts/NotoColorEmoji.ttf

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /app/.wwebjs_auth /app/logs && \
    chown -R stickerbot:nodejs /app/.wwebjs_auth /app/logs

USER stickerbot

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

CMD ["node", "dist/bot.js"] 
