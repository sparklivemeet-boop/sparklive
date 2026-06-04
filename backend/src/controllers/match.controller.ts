import { Request, Response } from 'express';
import { matchService } from '../services';
import { AuthRequest } from '../middleware/auth.middleware';
import { getParamString } from '../utils/params';

export const discover = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const users = await matchService.discover(userId, limit);
    res.status(200).json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const swipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const swiperId = req.user?.userId;
    const { targetId, direction } = req.body;

    if (!swiperId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!targetId || !direction) {
      res.status(400).json({ error: 'targetId and direction are required' });
      return;
    }

    if (!['like', 'pass'].includes(direction)) {
      res.status(400).json({ error: 'Direction must be like or pass' });
      return;
    }

    const result = await matchService.swipe(swiperId, targetId, direction as 'like' | 'pass');
    res.status(200).json({
      message: 'Swiped',
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const matches = await matchService.getMatches(userId);
    res.status(200).json(matches);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const matchId = getParamString(req.params.matchId);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await matchService.deleteMatch(matchId, userId);
    res.status(200).json({ message: 'Match deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const getLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const likes = await matchService.getLikes(userId);
    res.status(200).json(likes);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};

export const respondToLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const likeId = getParamString(req.params.likeId);
    const { accept } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (accept === undefined) {
      res.status(400).json({ error: 'accept is required' });
      return;
    }

    const response = await matchService.respondToLike(likeId, userId, accept);
    res.status(200).json({
      message: accept ? 'Like accepted' : 'Like rejected',
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};
