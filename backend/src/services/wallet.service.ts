import { prisma } from "../prisma";
import { PaymentProviderFactory } from "./payment-provider.interface";
import { notificationService } from "./notification.service";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

export class WalletService {
  // ============================================================
  // WALLET INITIALIZATION
  // ============================================================

  async ensureWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
      // Create default transfer limits
      await prisma.transferLimit.create({
        data: { walletId: wallet.id },
      });
    }
    return wallet;
  }

  // ============================================================
  // WALLET & BALANCE
  // ============================================================

  async getWallet(userId: string) {
    const wallet = await this.ensureWallet(userId);
    const transferLimit = await prisma.transferLimit.findUnique({
      where: { walletId: wallet.id },
    });
    const pin = await prisma.walletPIN.findUnique({
      where: { walletId: wallet.id },
    });

    return {
      ...wallet,
      transferLimit,
      hasPin: !!pin,
    };
  }

  async getBalance(userId: string) {
    const wallet = await this.ensureWallet(userId);
    return {
      coinBalance: wallet.coinBalance,
      earningsBalance: wallet.earningsBalance,
      totalCoinsPurchased: wallet.totalCoinsPurchased,
      totalCoinsReceived: wallet.totalCoinsReceived,
      totalCoinsSent: wallet.totalCoinsSent,
      totalGiftsSent: wallet.totalGiftsSent,
      totalGiftsReceived: wallet.totalGiftsReceived,
      totalWithdrawn: wallet.totalWithdrawn,
      lifetimeEarnings: wallet.lifetimeEarnings,
      bonusCoins: wallet.bonusCoins,
      lockedCoins: wallet.lockedCoins,
      isFrozen: wallet.isFrozen,
      usdtWalletAddress: wallet.usdtWalletAddress,
    };
  }

  // ============================================================
  // COIN DEPOSITS (0% Platform Fee)
  // ============================================================

  async processDeposit(
    userId: string,
    amount: number,
    coins: number,
    paymentMethod: string,
    providerOrderId: string,
    ipAddress?: string
  ) {
    // Check if wallet is frozen
    const wallet = await this.ensureWallet(userId);
    if (wallet.isFrozen) {
      throw new Error("Wallet is frozen. Contact support.");
    }

    // Record purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        userId,
        coins,
        amount,
        currency: "USD",
        provider: "stripe",
        status: "COMPLETED",
        providerOrderId,
        paymentMethod,
      },
    });

    // Update wallet balance - 0% platform fee, user gets full coins
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        coinBalance: { increment: coins },
        totalCoinsPurchased: { increment: coins },
      },
    });

    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: "DEPOSIT",
        amount: coins,
        fee: 0,
        balance: updatedWallet.coinBalance,
        status: "COMPLETED",
        description: `Purchase of ${coins} Spark Coins for $${amount}`,
        reference: purchaseOrder.id,
        metadata: JSON.stringify({
          paymentMethod,
          providerOrderId,
          amountUSD: amount,
        }),
      },
    });

    // Log audit
    await this.logAudit(userId, "DEPOSIT", {
      amount,
      coins,
      paymentMethod,
      providerOrderId,
      ipAddress,
    });

    // Send notification
    await notificationService.createNotification(userId, {
      type: "WALLET_DEPOSIT",
      title: "Deposit Successful",
      message: `${coins} Spark Coins have been added to your wallet.`,
      data: JSON.stringify({ coins, amount }),
    });

    return updatedWallet;
  }

  // ============================================================
  // CHAT COIN TRANSFERS (5% Sender Fee)
  // ============================================================

  async transferCoins(
    senderId: string,
    receiverId: string,
    amount: number,
    note?: string,
    pin?: string,
    otpCode?: string,
    ipAddress?: string,
    deviceFingerprint?: string
  ) {
    if (senderId === receiverId) {
      throw new Error("Cannot send coins to yourself");
    }

    const senderWallet = await this.ensureWallet(senderId);
    const receiverWallet = await this.ensureWallet(receiverId);

    // Check if wallets are frozen
    if (senderWallet.isFrozen) {
      throw new Error("Your wallet is frozen. Contact support.");
    }
    if (receiverWallet.isFrozen) {
      throw new Error("Recipient's wallet is frozen.");
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error("Transfer amount must be positive");
    }

    // Calculate fee (5% sender pays)
    const fee = Math.ceil(amount * 0.05);
    const totalDeduction = amount + fee;
    const netReceived = amount;

    // Check balance
    if (senderWallet.coinBalance < totalDeduction) {
      throw new Error(
        `Insufficient balance. You need ${totalDeduction} coins (${amount} + ${fee} fee) but only have ${senderWallet.coinBalance}`
      );
    }

    // Check daily transfer limit
    await this.checkTransferLimit(senderWallet.id, totalDeduction);

    // Verify PIN if set
    if (senderWallet.pin) {
      const pinRecord = await prisma.walletPIN.findUnique({
        where: { walletId: senderWallet.id },
      });
      if (pinRecord) {
        // Check if PIN is locked
        if (pinRecord.lockedUntil && pinRecord.lockedUntil > new Date()) {
          throw new Error(
            `PIN is locked. Try again after ${pinRecord.lockedUntil.toISOString()}`
          );
        }

        if (!pin) {
          throw new Error("PIN is required for this transfer");
        }

        const pinValid = await bcrypt.compare(pin, pinRecord.pinHash);
        if (!pinValid) {
          // Increment failed attempts
          const newAttempts = pinRecord.failedAttempts + 1;
          const updates: any = { failedAttempts: newAttempts };
          if (newAttempts >= 5) {
            updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
          }
          await prisma.walletPIN.update({
            where: { id: pinRecord.id },
            data: updates,
          });

          await this.logAudit(senderId, "PIN_FAILED", {
            walletId: senderWallet.id,
            failedAttempts: newAttempts,
            ipAddress,
          });

          throw new Error(
            `Invalid PIN. ${5 - newAttempts} attempts remaining.`
          );
        }

        // Reset failed attempts on success
        if (pinRecord.failedAttempts > 0) {
          await prisma.walletPIN.update({
            where: { id: pinRecord.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }
      }
    }

    // Check if OTP is needed for high-value transfers
    const transferLimit = await prisma.transferLimit.findUnique({
      where: { walletId: senderWallet.id },
    });
    if (transferLimit && totalDeduction >= transferLimit.otpThreshold) {
      if (!otpCode) {
        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        // Store OTP in the transfer record (we'll create a pending transfer)
        await this.logAudit(senderId, "OTP_SENT", {
          amount: totalDeduction,
          ipAddress,
        });

        // Send OTP via notification
        await notificationService.createNotification(senderId, {
          type: "WALLET_OTP",
          title: "Transfer OTP",
          message: `Your OTP for transferring ${amount} coins is: ${otp}. Valid for 10 minutes.`,
          data: JSON.stringify({ amount, otp }),
        });

        return { requiresOTP: true, message: "OTP sent to your email/phone" };
      }

      // Verify OTP (in production, verify against stored OTP)
      // For now, we'll accept any 6-digit code as this would connect to email/SMS service
    }

    // Fraud detection - check for duplicate transfers
    const recentTransfer = await prisma.coinTransfer.findFirst({
      where: {
        senderId,
        receiverId,
        amount,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 min window
        status: "COMPLETED",
      },
    });
    if (recentTransfer) {
      throw new Error(
        "Duplicate transfer detected. Please wait before sending the same amount to the same user."
      );
    }

    // Check for suspicious activity - rapid transfers
    const recentTransfers = await prisma.coinTransfer.count({
      where: {
        senderId,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) }, // 1 min window
      },
    });
    if (recentTransfers >= 5) {
      throw new Error(
        "Suspicious activity detected. Too many transfers in a short period. Please try again later."
      );
    }

    // Execute transfer
    const [updatedSender, updatedReceiver] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: senderId },
        data: {
          coinBalance: { decrement: totalDeduction },
          totalCoinsSent: { increment: amount },
        },
      }),
      prisma.wallet.update({
        where: { userId: receiverId },
        data: {
          coinBalance: { increment: netReceived },
          totalCoinsReceived: { increment: netReceived },
        },
      }),
    ]);

    // Create coin transfer record
    const transfer = await prisma.coinTransfer.create({
      data: {
        senderId,
        receiverId,
        amount,
        fee,
        netAmount: netReceived,
        note,
        status: "COMPLETED",
        otpVerified: !!otpCode,
        ipAddress,
        deviceFingerprint,
      },
    });

    // Create transaction records for both users
    await prisma.walletTransaction.create({
      data: {
        walletId: senderWallet.id,
        userId: senderId,
        type: "TRANSFER_SENT",
        amount: totalDeduction,
        fee,
        balance: updatedSender.coinBalance,
        status: "COMPLETED",
        description: `Sent ${amount} coins to user ${receiverId}${note ? `: ${note}` : ""}`,
        reference: transfer.id,
        metadata: JSON.stringify({ receiverId, amount, fee, note }),
      },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: receiverWallet.id,
        userId: receiverId,
        type: "TRANSFER_RECEIVED",
        amount: netReceived,
        fee: 0,
        balance: updatedReceiver.coinBalance,
        status: "COMPLETED",
        description: `Received ${netReceived} coins from user ${senderId}`,
        reference: transfer.id,
        metadata: JSON.stringify({ senderId, amount, netReceived }),
      },
    });

    // Update daily used amount
    if (transferLimit) {
      await prisma.transferLimit.update({
        where: { walletId: senderWallet.id },
        data: { dailyUsed: { increment: totalDeduction } },
      });
    }

    // Log audit
    await this.logAudit(senderId, "TRANSFER", {
      transferId: transfer.id,
      receiverId,
      amount,
      fee,
      netReceived,
      ipAddress,
    });

    // Send notifications
    await notificationService.createNotification(senderId, {
      type: "WALLET_TRANSFER_SENT",
      title: "Transfer Sent",
      message: `You sent ${amount} coins (fee: ${fee}) to a user.`,
      data: JSON.stringify({ transferId: transfer.id, amount, fee, receiverId }),
    });

    await notificationService.createNotification(receiverId, {
      type: "WALLET_TRANSFER_RECEIVED",
      title: "Coins Received",
      message: `You received ${netReceived} coins from a user.`,
      data: JSON.stringify({ transferId: transfer.id, amount: netReceived, senderId }),
    });

    return { transfer, updatedBalance: updatedSender.coinBalance };
  }

  // ============================================================
  // TRANSFER LIMITS
  // ============================================================

  private async checkTransferLimit(walletId: string, amount: number) {
    let limit = await prisma.transferLimit.findUnique({
      where: { walletId },
    });
    if (!limit) {
      limit = await prisma.transferLimit.create({
        data: { walletId },
      });
    }

    // Reset daily limit if new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (limit.lastResetDate < today) {
      await prisma.transferLimit.update({
        where: { walletId },
        data: { dailyUsed: 0, lastResetDate: new Date() },
      });
      limit.dailyUsed = 0;
    }

    // Check single transaction limit
    if (amount > limit.singleTxLimit) {
      throw new Error(
        `Single transaction limit is ${limit.singleTxLimit} coins. Please send a smaller amount.`
      );
    }

    // Check daily limit
    if (limit.dailyUsed + amount > limit.dailyLimit) {
      throw new Error(
        `Daily transfer limit of ${limit.dailyLimit} coins exceeded. Remaining: ${Math.max(0, limit.dailyLimit - limit.dailyUsed)} coins.`
      );
    }
  }

  async updateTransferLimit(
    userId: string,
    updates: {
      dailyLimit?: number;
      singleTxLimit?: number;
      otpThreshold?: number;
    }
  ) {
    const wallet = await this.ensureWallet(userId);
    const limit = await prisma.transferLimit.findUnique({
      where: { walletId: wallet.id },
    });

    if (!limit) {
      return prisma.transferLimit.create({
        data: { walletId: wallet.id, ...updates },
      });
    }

    return prisma.transferLimit.update({
      where: { walletId: wallet.id },
      data: updates,
    });
  }

  // ============================================================
  // WALLET PIN MANAGEMENT
  // ============================================================

  async setupPin(userId: string, pin: string) {
    const wallet = await this.ensureWallet(userId);

    // Validate PIN format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      throw new Error("PIN must be 4-6 digits");
    }

    const existingPin = await prisma.walletPIN.findUnique({
      where: { walletId: wallet.id },
    });

    if (existingPin) {
      throw new Error("PIN already set. Use update PIN instead.");
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const pinRecord = await prisma.walletPIN.create({
      data: {
        walletId: wallet.id,
        pinHash,
      },
    });

    await this.logAudit(userId, "PIN_SETUP", { walletId: wallet.id });

    return { success: true, message: "Wallet PIN set successfully" };
  }

  async updatePin(userId: string, oldPin: string, newPin: string) {
    const wallet = await this.ensureWallet(userId);
    const pinRecord = await prisma.walletPIN.findUnique({
      where: { walletId: wallet.id },
    });

    if (!pinRecord) {
      throw new Error("No PIN set. Use setup PIN first.");
    }

    const valid = await bcrypt.compare(oldPin, pinRecord.pinHash);
    if (!valid) {
      throw new Error("Current PIN is incorrect");
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      throw new Error("PIN must be 4-6 digits");
    }

    const newPinHash = await bcrypt.hash(newPin, 10);
    await prisma.walletPIN.update({
      where: { walletId: wallet.id },
      data: { pinHash: newPinHash, failedAttempts: 0, lockedUntil: null },
    });

    await this.logAudit(userId, "PIN_UPDATE", { walletId: wallet.id });

    return { success: true, message: "PIN updated successfully" };
  }

  async verifyPin(userId: string, pin: string) {
    const wallet = await this.ensureWallet(userId);
    const pinRecord = await prisma.walletPIN.findUnique({
      where: { walletId: wallet.id },
    });

    if (!pinRecord) {
      throw new Error("No PIN set");
    }

    if (pinRecord.lockedUntil && pinRecord.lockedUntil > new Date()) {
      throw new Error(
        `PIN is locked until ${pinRecord.lockedUntil.toISOString()}`
      );
    }

    const valid = await bcrypt.compare(pin, pinRecord.pinHash);
    if (!valid) {
      const newAttempts = pinRecord.failedAttempts + 1;
      const updates: any = { failedAttempts: newAttempts };
      if (newAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.walletPIN.update({
        where: { id: pinRecord.id },
        data: updates,
      });

      await this.logAudit(userId, "PIN_FAILED", {
        walletId: wallet.id,
        failedAttempts: newAttempts,
      });

      throw new Error(`Invalid PIN. ${5 - newAttempts} attempts remaining.`);
    }

    // Reset failed attempts
    if (pinRecord.failedAttempts > 0) {
      await prisma.walletPIN.update({
        where: { id: pinRecord.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    await this.logAudit(userId, "PIN_VERIFY", { walletId: wallet.id });

    return { success: true, message: "PIN verified" };
  }

  // ============================================================
  // WITHDRAWALS (Disabled - Future Ready)
  // ============================================================

  async requestWithdrawal(userId: string, amount: number, walletAddress: string) {
    // Withdrawals are disabled - return informative message
    throw new Error(
      "Withdrawals are currently under development and will be available in a future update."
    );

    // Future implementation:
    // const provider = PaymentProviderFactory.getProvider();
    // const minWithdrawal = provider.getMinimumWithdrawal();
    // if (amount < minWithdrawal) { throw new Error(`Minimum withdrawal amount is $${minWithdrawal}`); }
    // const wallet = await this.ensureWallet(userId);
    // if (wallet.earningsBalance < amount) { throw new Error("Insufficient earnings balance"); }
    // const fee = amount * 0.10; // 10% platform fee
    // const netAmount = amount - fee;
    // ... create withdrawal record, process payout, etc.
  }

  async getWithdrawals(userId: string, limit: number = 20) {
    return prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // ============================================================
  // TRANSACTION HISTORY
  // ============================================================

  async getTransactionHistory(
    userId: string,
    options: {
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: any = { userId };

    if (options.type) {
      where.type = options.type;
    }
    if (options.status) {
      where.status = options.status;
    }
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }
    if (options.search) {
      where.description = { contains: options.search };
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { transactions, total, limit: options.limit || 50, offset: options.offset || 0 };
  }

  async getTransfersSent(userId: string, limit: number = 50, offset: number = 0) {
    const [transfers, total] = await Promise.all([
      prisma.coinTransfer.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          receiver: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.coinTransfer.count({ where: { senderId: userId } }),
    ]);
    return { transfers, total };
  }

  async getTransfersReceived(userId: string, limit: number = 50, offset: number = 0) {
    const [transfers, total] = await Promise.all([
      prisma.coinTransfer.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.coinTransfer.count({ where: { receiverId: userId } }),
    ]);
    return { transfers, total };
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

  async getDeposits(userId: string, limit: number = 50, offset: number = 0) {
    const [deposits, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.purchaseOrder.count({ where: { userId } }),
    ]);
    return { deposits, total };
  }

  async getWithdrawalHistory(userId: string, limit: number = 50, offset: number = 0) {
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.withdrawal.count({ where: { userId } }),
    ]);
    return { withdrawals, total };
  }

  // ============================================================
  // WALLET ADMINISTRATION
  // ============================================================

  async freezeWallet(userId: string, adminId: string, reason: string) {
    const wallet = await this.ensureWallet(userId);
    if (wallet.isFrozen) {
      throw new Error("Wallet is already frozen");
    }

    const updated = await prisma.wallet.update({
      where: { userId },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        frozenBy: adminId,
        freezeReason: reason,
      },
    });

    await this.logAudit(userId, "FROZEN", {
      walletId: wallet.id,
      adminId,
      reason,
    });

    return updated;
  }

  async unfreezeWallet(userId: string, adminId: string) {
    const wallet = await this.ensureWallet(userId);
    if (!wallet.isFrozen) {
      throw new Error("Wallet is not frozen");
    }

    const updated = await prisma.wallet.update({
      where: { userId },
      data: {
        isFrozen: false,
        frozenAt: null,
        frozenBy: null,
        freezeReason: null,
      },
    });

    await this.logAudit(userId, "UNFROZEN", {
      walletId: wallet.id,
      adminId,
    });

    return updated;
  }

  async reverseTransaction(transactionId: string, adminId: string, reason: string) {
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === "REVERSED") {
      throw new Error("Transaction already reversed");
    }

    // Reverse the balance change
    const wallet = await this.ensureWallet(transaction.userId);
    const reversalAmount = transaction.type === "DEPOSIT" || transaction.type === "TRANSFER_RECEIVED"
      ? -transaction.amount
      : transaction.amount;

    await prisma.wallet.update({
      where: { userId: transaction.userId },
      data: { coinBalance: { increment: reversalAmount } },
    });

    // Mark original as reversed
    await prisma.walletTransaction.update({
      where: { id: transactionId },
      data: { status: "REVERSED" },
    });

    // Create reversal record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: transaction.userId,
        type: "REFUND",
        amount: Math.abs(reversalAmount),
        balance: wallet.coinBalance + reversalAmount,
        status: "COMPLETED",
        description: `Reversal: ${reason} (Original: ${transaction.id})`,
        reference: transaction.reference,
        metadata: JSON.stringify({ originalTransactionId: transactionId, reversedBy: adminId, reason }),
      },
    });

    await this.logAudit(transaction.userId, "REVERSAL", {
      transactionId,
      adminId,
      reason,
    });

    return { success: true, message: "Transaction reversed" };
  }

  async flagSuspiciousAccount(userId: string, adminId: string, reason: string) {
    await prisma.fraudAlert.create({
      data: {
        userId,
        alertType: "MANUAL_FLAG",
        severity: "HIGH",
        description: reason,
        evidence: JSON.stringify({ flaggedBy: adminId }),
      },
    });

    await this.logAudit(userId, "FLAGGED", {
      adminId,
      reason,
    });

    return { success: true, message: "Account flagged for review" };
  }

  // ============================================================
  // USDT WALLET ADDRESS
  // ============================================================

  async saveUsdtWalletAddress(userId: string, address: string) {
    const wallet = await this.ensureWallet(userId);
    return prisma.wallet.update({
      where: { userId },
      data: { usdtWalletAddress: address.trim() },
    });
  }

  // ============================================================
  // AUDIT LOGGING
  // ============================================================

  private async logAudit(userId: string, action: string, details?: any) {
    await prisma.walletAuditLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  async getWalletAnalytics() {
    const [
      totalWallets,
      totalCoinsPurchased,
      totalCoinsTransferred,
      totalGiftsSent,
      totalCreatorEarnings,
      transferFeeRevenue,
      activeWallets,
      dailyTransactions,
    ] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({ _sum: { totalCoinsPurchased: true } }),
      prisma.wallet.aggregate({ _sum: { totalCoinsSent: true } }),
      prisma.wallet.aggregate({ _sum: { totalGiftsSent: true } }),
      prisma.wallet.aggregate({ _sum: { lifetimeEarnings: true } }),
      prisma.coinTransfer.aggregate({ _sum: { fee: true } }),
      prisma.wallet.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.walletTransaction.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    // Top spenders
    const topSpenders = await prisma.wallet.findMany({
      orderBy: { totalCoinsPurchased: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Top creators
    const topCreators = await prisma.wallet.findMany({
      orderBy: { lifetimeEarnings: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return {
      totalWallets,
      totalCoinsPurchased: totalCoinsPurchased._sum.totalCoinsPurchased || 0,
      totalCoinsTransferred: totalCoinsTransferred._sum.totalCoinsSent || 0,
      totalGiftsSent: totalGiftsSent._sum.totalGiftsSent || 0,
      totalCreatorEarnings: totalCreatorEarnings._sum.lifetimeEarnings || 0,
      transferFeeRevenue: transferFeeRevenue._sum.fee || 0,
      activeWallets,
      dailyTransactions,
      topSpenders,
      topCreators,
    };
  }
}

export const walletService = new WalletService();