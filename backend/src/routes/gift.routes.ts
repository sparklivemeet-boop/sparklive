import { Router } from 'express';
import { getGifts, sendGift } from '../controllers/gift.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getGifts);

router.use(authenticateJWT);
router.post('/send', sendGift);

export default router;
