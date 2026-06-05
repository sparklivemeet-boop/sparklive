import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services';

// ============ BASIC AUTH ============

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, fullName } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, username, and password are required' });
      return;
    }

    const userAgent = req.headers['user-agent']?.toString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, token, refreshToken } = await authService.register(
      email,
      username,
      password,
      fullName,
      userAgent,
      ipAddress
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const userAgent = req.headers['user-agent']?.toString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, token, refreshToken } = await authService.login(
      email,
      password,
      userAgent,
      ipAddress
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid credentials';
    res.status(401).json({ error: message });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : undefined;

    if (!userId || !token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await authService.logout(userId, token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(400).json({ error: message });
  }
};

// ============ TOKEN REFRESH ============

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    res.status(401).json({ error: message });
  }
};

// ============ USER INFO ============

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User profile retrieved',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    res.status(400).json({ error: message });
  }
};

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessions = await authService.getUserSessions(userId);

    res.status(200).json({
      message: 'Sessions retrieved',
      sessions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
    res.status(400).json({ error: message });
  }
};

// ============ OAUTH ============

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    const userAgent = req.headers['user-agent']?.toString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, token, refreshToken, isNewUser } = await authService.googleAuth(
      idToken,
      userAgent,
      ipAddress
    );

    res.status(200).json({
      message: isNewUser ? 'User created and logged in' : 'Logged in successfully',
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google authentication failed';
    res.status(400).json({ error: message });
  }
};

export const appleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identityToken, userIdentifier } = req.body;

    if (!identityToken || !userIdentifier) {
      res.status(400).json({ error: 'Identity token and user identifier are required' });
      return;
    }

    const userAgent = req.headers['user-agent']?.toString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, token, refreshToken, isNewUser } = await authService.appleAuth(
      identityToken,
      userIdentifier,
      userAgent,
      ipAddress
    );

    res.status(200).json({
      message: isNewUser ? 'User created and logged in' : 'Logged in successfully',
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Apple authentication failed';
    res.status(400).json({ error: message });
  }
};

// ============ PHONE OTP ============

export const phoneSendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.sendPhoneOTP(phoneNumber, ipAddress);

    res.status(200).json({
      message: 'OTP sent successfully',
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    res.status(400).json({ error: message });
  }
};

export const phoneVerifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      res.status(400).json({ error: 'Phone number and OTP are required' });
      return;
    }

    const userAgent = req.headers['user-agent']?.toString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, token, refreshToken, isNewUser } = await authService.verifyPhoneOTP(
      phoneNumber,
      otp,
      userAgent,
      ipAddress
    );

    res.status(200).json({
      message: isNewUser ? 'User created and logged in' : 'Logged in successfully',
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OTP verification failed';
    res.status(401).json({ error: message });
  }
};

// ============ PASSWORD RESET ============

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    await authService.forgotPassword(email);

    // Don't reveal if email exists for security
    res.status(200).json({
      message: 'If an account exists with this email, a password reset link will be sent',
    });
  } catch (error) {
    // Don't reveal specific errors
    res.status(200).json({
      message: 'If an account exists with this email, a password reset link will be sent',
    });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Reset token is required' });
      return;
    }

    const isValid = await authService.verifyPasswordResetToken(token);

    res.status(200).json({
      message: 'Token is valid',
      valid: isValid,
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    res.status(400).json({ error: message });
  }
};
