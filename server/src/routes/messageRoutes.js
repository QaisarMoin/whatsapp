import express from 'express';
import { getMessagesByWaId, sendMessage, updateMessageStatus, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

// Get all messages for a specific conversation (wa_id)
router.get('/conversation/:wa_id', getMessagesByWaId);

// Send a new message
router.post('/send', sendMessage);

// Update message status
router.patch('/status/:id', updateMessageStatus);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;