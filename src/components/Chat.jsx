import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

const Chat = ({ conversation, messages, onSendMessage, setMessages }) => {
  const messagesEndRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleDeleteMessage = (messageId) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp for header
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'online';
    if (diffMins < 60) return `last seen ${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `last seen ${diffHours} hours ago`;
    
    return `last seen ${date.toLocaleDateString()}`;
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      let date;
      if (typeof message.timestamp === 'number') {
        // Handle timestamp as milliseconds
        date = new Date(message.timestamp);
      } else if (typeof message.timestamp === 'string') {
        // Handle ISO string or other date format
        date = new Date(message.timestamp);
      } else {
        // If timestamp is invalid, use current date
        date = new Date();
      }

      // Format date as YYYY-MM-DD to ensure consistent grouping
      const dateStr = date.toISOString().split('T')[0];
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Format date for message groups
  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format today's date
    const todayStr = now.toISOString().split('T')[0];
    // Format yesterday's date
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c1317]">
      {conversation ? (
        <>
          {/* Chat Header */}
          <div className="bg-[#202c33] p-3 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#6a7175] rounded-full flex items-center justify-center text-white mr-3">
                {conversation.contact?.name ? conversation.contact.name.charAt(0).toUpperCase() : '#'}
              </div>
              <div>
                <h2 className="font-medium text-white">
                  {conversation.contact?.name || conversation.wa_id}
                </h2>
                <p className="text-xs text-[#8696a0]">
                  {formatLastSeen(conversation.last_activity)}
                </p>
              </div>
            </div>
            <div className="flex space-x-4 text-[#aebac1]">
              <button className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4"
            style={{
              backgroundImage: "url('data:image/png;base64,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')",
              backgroundColor: "#0b141a"
            }}
          >
            {Object.keys(messageGroups).length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#8696a0]">
                No messages yet
              </div>
            ) : (
              Object.entries(messageGroups).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <div className="bg-[#182229] rounded-lg px-3 py-1 text-xs text-[#8696a0] shadow">
                      {formatMessageDate(date)}
                    </div>
                  </div>
                  {msgs.map((message) => (
                    <Message 
                      key={message._id || message.id} 
                      message={message} 
                      onDelete={handleDeleteMessage} 
                    />
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <MessageInput onSendMessage={onSendMessage} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#222e35]">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#aebac1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-light text-[#e9edef] mb-2">WhatsApp Web</h2>
            <p className="text-[#8696a0] mb-6">
              Select a chat to start messaging
            </p>
            <p className="text-[#8696a0] text-sm">
              End-to-end encrypted
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;