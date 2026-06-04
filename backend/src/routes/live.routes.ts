import { Router } from 'express';
import {
  getActiveStreams,
  getCategories,
  getDiscoveryStreams,
  getStream,
  getStreamChat,
  startStream,
  joinStream,
  leaveStream,
  sendMessage,
  followStreamer,
  endStream,
  getFollowingStreams,
  getStreamHistory,
  getHostStats,
} from '../controllers/live.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/categories', getCategories);
router.get('/discover', getDiscoveryStreams);
router.get('/history', authenticateJWT, getStreamHistory);
router.get('/stats', authenticateJWT, getHostStats);
router.get('/following', authenticateJWT, getFollowingStreams);
router.get('/:streamId', getStream);
router.get('/:streamId/chat', getStreamChat);
router.get('/', getActiveStreams);

router.use(authenticateJWT);

router.post('/start', startStream);
router.post('/:streamId/join', joinStream);
router.post('/:streamId/leave', leaveStream);
router.post('/:streamId/message', sendMessage);
router.post('/:streamId/follow', followStreamer);
router.put('/:streamId/end', endStream);

export default router;
