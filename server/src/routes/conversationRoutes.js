import express from 'express';
import { 
  getAllConversations, 
  getConversationByWaId, 
  updateConversation,
  getConversationStats
} from '../controllers/conversationController.js';

const router = express.Router();

// Get all conversations
router.get('/', getAllConversations);

// Get conversation statistics
router.get('/stats', getConversationStats);

// Get a specific conversation by wa_id
router.get('/:wa_id', getConversationByWaId);

// Update conversation (e.g., mark as read)
router.patch('/:wa_id', updateConversation);

export default router;