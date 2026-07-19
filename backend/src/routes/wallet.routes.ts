import { Router } from 'express';
import { 
  getWallet, getTransactionHistory, getCoinTransactions, getGiftHistory,
  saveWalletAddress, requestWithdrawal, getWithdrawals, getWithdrawalStatus
} from '../controllers/wallet.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getWallet);
router.get('/transactions', getTransactionHistory);
router.get('/coin-transactions', getCoinTransactions);
router.get('/gift-history', getGiftHistory);
router.post('/address', saveWalletAddress);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.get('/withdrawals/:withdrawalId', getWithdrawalStatus);

export default router;