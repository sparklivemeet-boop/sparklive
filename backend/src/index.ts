import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './prisma';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import settingsRoutes from './routes/settings.routes';
import walletRoutes from './routes/wallet.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import liveRoutes from './routes/live.routes';
import giftRoutes from './routes/gift.routes';
import adminRoutes from './routes/admin.routes';
import { handleChatSocket } from './sockets/chat.socket';
import { handleLiveSocket } from './sockets/live.socket';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, '');
const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL || 'http://localhost:3000/');
const electronOrigin = normalizeOrigin(process.env.ELECTRON_URL || 'app://.');
const allowedOrigins = [frontendOrigin, electronOrigin, 'http://127.0.0.1:3000'];

const isAllowedLocalOrigin = (origin: string): boolean => {
  try {
    const normalizedOrigin = normalizeOrigin(origin);
    const url = new URL(normalizedOrigin);
    const hostname = url.hostname.toLowerCase();
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');

    const localHostnames = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
    if (localHostnames.includes(hostname) && port === '3000') {
      return true;
    }

    if (/^172\./.test(hostname) && port === '3000') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : undefined;
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.startsWith('app://') || (normalizedOrigin && isAllowedLocalOrigin(normalizedOrigin))) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const uploadsDir = path.resolve(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'SparkLive API is running' });
});

// Initialize Socket.io handlers
handleChatSocket(io);
handleLiveSocket(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Set it in .env or environment.');
    }

    await prisma.$connect();
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without database connection in non-production environment.');
    }
  }

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
