import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getReports,
  banUser,
  unbanUser,
  verifyUser,
  getWithdrawals,
  approveWithdrawal,
  getCreators,
  getCommunities,
  getLiveStreams,
  getWalletTransactions,
  getCoinManagement,
  getPlatformAnalytics,
  getPlatformSettings,
  updatePlatformSettings,
  getSystemLogs,
  getFeatureFlags,
  updateFeatureFlag,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getUserManagement,
  updateUserRole,
  deleteUser,
} from '../controllers/admin.controller';
import { authenticate, requireRole, Role } from '../security';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole(Role.ADMIN, Role.SUPER_ADMIN));

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/manage', getUserManagement);
router.put('/users/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Creator Management
router.get('/creators', getCreators);

// Community Management
router.get('/communities', getCommunities);

// Live Stream Moderation
router.get('/live', getLiveStreams);

// Wallet Management
router.get('/wallet/transactions', getWalletTransactions);

// Coin Management
router.get('/coins', getCoinManagement);

// Reports & Moderation
router.get('/reports', getReports);
router.post('/users/ban', banUser);
router.post('/users/unban', unbanUser);
router.post('/users/verify', verifyUser);

// Withdrawals
router.get('/withdrawals', getWithdrawals);
router.post('/withdrawals/approve', approveWithdrawal);

// Platform Analytics
router.get('/analytics', getPlatformAnalytics);

// Platform Settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

// System Logs
router.get('/system-logs', getSystemLogs);

// Feature Flags
router.get('/feature-flags', getFeatureFlags);
router.put('/feature-flags/:flagId', updateFeatureFlag);

// Announcement Management
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:announcementId', updateAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

export default router;