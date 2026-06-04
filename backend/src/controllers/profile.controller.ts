import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getParamString } from '../utils/params';
import { userService, matchService } from '../services';

const parseLimit = (value: unknown, defaultLimit = 12) => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) return defaultLimit;
  return Math.min(parsed, 50);
};

const buildUploadUrl = (req: Request, filename: string) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profile = await userService.getUserProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profile = await userService.updateProfile(userId, req.body);
    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'Avatar file is required' });
      return;
    }
    const url = buildUploadUrl(req, req.file.filename);
    const profile = await userService.updateProfileImage(userId, 'avatar', url);
    res.status(200).json({ message: 'Avatar uploaded successfully', profile, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const uploadBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'Banner file is required' });
      return;
    }
    const url = buildUploadUrl(req, req.file.filename);
    const profile = await userService.updateProfileImage(userId, 'banner', url);
    res.status(200).json({ message: 'Banner uploaded successfully', profile, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const uploadProfileMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'Media file is required' });
      return;
    }
    const url = buildUploadUrl(req, req.file.filename);
    const title = typeof req.body.title === 'string' ? req.body.title.trim().slice(0, 80) : undefined;
    const media = await userService.addProfileMedia(userId, url, 'IMAGE', title);
    res.status(201).json({ message: 'Media uploaded successfully', media });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getProfilePosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 10);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const posts = await userService.getUserPosts(userId, cursor, limit);
    res.status(200).json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getProfileMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 12);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const media = await userService.getProfileMedia(userId, cursor, limit);
    res.status(200).json(media);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getProfileReplies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 10);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const replies = await userService.getUserReplies(userId, cursor, limit);
    res.status(200).json(replies);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getProfileLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 10);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const likes = await userService.getUserLikes(userId, cursor, limit);
    res.status(200).json(likes);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = getParamString(req.params.username);
    const userId = (req as AuthRequest).user?.userId;
    const profile = await userService.getPublicProfileByUsername(username, userId);
    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const getPublicProfilePosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = getParamString(req.params.username);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 10);
    const posts = await userService.getPublicUserPostsByUsername(username, cursor, limit);
    res.status(200).json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const getPublicProfileMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = getParamString(req.params.username);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = parseLimit(req.query.limit, 12);
    const media = await userService.getPublicUserMediaByUsername(username, cursor, limit);
    res.status(200).json(media);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;
    const username = getParamString(req.params.username);
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const follow = await userService.followUser(currentUserId, username);
    res.status(200).json({ message: 'Followed successfully', follow });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;
    const username = getParamString(req.params.username);
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await userService.unfollowUser(currentUserId, username);
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getDiscoverProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseLimit(req.query.limit, 10);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profiles = await matchService.discover(userId, limit);
    res.status(200).json(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};
