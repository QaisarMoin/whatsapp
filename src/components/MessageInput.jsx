import React, { useState } from 'react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-[#202c33] p-3">
      <form onSubmit={handleSubmit} className="flex items-center">
        {/* Emoji Button */}
        <button
          type="button"
          className="text-[#8696a0] hover:text-[#aebac1] focus:outline-none mr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Attachment Button */}
        <button
          type="button"
          className="text-[#8696a0] hover:text-[#aebac1] focus:outline-none mr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        {/* Input Field */}
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 py-2 px-4 bg-[#2a3942] text-[#e9edef] rounded-lg focus:outline-none placeholder-[#8696a0]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        {/* Send Button */}
        <button
          type="submit"
          className={`ml-2 p-2 rounded-full focus:outline-none ${
            message.trim() ? 'text-[#00a884]' : 'text-[#8696a0]'
          }`}
          disabled={!message.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;