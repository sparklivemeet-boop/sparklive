import { prisma } from '../prisma';
import { walletService } from './wallet.service';
import { notificationService } from './notification.service';

export class GiftService {
  async listGifts() {
    return prisma.gift.findMany();
  }

  async sendGift(senderId: string, receiverId: string, giftId: string) {
    const gift = await prisma.gift.findUnique({ where: { id: giftId } });
    if (!gift) throw new Error('Gift not found');

    // Deduct coins from sender
    await walletService.deductCoins(senderId, gift.price);

    // Add earnings to receiver
    await prisma.wallet.update({
      where: { userId: receiverId },
      data: { earningsBalance: { increment: gift.price } },
    });

    // Record transaction
    const transaction = await prisma.giftTransaction.create({
      data: {
        senderId,
        receiverId,
        giftId,
        amount: gift.price,
      },
    });

    const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { username: true } });
    await notificationService.notifyGiftReceived(receiverId, sender?.username || 'Unknown', gift.name);

    return transaction;
  }

  async getGiftHistory(userId: string, limit = 50) {
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

    return transactions;
  }
}

export const giftService = new GiftService();
