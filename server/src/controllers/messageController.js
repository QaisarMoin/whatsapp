import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import ProcessedMessage from "../models/ProcessedMessage.js";
import { Server } from "socket.io";

// Delete a message by ID
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log("Attempting to delete message with ID:", messageId); // Debug log

    // First try to find the message to get its type
    const message =
      (await Message.findById(messageId)) ||
      (await ProcessedMessage.findById(messageId));

    if (!message) {
      // If not found by _id, try to find by id field
      const messageByWaId =
        (await Message.findOne({ id: messageId })) ||
        (await ProcessedMessage.findOne({ id: messageId }));

      if (!messageByWaId) {
        console.log("Message not found with either _id or id:", messageId); // Debug log
        return res.status(404).json({ message: "Message not found" });
      }

      // Delete the found message
      if (messageByWaId instanceof Message) {
        await Message.deleteOne({ id: messageId });
      } else {
        await ProcessedMessage.deleteOne({ id: messageId });
      }
    } else {
      // Delete the found message
      if (message instanceof Message) {
        await Message.findByIdAndDelete(messageId);
      } else {
        await ProcessedMessage.findByIdAndDelete(messageId);
      }
    }

    console.log("Message deleted successfully:", messageId); // Debug log
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
      // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all messages for a specific conversation (wa_id)
export const getMessagesByWaId = async (req, res) => {
  try {
    const { wa_id } = req.params;

    // Get messages from the Message model (outbound messages)
    const outboundMessages = await Message.find({
      wa_id: wa_id,
      direction: "outbound",
    }).lean();

    // Find all processed messages (inbound messages)
    const processedMessages = await ProcessedMessage.find().lean();

    // Extract and format inbound messages for the specified wa_id
    const inboundMessages = [];

    for (const processed of processedMessages) {
      // Check for both metaData and direct entry structures
      const entries = [];

      // Check for metaData.entry structure
      if (
        processed.metaData &&
        processed.metaData.entry &&
        Array.isArray(processed.metaData.entry)
      ) {
        entries.push(...processed.metaData.entry);
      }

      // Check for direct entry structure
      if (processed.entry && Array.isArray(processed.entry)) {
        entries.push(...processed.entry);
      }

      if (entries.length === 0) {
        continue;
      }

      for (const entry of entries) {
        if (!entry.changes || !Array.isArray(entry.changes)) {
          continue;
        }

        for (const change of entry.changes) {
          if (!change.value) {
            continue;
          }

          // Check for messages
          if (change.value.messages && Array.isArray(change.value.messages)) {
            // Filter messages for the specified wa_id
            const relevantMessages = change.value.messages.filter(
              (msg) => msg.from === wa_id || msg.to === wa_id
            );

            for (const msg of relevantMessages) {
              // Find contact info if available
              let contactInfo = { phone: wa_id };
              if (
                change.value.contacts &&
                Array.isArray(change.value.contacts)
              ) {
                const contact = change.value.contacts.find(
                  (c) => c.wa_id === wa_id
                );
                if (contact && contact.profile) {
                  contactInfo = {
                    name: contact.profile.name,
                    phone: wa_id,
                  };
                }
              }

              // Extract content based on message type
              let content;
              switch (msg.type) {
                case "text":
                  content = { text: msg.text?.body };
                  break;
                case "image":
                  content = {
                    caption: msg.image?.caption,
                    url: msg.image?.url,
                  };
                  break;
                case "audio":
                  content = { url: msg.audio?.url };
                  break;
                case "video":
                  content = {
                    caption: msg.video?.caption,
                    url: msg.video?.url,
                  };
                  break;
                case "document":
                  content = {
                    filename: msg.document?.filename,
                    url: msg.document?.url,
                  };
                  break;
                case "location":
                  content = {
                    latitude: msg.location?.latitude,
                    longitude: msg.location?.longitude,
                    name: msg.location?.name,
                    address: msg.location?.address,
                  };
                  break;
                default:
                  content = { raw: msg };
              }

              // Determine message direction
              const direction = msg.from === wa_id ? "inbound" : "outbound";

              // Create formatted message object
              inboundMessages.push({
                id: msg.id,
                wa_id: msg.from === wa_id ? msg.from : wa_id,
                type: msg.type,
                content: content,
                status: direction === "inbound" ? "received" : "sent",
                direction,
                timestamp: new Date(parseInt(msg.timestamp) * 1000),
                contact: contactInfo,
              });
            }
          }
        }
      }
    }

    // Combine inbound and outbound messages
    const allMessages = [...inboundMessages, ...outboundMessages];

    // Sort messages by timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    res.status(200).json(allMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// Send a new message (demo - only saves to DB, doesn't actually send)
export const sendMessage = async (req, res) => {
  try {
    const { wa_id, content } = req.body;

    if (!wa_id || !content) {
      return res
        .status(400)
        .json({ message: "wa_id and content are required" });
    }

    // Generate a unique ID for the message
    const id = `demo_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const timestamp = new Date();

    // Create a new message using the Message model
    const newMessage = new Message({
      id: id,
      wa_id: wa_id,
      type: "text",
      content: { text: content },
      status: "sent",
      direction: "outbound",
      timestamp: timestamp,
      contact: { phone: wa_id },
    });

    // Save the message
    await newMessage.save();

    // Emit the new message via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("new_message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["sent", "delivered", "read", "failed"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    // First try to find and update the message in the Message model
    const message = await Message.findOne({ id }).lean();

    if (message) {
      // Update the message status
      await Message.updateOne({ id }, { status });

      // Create a response object
      const updatedMessage = { id, status };

      // Emit the status update via Socket.io
      const io = req.app.get("io");
      if (io) {
        io.emit("message_status_update", updatedMessage);
      }

      return res.status(200).json(updatedMessage);
    }

    // If not found in Message model, check ProcessedMessage collection
    const processedMessage = await ProcessedMessage.findOne({
      $or: [
        { "metaData.entry.changes.value.messages.id": id },
        { "entry.changes.value.messages.id": id },
      ],
    });

    if (!processedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Create a status update
    const updatedMessage = { id, status };

    // Emit the status update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("message_status_update", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error updating message status:", error);
    res
      .status(500)
      .json({ message: "Error updating message status", error: error.message });
  }
};
