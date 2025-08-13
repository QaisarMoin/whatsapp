import mongoose from 'mongoose';

// This schema is designed to match the structure of processed webhook messages
const processedMessageSchema = new mongoose.Schema({
  // Fields based on the webhook payload structure
  _id: {
    type: String,
    required: true
  },
  payload_type: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  entry: [{
    id: String,
    changes: [{
      value: {
        messaging_product: String,
        metadata: mongoose.Schema.Types.Mixed,
        contacts: [{
          profile: {
            name: String
          },
          wa_id: String
        }],
        messages: [{
          from: String,
          id: String,
          timestamp: String,
          type: String,
          text: {
            body: String
          },
          image: mongoose.Schema.Types.Mixed,
          audio: mongoose.Schema.Types.Mixed,
          video: mongoose.Schema.Types.Mixed,
          document: mongoose.Schema.Types.Mixed,
          location: mongoose.Schema.Types.Mixed
        }],
        statuses: [{
          id: String,
          recipient_id: String,
          status: String,
          timestamp: String,
          conversation: mongoose.Schema.Types.Mixed,
          pricing: mongoose.Schema.Types.Mixed
        }]
      },
      field: String
    }]
  }],
  createdAt: {
    type: String
  },
  startedAt: {
    type: String
  },
  completedAt: {
    type: String
  },
  executed: {
    type: Boolean
  }
}, { 
  // Disable automatic timestamps since we're using the ones from the webhook
  timestamps: false,
  // This tells Mongoose not to add __v field
  versionKey: false,
  // This tells Mongoose to use the existing _id instead of generating a new one
  _id: false,
  // This tells Mongoose to use the exact collection name without pluralizing
  collection: 'processed_messages'
});

const ProcessedMessage = mongoose.model('ProcessedMessage', processedMessageSchema);

export default ProcessedMessage;