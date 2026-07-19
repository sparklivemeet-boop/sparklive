# =============================================================================
# SparkLive Background Worker - Production Multi-Stage Docker Build
# Handles async jobs: notifications, emails, media processing, payments
# =============================================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
LABEL stage=sparklive-worker-deps

RUN apk add --no-cache libc6-compat python3 make g++ openssl-dev

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
LABEL stage=sparklive-worker-builder

WORKDIR /app

RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
COPY backend/prisma ./prisma
RUN npx prisma generate
RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
LABEL stage=sparklive-worker-production

RUN apk add --no-cache tini curl openssl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

ENV NODE_ENV=production
ENV WORKER_TYPE=default

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER worker

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

ENTRYPOINT ["tini", "--"]

# Workers use a custom entrypoint script to handle different worker types
CMD ["node", "dist/workers/index.js"]