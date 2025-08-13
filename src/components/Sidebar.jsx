import React from 'react';
import { useState } from 'react';

const Sidebar = ({ conversations, selectedConversation, onSelectConversation, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const contactName = conversation.contact?.name || '';
    const contactPhone = conversation.contact?.phone || conversation.wa_id || '';
    const lastMessage = conversation.last_message?.content?.text || '';
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      contactName.toLowerCase().includes(searchLower) ||
      contactPhone.includes(searchLower) ||
      lastMessage.toLowerCase().includes(searchLower)
    );
  });

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Format last message preview
  const formatLastMessage = (lastMessage) => {
    if (!lastMessage || !lastMessage.content) return '';
    
    if (lastMessage.content.text) {
      return lastMessage.content.text.length > 40
        ? `${lastMessage.content.text.substring(0, 40)}...`
        : lastMessage.content.text;
    } else if (lastMessage.content.caption) {
      return `📷 ${lastMessage.content.caption || 'Photo'}`;
    } else if (lastMessage.content.url) {
      if (lastMessage.type === 'image') return '📷 Photo';
      if (lastMessage.type === 'video') return '🎥 Video';
      if (lastMessage.type === 'audio') return '🎵 Audio';
      if (lastMessage.type === 'document') return '📄 Document';
    } else if (lastMessage.content.latitude) {
      return '📍 Location';
    }
    
    return 'New message';
  };

  return (
    <div className="w-1/3 flex flex-col bg-[#111b21] text-white">
      {/* Header */}
      <div className="bg-[#202c33] p-3 flex items-center justify-between">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-[#111b21] font-bold">
          {/* User avatar placeholder */}
          U
        </div>
        <div className="flex space-x-4 text-[#aebac1]">
          <button className="focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button className="focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-2 bg-[#111b21]">
        <div className="relative bg-[#202c33] rounded-lg flex items-center">
          <div className="absolute left-3 text-[#aebac1]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full py-2 px-4 pl-10 bg-transparent text-white placeholder-[#aebac1] focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-[#111b21]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-[#aebac1]">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.wa_id}
              className={`flex items-center p-3 border-b border-[#222d34] cursor-pointer hover:bg-[#202c33] ${
                selectedConversation?.wa_id === conversation.wa_id ? 'bg-[#2a3942]' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-[#6a7175] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                {conversation.contact?.name ? conversation.contact.name.charAt(0).toUpperCase() : '#'}
              </div>
              
              {/* Conversation Info */}
              <div className="flex-1 min-w-0 border-b border-[#222d34] pb-3">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-[15px] font-medium truncate text-white">
                    {conversation.contact?.name || conversation.wa_id}
                  </h2>
                  <span className="text-xs text-[#8696a0]">
                    {formatTimestamp(conversation.last_activity)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#8696a0] truncate">
                    {formatLastMessage(conversation.last_message)}
                  </p>
                  {conversation.unread_count > 0 && (
                    <span className="bg-[#00a884] text-[#111b21] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;