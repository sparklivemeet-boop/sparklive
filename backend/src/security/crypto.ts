import crypto from 'crypto';
import argon2 from 'argon2';
import { config } from './config';

/**
 * Enterprise-grade cryptography utilities for SparkLive.
 * All sensitive operations use industry-standard algorithms.
 */
export class CryptoUtils {
  /**
   * Hash a password using Argon2id (memory-hard, resistant to GPU/ASIC attacks)
   */
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: config.argon2.memoryCost,      // 64MB
      timeCost: config.argon2.timeCost,           // 3 iterations
      parallelism: config.argon2.parallelism,     // 4 threads
      hashLength: 32,
      saltLength: 16,
    });
  }

  /**
   * Verify a password against an Argon2 hash
   */
  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Generate a cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a human-readable recovery code
   */
  static generateRecoveryCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[crypto.randomInt(chars.length)];
      if (i === 3) code += '-';
    }
    return code;
  }

  /**
   * Hash data using SHA-256
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static encrypt(text: string, key?: string): string {
    const encryptionKey = key || config.encryption.key;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   */
  static decrypt(encryptedText: string, key?: string): string {
    const encryptionKey = key || config.encryption.key;
    const parts = encryptedText.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted text format');

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generate a CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Create a device fingerprint hash
   */
  static createDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const raw = `${userAgent}|${ipAddress}`;
    return this.sha256(raw);
  }

  /**
   * Compare two strings in constant time (prevents timing attacks)
   */
  static constantTimeCompare(a: string, b: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Generate a TOTP-compatible secret for 2FA
   */
  static generateTOTPSecret(): string {
    return crypto.randomBytes(20).toString('base64url');
  }
}