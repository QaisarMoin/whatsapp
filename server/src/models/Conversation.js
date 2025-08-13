import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  // WhatsApp user ID (phone number)
  wa_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Contact information
  contact: {
    name: String,
    phone: String,
    profile_picture: String
  },
  // Last message in the conversation
  last_message: {
    type: mongoose.Schema.Types.Mixed
  },
  // Unread message count
  unread_count: {
    type: Number,
    default: 0
  },
  // Last activity timestamp
  last_activity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;