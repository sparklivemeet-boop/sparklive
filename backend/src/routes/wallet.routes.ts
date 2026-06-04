import { Router } from 'express';
import { getWallet, getTransactionHistory } from '../controllers/wallet.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getWallet);
router.get('/transactions', getTransactionHistory);

export default router;
