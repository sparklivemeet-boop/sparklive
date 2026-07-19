import { GiftService } from '../services/gift.service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    gift: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    giftTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    wallet: {
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../services/wallet.service', () => ({
  walletService: {
    deductCoins: jest.fn(),
  },
}));

jest.mock('../services/notification.service', () => ({
  notificationService: {
    notifyGiftReceived: jest.fn(),
  },
}));

const giftService = new GiftService();

describe('GiftService', () => {
  const mockGift = { id: 'gift1', name: 'Rose', price: 10, image: 'rose.png', category: 'flowers' };
  const mockTransaction = {
    id: 'tx1',
    senderId: 'user1',
    receiverId: 'user2',
    giftId: 'gift1',
    amount: 10,
    createdAt: new Date(),
  };

  beforeEach(() => jest.clearAllMocks());

  describe('listGifts', () => {
    test('should return all gifts', async () => {
      (prisma.gift.findMany as jest.Mock).mockResolvedValue([mockGift]);
      const result = await giftService.listGifts();
      expect(result).toHaveLength(1);
    });
  });

  describe('sendGift', () => {
    test('should send gift successfully and update balances', async () => {
      (prisma.gift.findUnique as jest.Mock).mockResolvedValue(mockGift);
      (prisma.giftTransaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.wallet.update as jest.Mock).mockResolvedValue({});
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user1', username: 'sender' });

      const { walletService } = require('../services/wallet.service');
      walletService.deductCoins.mockResolvedValue({});

      const result = await giftService.sendGift('user1', 'user2', 'gift1');
      expect(result).toEqual(mockTransaction);
    });

    test('should throw for non-existent gift', async () => {
      (prisma.gift.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(giftService.sendGift('user1', 'user2', 'nonexistent')).rejects.toThrow('Gift not found');
    });
  });

  describe('getGiftHistory', () => {
    test('should return transaction history', async () => {
      (prisma.giftTransaction.findMany as jest.Mock).mockResolvedValue([mockTransaction]);
      const result = await giftService.getGiftHistory('user1');
      expect(result).toHaveLength(1);
    });
  });
});