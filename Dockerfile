# Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

# Build deps for node-canvas on Alpine
RUN apk add --no-cache \
    build-base \
    python3 \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY src ./src
COPY assets ./assets
RUN npm ci && npm run build

# Build admin panel
FROM node:18-alpine AS admin-builder
WORKDIR /admin
COPY admin-panel/package*.json ./
RUN npm ci
COPY admin-panel ./
RUN npm run build

# Runtime image
FROM node:18-alpine AS runtime

# OS deps (chromium, ffmpeg, fonts)
RUN apk add --no-cache \
    chromium \
    ffmpeg \
    wget \
    curl \
    ca-certificates \
    ttf-dejavu \
    ttf-liberation \
    # Runtime deps for node-canvas
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S stickerbot -u 1001

# Copy backend build and deps
COPY --from=backend-builder --chown=stickerbot:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=stickerbot:nodejs /app/package*.json ./
COPY --from=backend-builder --chown=stickerbot:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=stickerbot:nodejs /app/assets ./assets

# Copy admin build to /app/public
COPY --from=admin-builder --chown=stickerbot:nodejs /admin/dist ./public

# Emoji font
RUN wget -q -O /app/assets/fonts/NotoColorEmoji.ttf https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf || true && \
    chown stickerbot:nodejs /app/assets/fonts/NotoColorEmoji.ttf || true

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

RUN mkdir -p /app/.wwebjs_auth /app/logs && \
    chown -R stickerbot:nodejs /app/.wwebjs_auth /app/logs

# Declare volume for auth to persist and allow deletion via reset endpoint
VOLUME ["/app/.wwebjs_auth"]

USER stickerbot
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

CMD ["node", "dist/bot.js"] 
