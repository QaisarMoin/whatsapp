import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // WhatsApp Business API message ID
  id: {
    type: String,
    required: true,
    unique: true
  },
  // Meta message ID (for status updates)
  meta_msg_id: {
    type: String,
    index: true
  },
  // WhatsApp user ID (phone number)
  wa_id: {
    type: String,
    required: true,
    index: true
  },
  // Message type (text, image, etc.)
  type: {
    type: String,
    required: true
  },
  // Message content (text, media URL, etc.)
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Message status (sent, delivered, read, received)
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'received'],
    default: 'sent'
  },
  // Direction (inbound or outbound)
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Contact information
  contact: {
    name: String,
    phone: String,
    profile_picture: String
  }
}, { timestamps: true });

// Create indexes for efficient querying
messageSchema.index({ wa_id: 1, timestamp: -1 });
messageSchema.index({ id: 1 }, { unique: true });
messageSchema.index({ meta_msg_id: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;