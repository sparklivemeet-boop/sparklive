import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  getSessions,
  googleAuth,
  appleAuth,
  phoneSendOTP,
  phoneVerifyOTP,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

// OAuth routes
router.post('/google', googleAuth);
router.post('/apple', appleAuth);

// Phone OTP routes
router.post('/phone/send-otp', phoneSendOTP);
router.post('/phone/verify-otp', phoneVerifyOTP);

// Protected routes
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, getMe);
router.get('/sessions', authenticateJWT, getSessions);

export default router;
