import { prisma } from "../prisma";

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

  async requestWithdrawal(userId: string, amount: number, method: string, details: any) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.earningsBalance < amount) {
      throw new Error("Insufficient earnings to withdraw");
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        method,
        address: details.address,
        bankName: details.bankName,
        accountNo: details.accountNo,
        status: "PENDING",
      },
    });

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
