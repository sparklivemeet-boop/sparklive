import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import compression from 'compression';
import { Server } from 'socket.io';
import { prisma } from './prisma';
import { initializeSecurity, config, rateLimiter, botProtection, auditLog } from './security';
import { authenticateSocket, handleConnect, handleDisconnect } from './security';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import settingsRoutes from './routes/settings.routes';
import walletRoutes from './routes/wallet.routes';
import welcomeRewardRoutes from './routes/welcome-reward.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import liveRoutes from './routes/live.routes';
import giftRoutes from './routes/gift.routes';
import adminRoutes from './routes/admin.routes';
import monetizationRoutes from './routes/monetization.routes';
import storyRoutes from './routes/story.routes';
import feedRoutes from './routes/feed.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import communityRoutes from './routes/community.routes';
import channelRoutes from './routes/channel.routes';
import groupRoutes from './routes/group.routes';
import complianceRoutes from './routes/compliance.routes';
import { aiRouter, registerAISocketHandlers } from './ai';
import { analyticsRouter, registerAnalyticsSocketHandlers, analyticsEngine } from './analytics';
import { handleChatSocket } from './sockets/chat.socket';
import { handleLiveSocket } from './sockets/live.socket';
import { handleGiftSocket } from './sockets/gift.socket';
import { setNotificationIO } from './services/notification.service';
import { apiLatencyMiddleware, healthStatus, metricsCollector, cacheService, setupDefaultAlerts } from './services';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

// ============================================================================
// ENTERPRISE SECURITY MIDDLEWARE
// ============================================================================

// Security headers with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: config.csp.defaultSrc,
      scriptSrc: config.csp.scriptSrc,
      styleSrc: config.csp.styleSrc,
      imgSrc: config.csp.imgSrc,
      connectSrc: config.csp.connectSrc,
      fontSrc: config.csp.fontSrc,
      frameSrc: config.csp.frameSrc,
      mediaSrc: config.csp.mediaSrc,
      workerSrc: config.csp.workerSrc,
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: config.hsts.maxAge,
    includeSubDomains: config.hsts.includeSubDomains,
    preload: config.hsts.preload,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  ieNoOpen: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// CORS with strict origin validation
const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, '');
const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL || 'http://localhost:3000');
const electronOrigin = normalizeOrigin(process.env.ELECTRON_URL || 'app://.');
const allowedOrigins = [...config.cors.allowedOrigins, frontendOrigin, electronOrigin, 'http://127.0.0.1:3000'];

const isAllowedLocalOrigin = (origin: string): boolean => {
  try {
    const normalizedOrigin = normalizeOrigin(origin);
    const url = new URL(normalizedOrigin);
    const hostname = url.hostname.toLowerCase();
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    const localHostnames = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
    if (localHostnames.includes(hostname) && port === '3000') return true;
    if (/^172\./.test(hostname) && port === '3000') return true;
    return false;
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : undefined;
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.startsWith('app://') || (normalizedOrigin && isAllowedLocalOrigin(normalizedOrigin))) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: config.cors.credentials,
  maxAge: config.cors.maxAge,
}));

// Performance optimization: Response compression
app.use(compression({
  level: 6, // Balanced compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    // Don't compress SSE or WebSocket upgrades
    if (req.headers['accept'] === 'text/event-stream') return false;
    if (req.headers['upgrade'] === 'websocket') return false;
    // Use default compression filter
    return compression.filter(req, res);
  },
}));

// Request parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Latency tracking (performance monitoring)
app.use(apiLatencyMiddleware);

// Global bot protection middleware (non-blocking, marks requests)
app.use(botProtection.middleware);

// Global rate limiting for API
app.use('/api', rateLimiter.api);

// Serve public directory (favicon, etc.)
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir, {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  },
}));

// ============================================================================
// API ROUTES
// ============================================================================

// Health check (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'SparkLive API is running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API version info
app.get('/api/version', (req: Request, res: Response) => {
  res.status(200).json({
    version: 'v1',
    features: ['auth', '2fa', 'rbac', 'rate-limiting', 'bot-protection', 'csrf-protection', 'audit-logging', 'ai-recommendations', 'ai-moderation', 'ai-nlp', 'ai-analytics', 'ai-fraud'],
  });
});

// Mount routes with rate limiting
app.use('/api/auth', authRoutes);

// Protected routes with rate limiting
app.use('/api/profiles', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/welcome-reward', welcomeRewardRoutes);
app.use('/api/messages', rateLimiter.messaging, messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/search', rateLimiter.search, searchRoutes);
app.use('/api/upload', rateLimiter.upload, uploadRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/compliance', complianceRoutes);

// ============================================================================
// AI ROUTES
// ============================================================================
app.use('/api/ai', aiRouter);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================
app.use('/api/analytics', analyticsRouter);

// ============================================================================
// WEBSOCKET SECURITY
// ============================================================================

const io = new Server(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : undefined;
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.startsWith('app://') || (normalizedOrigin && isAllowedLocalOrigin(normalizedOrigin))) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Rate limiting for WebSocket connections
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Authenticate WebSocket connections using enterprise security
io.use(authenticateSocket);

// Initialize Socket.io handlers
handleChatSocket(io);
handleLiveSocket(io);
handleGiftSocket(io);
setNotificationIO(io);

// Register AI Socket.io handlers
registerAISocketHandlers(io);

// Register Analytics Socket.io handlers
registerAnalyticsSocketHandlers(io);

// Global socket connection handler
io.on('connection', (socket) => {
  handleConnect(socket as any);
  
  socket.on('disconnect', () => {
    handleDisconnect(socket as any);
  });
});

// ============================================================================
// SECURITY HEADERS
// ============================================================================

// Security headers middleware (additional to helmet)
app.use((req: Request, res: Response, next) => {
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Clear-Site-Data for logout endpoints
  if (req.path === '/api/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }
  
  next();
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('[ERROR]', err);
  
  auditLog.log({
    action: 'SERVER_ERROR',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata: {
      method: req.method,
      path: req.path,
      error: err.message,
    },
    severity: 'ERROR' as any,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize security layer
    await initializeSecurity();

    // Initialize performance monitoring alerts
    setupDefaultAlerts();

    // Initialize analytics engine
    analyticsEngine.initialize();

    // Start cache warming for frequently accessed data
    startCacheWarming();

    // Connect to database
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Set it in .env or environment.');
    }

    await prisma.$connect();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
      console.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing despite startup errors in non-production environment.');
      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (degraded mode)`);
      });
    }
  }
}


// Cache warming - pre-populate frequently accessed data
function startCacheWarming(): void {
  const warmer = cacheService.warmerInstance;
  
  // Warm trending content every 5 minutes
  warmer.register('trending', async () => {
    try {
      const { feedService } = require('./services/feed.service');
      const trending = await feedService.getTrending({ limit: 50 });
      await cacheService.set('trending', trending, 300_000);
    } catch {
      // Ignore warming errors
    }
  }, 300_000);

  // Warm active live streams every 30 seconds
  warmer.register('live:active', async () => {
    try {
      const { liveService } = require('./services/live.service');
      const streams = await liveService.getActiveStreams({ limit: 50 });
      await cacheService.set('live:active', streams, 30_000);
    } catch {
      // Ignore warming errors
    }
  }, 30_000);

  warmer.start();
}

startServer();
