import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    sessionId?: string;
  };
  token?: string;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decodedPayload = decoded as { userId?: string; role?: string };

    if (!decodedPayload || !decodedPayload.userId) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      res.status(403).json({ error: 'Session expired or invalid' });
      return;
    }

    req.user = {
      userId: decodedPayload.userId,
      role: decodedPayload.role || 'USER',
      sessionId: session.id,
    };
    req.token = token;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
