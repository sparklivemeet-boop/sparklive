import { WalletService } from '../services/wallet.service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

const walletService = new WalletService();

describe('WalletService', () => {
  const mockWallet = {
    id: 'wallet1',
    userId: 'user1',
    coinBalance: 100,
    earningsBalance: 50,
  };

  beforeEach(() => jest.clearAllMocks());

  describe('getWallet', () => {
    test('should return wallet for existing user', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);
      const result = await walletService.getWallet('user1');
      expect(result.coinBalance).toBe(100);
    });

    test('should throw for missing wallet', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(walletService.getWallet('user1')).rejects.toThrow('Wallet not found');
    });
  });

  describe('addCoins', () => {
    test('should add coins and log transaction', async () => {
      (prisma.wallet.update as jest.Mock).mockResolvedValue({ ...mockWallet, coinBalance: 150 });
      (prisma.walletTransaction.create as jest.Mock).mockResolvedValue({});

      const result = await walletService.addCoins('user1', 50);
      expect(result.coinBalance).toBe(150);
    });
  });

  describe('deductCoins', () => {
    test('should deduct coins if sufficient balance', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);
      (prisma.wallet.update as jest.Mock).mockResolvedValue({ ...mockWallet, coinBalance: 50 });
      (prisma.walletTransaction.create as jest.Mock).mockResolvedValue({});

      const result = await walletService.deductCoins('user1', 50);
      expect(result.coinBalance).toBe(50);
    });

    test('should throw for insufficient coins', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.deductCoins('user1', 200)).rejects.toThrow('Insufficient coins');
    });
  });

  describe('getBalance', () => {
    test('should return wallet balances', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);
      const result = await walletService.getBalance('user1');
      expect(result.coinBalance).toBe(100);
      expect(result.earningsBalance).toBe(50);
    });
  });

  describe('requestWithdrawal', () => {
    test('should create withdrawal request', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);
      (prisma.withdrawal.create as jest.Mock).mockResolvedValue({
        id: 'wd1',
        userId: 'user1',
        amount: 30,
        method: 'bank',
        status: 'PENDING',
      });

      const result = await walletService.requestWithdrawal('user1', 30, 'bank', { address: 'addr', bankName: 'TestBank', accountNo: '12345' });
      expect(result.status).toBe('PENDING');
    });

    test('should throw for insufficient earnings', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.requestWithdrawal('user1', 200, 'bank', {})).rejects.toThrow('Insufficient earnings to withdraw');
    });
  });

  describe('processWithdrawal', () => {
    test('should process withdrawal', async () => {
      const mockWithdrawal = { id: 'wd1', userId: 'user1', amount: 30, status: 'PENDING' };
      (prisma.withdrawal.findUnique as jest.Mock).mockResolvedValue(mockWithdrawal);
      (prisma.wallet.update as jest.Mock).mockResolvedValue(mockWallet);
      (prisma.withdrawal.update as jest.Mock).mockResolvedValue({ ...mockWithdrawal, status: 'COMPLETED' });

      const result = await walletService.processWithdrawal('wd1');
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('buyPremium', () => {
    test('should create premium subscription', async () => {
      const mockSubscription = {
        id: 'sub1',
        userId: 'user1',
        plan: 'monthly',
        active: true,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      };
      (prisma.subscription.create as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await walletService.buyPremium('user1', 'monthly', 30);
      expect(result.plan).toBe('monthly');
      expect(result.active).toBe(true);
    });
  });

  describe('getPremiumStatus', () => {
    test('should return premium status as active when subscription valid', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'sub1',
        plan: 'monthly',
        active: true,
        expiresAt: new Date(Date.now() + 86400000),
      });
      const result = await walletService.getPremiumStatus('user1');
      expect(result.isPremium).toBe(true);
    });

    test('should return premium as false when no active subscription', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await walletService.getPremiumStatus('user1');
      expect(result.isPremium).toBe(false);
    });
  });
});