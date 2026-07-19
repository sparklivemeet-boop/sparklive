# =============================================================================
# SparkLive Frontend - Production Multi-Stage Docker Build
# Next.js 16 with Standalone Output, TypeScript, Tailwind CSS
# =============================================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
LABEL stage=sparklive-frontend-deps

# Install necessary build tools for native modules (sharp, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files for layer caching
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* frontend/pnpm-lock.yaml* ./

# Install dependencies (including devDeps for build)
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
LABEL stage=sparklive-frontend-builder

WORKDIR /app

# Copy deps from stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.sparklive.app}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL:-wss://api.sparklive.app}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-https://sparklive.app}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application with standalone output
RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
LABEL stage=sparklive-frontend-production

# Install tini for proper signal handling and curl for health checks
RUN apk add --no-cache tini curl

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder (includes only production dependencies)
COPY --from=builder /app/public ./public

# Copy standalone output - preserves only what's needed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Use tini as init for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start Next.js standalone server
CMD ["node", "server.js"]