import { Router } from 'express';
import { discover, swipe, getMatches, respondToLike } from '../controllers/match.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/discover', discover);
router.post('/swipe', swipe);
router.get('/', getMatches);
router.post('/likes/:likeId/respond', respondToLike);

export default router;
