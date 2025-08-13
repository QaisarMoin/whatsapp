import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ProcessedMessage from '../models/ProcessedMessage.js';

// Helper function to extract message content based on type
const extractMessageContent = (msg) => {
  let content;
  switch (msg.type) {
    case 'text':
      content = { text: msg.text?.body };
      break;
    case 'image':
      content = {
        caption: msg.image?.caption,
        url: msg.image?.url
      };
      break;
    case 'audio':
      content = { url: msg.audio?.url };
      break;
    case 'video':
      content = {
        caption: msg.video?.caption,
        url: msg.video?.url
      };
      break;
    case 'document':
      content = {
        filename: msg.document?.filename,
        url: msg.document?.url
      };
      break;
    case 'location':
      content = {
        latitude: msg.location?.latitude,
        longitude: msg.location?.longitude,
        name: msg.location?.name,
        address: msg.location?.address
      };
      break;
    default:
      content = { raw: msg };
  }
  return content;
};

// Get all conversations
export const getAllConversations = async (req, res) => {
  try {
    // Find all processed messages
    const processedMessages = await ProcessedMessage.find().lean();
    
    // Extract unique wa_ids and organize conversation data
    const conversationsMap = {};
    
    processedMessages.forEach(processed => {
      // Check if the document has the expected structure in metaData
      if (processed.metaData && processed.metaData.entry && Array.isArray(processed.metaData.entry)) {
        processed.metaData.entry.forEach(entry => {
          if (entry.changes && Array.isArray(entry.changes)) {
            entry.changes.forEach(change => {
              if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
                change.value.messages.forEach(msg => {
                  const wa_id = msg.from;
                  
                  // Skip if not a user message (e.g., business messages)
                  if (!wa_id || wa_id === '918329446654') return;
                  
                  // Find contact info if available
                  let contactInfo = { phone: wa_id };
                  if (change.value.contacts && Array.isArray(change.value.contacts)) {
                    const contact = change.value.contacts.find(c => c.wa_id === wa_id);
                    if (contact && contact.profile) {
                      contactInfo = {
                        name: contact.profile.name,
                        phone: wa_id
                      };
                    }
                  }
                  
                  // Extract content based on message type
                  const content = extractMessageContent(msg);
                  const timestamp = new Date(parseInt(msg.timestamp) * 1000);
                  
                  // Create or update conversation
                  if (!conversationsMap[wa_id] || new Date(conversationsMap[wa_id].last_activity) < timestamp) {
                    conversationsMap[wa_id] = {
                      wa_id,
                      contact: contactInfo,
                      last_message: {
                        id: msg.id,
                        content,
                        timestamp
                      },
                      last_activity: timestamp,
                      unread_count: 0 // We'll calculate this separately
                    };
                  }
                });
              }
            });
          }
        });
      }
    });
    
    // Convert map to array and sort by last activity
    const conversations = Object.values(conversationsMap).sort((a, b) =>
      new Date(b.last_activity) - new Date(a.last_activity)
    );
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Get a specific conversation by wa_id
export const getConversationByWaId = async (req, res) => {
  try {
    const { wa_id } = req.params;
    
    // Get the conversation data using the helper function
    const conversationData = await getConversationData(wa_id);
    
    if (!conversationData.foundMessages) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Construct the conversation object
    const conversation = {
      wa_id,
      contact: conversationData.contactInfo,
      last_message: conversationData.lastMessage,
      last_activity: conversationData.lastActivity,
      unread_count: 0
    };
    
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

// Update conversation (e.g., mark as read)
export const updateConversation = async (req, res) => {
  try {
    const { wa_id } = req.params;
    const updates = req.body;
    
    // Get the conversation data using the helper function
    const conversationData = await getConversationData(wa_id);
    
    if (!conversationData.foundMessages) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Construct the conversation object with updates
    const updatedConversation = {
      wa_id,
      contact: updates.contact || conversationData.contactInfo,
      last_message: conversationData.lastMessage,
      last_activity: conversationData.lastActivity,
      unread_count: updates.unread_count || 0
    };
    
    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Error updating conversation', error: error.message });
  }
};

// Helper function to get conversation data
async function getConversationData(wa_id) {
  // Find all processed messages
  const processedMessages = await ProcessedMessage.find().lean();
  
  if (!processedMessages || processedMessages.length === 0) {
    throw new Error('No processed messages found');
  }
  
  // Extract contact info and messages for this wa_id
  let contactInfo = { phone: wa_id };
  let lastActivity = null;
  let lastMessage = null;
  let foundMessages = false;
  
  for (const processed of processedMessages) {
    if (processed.metaData && processed.metaData.entry && Array.isArray(processed.metaData.entry)) {
      for (const entry of processed.metaData.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.value) {
              // Check for contact info
              if (change.value.contacts && Array.isArray(change.value.contacts)) {
                const contact = change.value.contacts.find(c => c.wa_id === wa_id);
                if (contact && contact.profile) {
                  contactInfo = {
                    name: contact.profile.name,
                    phone: wa_id
                  };
                }
              }
              
              // Check for messages
              if (change.value.messages && Array.isArray(change.value.messages)) {
                for (const msg of change.value.messages) {
                  if (msg.from === wa_id || msg.to === wa_id) {
                    foundMessages = true;
                    const timestamp = new Date(parseInt(msg.timestamp) * 1000);
                    
                    if (!lastActivity || timestamp > lastActivity) {
                      lastActivity = timestamp;
                      const content = extractMessageContent(msg);
                      
                      lastMessage = {
                        id: msg.id,
                        content,
                        timestamp
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return { wa_id, contactInfo, lastActivity, lastMessage, foundMessages };
}

// Get conversation statistics
export const getConversationStats = async (req, res) => {
  try {
    // Find all processed messages
    const processedMessages = await ProcessedMessage.find().lean();
    
    // Extract unique wa_ids and count messages
    const waIds = new Set();
    let totalMessages = 0;
    const messageCountByWaId = {};
    
    // Process all messages in a single loop
    for (const processed of processedMessages) {
      if (processed.metaData && processed.metaData.entry && Array.isArray(processed.metaData.entry)) {
        for (const entry of processed.metaData.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
                for (const msg of change.value.messages) {
                  const wa_id = msg.from;
                  
                  if (wa_id && wa_id !== '918329446654') {
                    waIds.add(wa_id);
                    messageCountByWaId[wa_id] = (messageCountByWaId[wa_id] || 0) + 1;
                  }
                  
                  totalMessages++;
                }
              }
            }
          }
        }
      }
    }
    
    // Find most active wa_id
    let mostActiveWaId = null;
    let mostActiveMessageCount = 0;
    
    Object.entries(messageCountByWaId).forEach(([wa_id, count]) => {
      if (count > mostActiveMessageCount) {
        mostActiveWaId = wa_id;
        mostActiveMessageCount = count;
      }
    });
    
    const stats = {
      totalConversations: waIds.size,
      totalMessages,
      unreadConversations: 0,
      mostActiveWaId,
      mostActiveMessageCount
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching conversation stats:', error);
    res.status(500).json({ message: 'Error fetching conversation stats', error: error.message });
  }
};