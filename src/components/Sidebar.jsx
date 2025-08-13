import React from "react";
import { useState } from "react";

const Sidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  isMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    const contactName = conversation.contact?.name || "";
    const contactPhone =
      conversation.contact?.phone || conversation.wa_id || "";
    const lastMessage = conversation.last_message?.content?.text || "";

    const searchLower = searchQuery.toLowerCase();

    return (
      contactName.toLowerCase().includes(searchLower) ||
      contactPhone.includes(searchLower) ||
      lastMessage.toLowerCase().includes(searchLower)
    );
  });

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Format last message preview
  const formatLastMessage = (lastMessage) => {
    if (!lastMessage || !lastMessage.content) return "";

    if (lastMessage.content.text) {
      return lastMessage.content.text.length > 40
        ? `${lastMessage.content.text.substring(0, 40)}...`
        : lastMessage.content.text;
    } else if (lastMessage.content.caption) {
      return `📷 ${lastMessage.content.caption || "Photo"}`;
    } else if (lastMessage.content.url) {
      if (lastMessage.type === "image") return "📷 Photo";
      if (lastMessage.type === "video") return "🎥 Video";
      if (lastMessage.type === "audio") return "🎵 Audio";
      if (lastMessage.type === "document") return "📄 Document";
    } else if (lastMessage.content.latitude) {
      return "📍 Location";
    }

    return "New message";
  };

  return (
    <div
      className={`h-full flex flex-col ${
        isMobile ? "w-full" : "w-[400px] border-r border-[#222d34] "
      } bg-[#111b21]`}
    >
      {/* Header */}
      <div
        className={`${
          isMobile
            ? "flex items-center justify-between p-4 bg-[#00a884]"
            : "flex items-center justify-between p-4 bg-[#00a884]"
        }`}
      >
        <h1 className="text-white text-xl font-medium">WhatsApp</h1>
        <div className="flex items-center space-x-4 text-white">
          <button className="focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </button>
          <button
            className="focus:outline-none"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={`${
          showSearch || !isMobile ? "block" : "hidden"
        } p-3 bg-[#202c33]`}
      >
        <div className="relative ">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-[#202c33] text-white placeholder-[#8696a0] border border-[#222d34] rounded-lg py-2 px-10 focus:outline-none focus:border-[#00a884]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8696a0]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      {isMobile && (
        <div className="flex justify-between px-4 py-2 bg-[#111b21] border-b border-[#222d34]">
          <button className="text-white font-medium px-3">All</button>
          <button className="text-[#8696a0] px-3">Unread 99+</button>
          <button className="text-[#8696a0] px-3">Groups</button>
          <button className="text-[#8696a0] px-3">+</button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-[#0c1317]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#8696a0]">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#8696a0]">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.wa_id}
              className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#202c33] border-b border-[#222d34] ${
                selectedConversation?.wa_id === conversation.wa_id
                  ? "bg-[#2a3942]"
                  : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-[#6a7175] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                {conversation.contact?.name
                  ? conversation.contact.name.charAt(0).toUpperCase()
                  : "#"}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-[17px] font-medium truncate text-[#e9edef]">
                    {conversation.contact?.name || conversation.wa_id}
                  </h2>
                  <span className="text-xs text-[#8696a0] ml-2">
                    {formatTimestamp(conversation.last_activity)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center text-[#8696a0] max-w-[85%]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 8.586l-2.293-2.293z" />
                    </svg>
                    <p className="text-[13px] truncate">
                      {formatLastMessage(conversation.last_message)}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="bg-[#25d366] text-[#111b21] text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-medium ml-2 flex-shrink-0">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <div className="grid grid-cols-4 py-2 bg-[#1f2c33] border-t border-[#222d34]">
          <button className="text-[#00a884] flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button className="text-[#8696a0] flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="text-xs mt-1">Updates</span>
          </button>
          <button className="text-[#8696a0] flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xs mt-1">Communities</span>
          </button>
          <button className="text-[#8696a0] flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-xs mt-1">Calls</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
