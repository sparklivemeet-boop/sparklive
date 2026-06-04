import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { walletService, notificationService, giftService } from '../services';
import { AuthRequest } from '../middleware/auth.middleware';

export const getGifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const gifts = await giftService.listGifts();
    res.status(200).json(gifts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const sendGift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, giftId } = req.body;

    if (!senderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!receiverId || !giftId) {
      res.status(400).json({ error: 'receiverId and giftId are required' });
      return;
    }

    const transaction = await giftService.sendGift(senderId, receiverId, giftId);
    res.status(201).json({
      message: 'Gift sent successfully',
      transaction,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getGiftHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const transactions = await prisma.giftTransaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
        gift: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.status(200).json(transactions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};
