/**
 * SparkLive Enterprise Security Module
 * 
 * Central export point for all security components.
 * Provides a unified security layer for the entire platform.
 */
export { config } from './config';
export { CryptoUtils } from './crypto';
export { SecurityValidator, validateRequest, ValidationRule } from './validation';
export { Role, Permission, hasPermission, hasAllPermissions, hasAnyPermission, getPermissionsForRole, parseRole } from './rbac';
export { rateLimiter } from './rateLimiter';
export { auditLog } from './auditLog';
export { botProtection } from './botProtection';
export { CSRFProtection, doubleSubmitCookie } from './csrf';
export { UploadSecurity } from './uploadSecurity';
export { twoFactorAuth, TwoFactorAuth, TwoFactorSetupResult, TwoFactorVerifyResult } from './twoFactorAuth';
export {
  authenticate,
  optionalAuth,
  requirePermission,
  requireRole,
  checkLoginAttempts,
  requireEmailVerified,
  requireTwoFactorEnabled,
  securityLog,
  AuthenticatedRequest,
} from './authMiddleware';
export {
  authenticateSocket,
  createSecuredEventHandler,
  authorizeRoom,
  EventSubscriptionManager,
  eventSubscriptionManager,
  handleConnect,
  handleDisconnect,
} from './webSocketSecurity';
export { sessionManager, SessionManager, TokenPair } from './sessionManager';
export { GDPRCompliance } from './gdpr';
export { SecurityMonitoring } from './monitoring';
export { PaymentSecurity } from './paymentSecurity';
export { BackupManager } from './backupManager';
export { DevSecOps } from './devsecops';

/**
 * Initialize all security middleware
 * This should be called once during server startup
 */
export async function initializeSecurity(): Promise<void> {
  // Verify JWT secrets are set
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
    console.warn('[SECURITY] JWT_SECRET is using default value. Set a strong random secret in production.');
  }
  
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('[SECURITY] JWT_REFRESH_SECRET is not set. Using JWT_SECRET as fallback.');
  }

  // Verify encryption key
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('[SECURITY] ENCRYPTION_KEY is not set. Sensitive data will not be encrypted at rest.');
  }

  // Check password hashing
  const argon2Memory = parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10);
  if (argon2Memory < 19456) {
    console.warn('[SECURITY] ARGON2_MEMORY_COST is too low. Set to at least 19456 (19MB) for production.');
  }
}
