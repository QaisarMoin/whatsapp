import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ProcessedMessage from '../models/ProcessedMessage.js';

// Process incoming webhook payload
export const processWebhook = async (req, res) => {
  try {
    const payload = req.body;
    
    // Validate payload
    if (!payload || !payload.entry || !Array.isArray(payload.entry)) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }
    
    // Generate a unique ID for the processed message
    const _id = `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new processed message with the entire webhook payload
    const processedMessage = new ProcessedMessage({
      _id,
      payload_type: "whatsapp_webhook",
      metadata: payload,
      entry: payload.entry,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      executed: true
    });
    
    // Save the processed message
    await processedMessage.save();
    
    // Process messages and statuses for real-time updates
    for (const entry of payload.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;
      
      for (const change of entry.changes) {
        if (!change.value) continue;
        
        // Process messages for real-time updates
        if (change.value.messages && Array.isArray(change.value.messages)) {
          for (const message of change.value.messages) {
            await emitMessageUpdate(message, change.value.contacts, req.app.get('io'));
          }
        }
        
        // Process statuses for real-time updates
        if (change.value.statuses && Array.isArray(change.value.statuses)) {
          for (const status of change.value.statuses) {
            await emitStatusUpdate(status, req.app.get('io'));
          }
        }
      }
    }
    
    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

// Emit real-time updates for a message
const emitMessageUpdate = async (message, contacts, io) => {
  try {
    // Extract message data
    const { id, from, timestamp, type } = message;
    
    // Find contact information
    const contact = contacts?.find(c => c.wa_id === from);
    const contactInfo = contact?.profile ? {
      name: contact.profile.name,
      phone: from
    } : { phone: from };
    
    // Extract message content based on type
    let content;
    switch (type) {
      case 'text':
        content = { text: message.text.body };
        break;
      case 'image':
        content = { 
          caption: message.image.caption,
          url: message.image.url
        };
        break;
      case 'audio':
        content = { url: message.audio.url };
        break;
      case 'video':
        content = { 
          caption: message.video.caption,
          url: message.video.url
        };
        break;
      case 'document':
        content = { 
          filename: message.document.filename,
          url: message.document.url
        };
        break;
      case 'location':
        content = { 
          latitude: message.location.latitude,
          longitude: message.location.longitude,
          name: message.location.name,
          address: message.location.address
        };
        break;
      default:
        content = { raw: message };
    }
    
    // Create a formatted message object for the Socket.io event
    const formattedMessage = {
      id,
      wa_id: from,
      type,
      content,
      status: 'received',
      direction: 'inbound',
      timestamp: new Date(parseInt(timestamp) * 1000),
      contact: contactInfo
    };
    
    // Emit the new message via Socket.io
    if (io) {
      io.emit('new_message', formattedMessage);
      io.emit('conversation_updated', { wa_id: from });
    }
    
    return formattedMessage;
  } catch (error) {
    console.error('Error emitting message update:', error);
    throw error;
  }
};

// Emit real-time updates for a status update
const emitStatusUpdate = async (status, io) => {
  try {
    const { id, status: statusType, recipient_id } = status;
    
    // Map WhatsApp status to our status
    const mappedStatus = {
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed'
    }[statusType] || 'sent';
    
    // Find the message in processed messages
    const processedMessage = await ProcessedMessage.findOne({
      'entry.changes.value.messages.id': id
    });
    
    if (!processedMessage) {
      console.warn(`Message not found for status update: ${id}`);
    }
    
    // Emit the status update via Socket.io
    if (io) {
      io.emit('message_status_update', {
        id,
        status: mappedStatus
      });
    }
    
    return { id, status: mappedStatus };
  } catch (error) {
    console.error('Error emitting status update:', error);
    throw error;
  }
};