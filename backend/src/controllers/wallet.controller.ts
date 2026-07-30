import { Request, Response } from 'express';
import { walletService } from '../services';
import { AuthRequest } from '../middleware/auth.middleware';
import { getParamString } from '../utils/params';

// ============================================================================
// WALLET & BALANCE
// ============================================================================

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const wallet = await walletService.getWallet(userId);
    res.status(200).json(wallet);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const balance = await walletService.getBalance(userId);
    res.status(200).json(balance);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

// ============================================================================
// COIN DEPOSITS
// ============================================================================

export const processDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { amount, coins, paymentMethod, providerOrderId } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!amount || !coins || !paymentMethod || !providerOrderId) {
      res.status(400).json({ error: 'Amount, coins, paymentMethod, and providerOrderId are required' });
      return;
    }
    const wallet = await walletService.processDeposit(
      userId, amount, coins, paymentMethod, providerOrderId, req.ip
    );
    res.status(200).json({ message: 'Deposit successful', wallet });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// COIN TRANSFERS
// ============================================================================

export const transferCoins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { receiverId, amount, note, pin, otpCode } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!receiverId || !amount) {
      res.status(400).json({ error: 'Receiver ID and amount are required' });
      return;
    }
    const result = await walletService.transferCoins(
      userId, receiverId, amount, note, pin, otpCode, req.ip
    );
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// WALLET PIN
// ============================================================================

export const setupPin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { pin } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!pin) { res.status(400).json({ error: 'PIN is required' }); return; }
    const result = await walletService.setupPin(userId, pin);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const updatePin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { oldPin, newPin } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!oldPin || !newPin) { res.status(400).json({ error: 'Old PIN and new PIN are required' }); return; }
    const result = await walletService.updatePin(userId, oldPin, newPin);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const verifyPin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { pin } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!pin) { res.status(400).json({ error: 'PIN is required' }); return; }
    const result = await walletService.verifyPin(userId, pin);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// TRANSFER LIMITS
// ============================================================================

export const updateTransferLimit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { dailyLimit, singleTxLimit, otpThreshold } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const result = await walletService.updateTransferLimit(userId, { dailyLimit, singleTxLimit, otpThreshold });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

export const getTransactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { type, status, startDate, endDate, search, limit, offset } = req.query;
    const result = await walletService.getTransactionHistory(userId, {
      type: type as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getTransfersSent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const result = await walletService.getTransfersSent(userId, limit, offset);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getTransfersReceived = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const result = await walletService.getTransfersReceived(userId, limit, offset);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getGiftHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const history = await walletService.getGiftHistory(userId, limit);
    res.status(200).json(history);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getDeposits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const result = await walletService.getDeposits(userId, limit, offset);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// WITHDRAWALS (Disabled)
// ============================================================================

export const requestWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { amount, walletAddress } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!amount || !walletAddress) {
      res.status(400).json({ error: 'Amount and wallet address are required' });
      return;
    }
    const withdrawal = await walletService.requestWithdrawal(userId, amount, walletAddress);
    res.status(201).json({ message: 'Withdrawal request created', withdrawal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const withdrawals = await walletService.getWithdrawals(userId, limit);
    res.status(200).json(withdrawals);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getWithdrawalHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const result = await walletService.getWithdrawalHistory(userId, limit, offset);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// WALLET ADDRESS
// ============================================================================

export const saveWalletAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { address } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (!address) { res.status(400).json({ error: 'Wallet address is required' }); return; }
    const wallet = await walletService.saveUsdtWalletAddress(userId, address);
    res.status(200).json({ message: 'USDT (BEP-20) wallet address saved successfully', wallet });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

// ============================================================================
// WALLET ANALYTICS
// ============================================================================

export const getWalletAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analytics = await walletService.getWalletAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};