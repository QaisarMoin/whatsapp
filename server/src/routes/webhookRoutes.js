import express from 'express';
import { processWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Process incoming webhook
router.post('/', processWebhook);

// Webhook verification endpoint (for WhatsApp Business API setup)
router.get('/', (req, res) => {
  // Get the Verify Token (should match the one configured in WhatsApp Business API)
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_webhook_token';
  
  // Parse params from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verifyToken) {
      // Respond with 200 OK and challenge token
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Return a '400 Bad Request' if required parameters are missing
    res.sendStatus(400);
  }
});

export default router;