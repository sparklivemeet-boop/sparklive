import { prisma } from "../prisma";
import { PaymentProviderFactory } from "./payment-provider.interface";

export class WalletService {
  async getWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return wallet;
  }

  async addCoins(userId: string, amount: number) {
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: { coinBalance: { increment: amount } },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        userId,
        type: "TOPUP",
        amount,
        status: "SUCCESS",
      },
    });

    return wallet;
  }

  async deductCoins(userId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.coinBalance < amount) {
      throw new Error("Insufficient coins");
    }

    const updated = await prisma.wallet.update({
      where: { userId },
      data: { coinBalance: { decrement: amount } },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        userId,
        type: "SPEND",
        amount,
        status: "SUCCESS",
      },
    });

    return updated;
  }

  async getBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      coinBalance: wallet.coinBalance,
      earningsBalance: wallet.earningsBalance,
      usdtWalletAddress: wallet.usdtWalletAddress,
    };
  }

  async getTransactionHistory(userId: string, limit: number = 50) {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return transactions;
  }

  async getCoinTransactions(userId: string, limit: number = 50) {
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return transactions;
  }

  async getGiftHistory(userId: string, limit: number = 50) {
    const [sentGifts, receivedGifts] = await Promise.all([
      prisma.giftTransaction.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          gift: true,
          receiver: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.giftTransaction.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          gift: true,
          sender: { select: { id: true, username: true, avatar: true } },
        },
      }),
    ]);

    return { sentGifts, receivedGifts };
  }

  // Save USDT (BEP-20) wallet address
  async saveUsdtWalletAddress(userId: string, address: string) {
    const provider = PaymentProviderFactory.getProvider();
    const isValid = await provider.validateAddress(address);
    if (!isValid) {
      throw new Error("Invalid USDT (BEP-20) wallet address format");
    }

    const wallet = await prisma.wallet.update({
      where: { userId },
      data: { usdtWalletAddress: address.trim() },
    });

    return wallet;
  }

  // Request withdrawal - USDT (BEP-20) only
  async requestUsdtWithdrawal(userId: string, amount: number, walletAddress: string) {
    const provider = PaymentProviderFactory.getProvider();
    const minWithdrawal = provider.getMinimumWithdrawal();

    if (amount < minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is $${minWithdrawal} USD`);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.earningsBalance < amount) {
      throw new Error("Insufficient earnings balance for withdrawal");
    }

    // Validate wallet address
    const isValid = await provider.validateAddress(walletAddress);
    if (!isValid) {
      throw new Error("Invalid USDT (BEP-20) wallet address");
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        fee: 0.0,
        netAmount: amount,
        method: "USDT_BEP20",
        currency: "USDT",
        status: "PENDING",
        walletAddress: walletAddress.trim(),
        cryptoNetwork: "BNB_SMART_CHAIN",
      },
    });

    // Process payout through provider
    try {
      const result = await provider.processPayout(amount, walletAddress, "USDT");
      
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          adminNotes: `TXID: ${result.transactionId}`,
        },
      });
    } catch (payoutError) {
      // Log but don't fail - admin can process manually
      console.error("Payout processing error:", payoutError);
    }

    return withdrawal;
  }

  async getWithdrawals(userId: string, limit: number = 20) {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return withdrawals;
  }

  async getWithdrawalStatus(withdrawalId: string, userId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal || withdrawal.userId !== userId) {
      throw new Error("Withdrawal not found or unauthorized");
    }

    return withdrawal;
  }

  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    // Deduct from earnings
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: { earningsBalance: { decrement: withdrawal.amount } },
    });

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "COMPLETED" },
    });

    return updated;
  }

  async getPremiumStatus(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        active: true,
        expiresAt: { gt: new Date() },
      },
    });

    return {
      isPremium: !!subscription,
      plan: subscription?.plan || null,
      expiresAt: subscription?.expiresAt || null,
    };
  }

  async buyPremium(userId: string, plan: string, durationDays: number = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        active: true,
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { premium: true },
    });

    return subscription;
  }
}

export const walletService = new WalletService();