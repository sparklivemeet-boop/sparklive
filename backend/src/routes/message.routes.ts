import { Router } from 'express';
import { getConversations, getMessages, startConversation, sendMessage, markMessagesRead, searchMessages } from '../controllers/message.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:conversationId/search', searchMessages);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);
router.put('/:conversationId/read', markMessagesRead);

export default router;
