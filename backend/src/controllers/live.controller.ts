import { Request, Response } from 'express';
import { liveService } from '../services';
import { AuthRequest } from '../middleware/auth.middleware';
import { getParamString } from '../utils/params';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await liveService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getActiveStreams = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string | undefined;
    const streams = await liveService.getActiveStreams(limit, category);
    res.status(200).json(streams);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getDiscoveryStreams = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string | undefined;
    const streams = await liveService.getDiscoveryStreams(limit, category);
    res.status(200).json({ streams });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getFollowingStreams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const streams = await liveService.getFollowingStreams(userId);
    res.status(200).json({ streams });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getStream = async (req: Request, res: Response): Promise<void> => {
  try {
    const streamId = getParamString(req.params.streamId);
    const stream = await liveService.getStream(streamId);
    res.status(200).json(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(404).json({ error: message });
  }
};

export const getStreamChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const streamId = getParamString(req.params.streamId);
    const messages = await liveService.getStreamChat(streamId);
    res.status(200).json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const startStream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user?.userId;
    const { title, category, description, thumbnailUrl, allowGifts, allowPK } = req.body;

    if (!hostId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!title || !category) {
      res.status(400).json({ error: 'Title and category are required' });
      return;
    }

    const stream = await liveService.startStream(hostId, title, category, description, thumbnailUrl, allowGifts, allowPK);
    res.status(201).json({ message: 'Live stream started', stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const joinStream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const streamId = getParamString(req.params.streamId);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const viewers = await liveService.joinStream(streamId, userId);
    res.status(200).json({ streamId, viewers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const leaveStream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const streamId = getParamString(req.params.streamId);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const viewers = await liveService.leaveStream(streamId, userId);
    res.status(200).json({ streamId, viewers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const streamId = getParamString(req.params.streamId);
    const { message } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const chatMessage = await liveService.postChatMessage(streamId, userId, message.trim());
    res.status(201).json({ chatMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const followStreamer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user?.userId;
    const streamId = getParamString(req.params.streamId);

    if (!followerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stream = await liveService.getStream(streamId);
    const follow = await liveService.followStreamer(stream.hostId, followerId);
    res.status(200).json({ follow });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const endStream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user?.userId;
    const streamId = getParamString(req.params.streamId);

    if (!hostId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stream = await liveService.endStream(streamId, hostId);
    res.status(200).json({ message: 'Live stream ended', stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getStreamHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!hostId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const streams = await liveService.getStreamHistory(hostId, limit);
    res.status(200).json(streams);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getHostStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user?.userId;
    if (!hostId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await liveService.getHostStats(hostId);
    res.status(200).json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};
