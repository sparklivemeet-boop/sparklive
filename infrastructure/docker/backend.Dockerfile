# =============================================================================
# SparkLive Backend API - Production Multi-Stage Docker Build
# Express.js 5 + Socket.io 4 + Prisma ORM + PostgreSQL
# =============================================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
LABEL stage=sparklive-backend-deps

# Install build dependencies for native modules (argon2, bcrypt, sharp)
RUN apk add --no-cache libc6-compat python3 make g++ openssl-dev

WORKDIR /app

# Copy package files for layer caching
COPY backend/package.json backend/package-lock.json* ./

# Install ALL dependencies (including devDeps needed for build and prisma)
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
LABEL stage=sparklive-backend-builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY backend/ .

# Copy Prisma schema (needed for generation)
COPY backend/prisma ./prisma

# Generate Prisma client (needs devDependencies)
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
LABEL stage=sparklive-backend-production

# Install runtime dependencies: tini for signal handling, curl for health checks, openssl for Prisma
RUN apk add --no-cache tini curl openssl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Copy production node_modules only
COPY --from=builder /app/node_modules ./node_modules

# Copy public directory for file uploads
COPY --from=builder /app/public ./public

# Switch to non-root user
USER backend

# Expose application port
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Use tini as init for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the Express server
CMD ["node", "dist/index.js"]