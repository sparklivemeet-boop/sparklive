import { Router } from 'express';
import { getDashboardStats, getUsers } from '../controllers/admin.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);

export default router;
