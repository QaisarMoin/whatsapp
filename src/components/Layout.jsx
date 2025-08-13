import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import io from 'socket.io-client';
import { BACKEND_URL } from '../config';
const socket = io(BACKEND_URL);

const Layout = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/conversations`);
        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/messages/conversation/${selectedConversation.wa_id}`);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Listen for new messages via Socket.io
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    socket.on('new_message', (message) => {
      // Add new message to the messages array only if it's from another user
      // and belongs to the selected conversation
      if (selectedConversation && 
          message.wa_id === selectedConversation.wa_id && 
          message.direction === 'inbound') {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      // Update the conversations list
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.wa_id === message.wa_id
        );

        if (conversationIndex !== -1) {
          // Update existing conversation
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            last_message: {
              content: message.content,
              timestamp: message.timestamp
            },
            last_activity: message.timestamp,
            unread_count: selectedConversation && selectedConversation.wa_id === message.wa_id
              ? 0
              : (updatedConversations[conversationIndex].unread_count || 0) + 1
          };
        } else {
          // Add new conversation
          updatedConversations.push({
            wa_id: message.wa_id,
            contact: message.contact,
            last_message: {
              content: message.content,
              timestamp: message.timestamp
            },
            last_activity: message.timestamp,
            unread_count: 1
          });
        }

        // Sort conversations by last activity
        return updatedConversations.sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      });
    });

    socket.on('message_status_update', (update) => {
      // Update message status
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === update.id ? { ...msg, status: update.status } : msg
        )
      );
    });

    socket.on('conversation_updated', (update) => {
      // Update conversation in the list
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.wa_id === update.wa_id
        );

        if (conversationIndex !== -1) {
          // Fetch the updated conversation
          fetch(`${BACKEND_URL}/api/conversations/${update.wa_id}`)
            .then(response => response.json())
            .then(data => {
              setConversations((prevConvs) => {
                const updated = [...prevConvs];
                const index = updated.findIndex(c => c.wa_id === update.wa_id);
                if (index !== -1) {
                  updated[index] = data;
                }
                return updated;
              });
            })
            .catch(error => console.error('Error fetching updated conversation:', error));
        }

        return updatedConversations;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('new_message');
      socket.off('message_status_update');
      socket.off('conversation_updated');
    };
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read
    if (conversation.unread_count > 0) {
      fetch(`${BACKEND_URL}/api/conversations/${conversation.wa_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unread_count: 0 }),
      })
        .then(response => response.json())
        .then(data => {
          // Update conversation in the list
          setConversations((prevConversations) => 
            prevConversations.map((conv) => 
              conv.wa_id === conversation.wa_id ? { ...conv, unread_count: 0 } : conv
            )
          );
        })
        .catch(error => console.error('Error marking conversation as read:', error));
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wa_id: selectedConversation.wa_id,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Add outbound messages directly to the UI
      if (newMessage.direction === 'outbound') {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
      
      // Update the conversation in the list
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.wa_id === selectedConversation.wa_id
        );

        if (conversationIndex !== -1) {
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            last_message: {
              content: { text: content.trim() },
              timestamp: new Date().toISOString()
            },
            last_activity: new Date().toISOString()
          };
        }

        // Sort conversations by last activity
        return updatedConversations.sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#111b21]">
      <Sidebar 
        conversations={conversations} 
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        loading={loading}
      />
      <Chat 
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Layout;