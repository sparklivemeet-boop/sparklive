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
  // New wallet admin endpoints
  freezeWallet,
  unfreezeWallet,
  reverseTransaction,
  flagSuspiciousAccount,
  getWalletAnalytics,
  getAllTransactions,
  getAllDeposits,
  getAllTransfers,
  getAllGifts,
  getAllWithdrawals,
  searchUsers,
  // New ad admin endpoints
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
  pauseCampaign,
  resumeCampaign,
  getCampaignAnalytics,
  getAllAdsAnalytics,
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
router.get('/users/search', searchUsers);

// Creator Management
router.get('/creators', getCreators);

// Community Management
router.get('/communities', getCommunities);

// Live Stream Moderation
router.get('/live', getLiveStreams);

// Wallet Management
router.get('/wallet/transactions', getWalletTransactions);
router.get('/wallet/all-transactions', getAllTransactions);
router.get('/wallet/deposits', getAllDeposits);
router.get('/wallet/transfers', getAllTransfers);
router.get('/wallet/gifts', getAllGifts);
router.get('/wallet/withdrawals', getAllWithdrawals);
router.post('/wallet/freeze', freezeWallet);
router.post('/wallet/unfreeze', unfreezeWallet);
router.post('/wallet/reverse', reverseTransaction);
router.post('/wallet/flag', flagSuspiciousAccount);
router.get('/wallet/analytics', getWalletAnalytics);

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

// Ad Campaign Management
router.post('/ads/campaigns', createCampaign);
router.put('/ads/campaigns/:campaignId', updateCampaign);
router.delete('/ads/campaigns/:campaignId', deleteCampaign);
router.get('/ads/campaigns/:campaignId', getCampaign);
router.get('/ads/campaigns', getCampaigns);
router.post('/ads/campaigns/:campaignId/pause', pauseCampaign);
router.post('/ads/campaigns/:campaignId/resume', resumeCampaign);
router.get('/ads/analytics', getAllAdsAnalytics);
router.get('/ads/analytics/:campaignId', getCampaignAnalytics);

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
