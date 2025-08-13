import React from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const Message = ({ message, onDelete, isMobile }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    try {
      // Get the correct message ID
      const messageId = message._id || message.id;
      if (!messageId) {
        console.error("No message ID found:", message);
        return;
      }

      console.log("Deleting message with ID:", messageId); // Debug log

      const response = await fetch(`${BACKEND_URL}/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Call onDelete with the same ID that was used for deletion
        onDelete(messageId);
        console.log("Message deleted successfully"); // Debug log
      } else {
        // Try to get error details if possible
        let errorMessage = "Failed to delete message";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        console.error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };
  const isOutgoing = message.direction === "outbound";

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (!isOutgoing) return null;

    switch (message.status) {
      case "sent":
        return (
          <svg
            className="w-3.5 h-3.5 text-[#8696a0] ml-1"
            viewBox="0 0 16 15"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
          </svg>
        );
      case "delivered":
        return (
          <svg
            className="w-3.5 h-3.5 text-[#8696a0] ml-1"
            viewBox="0 0 16 15"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.36.12.486-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
          </svg>
        );
      case "read":
        return (
          <svg
            className="w-3.5 h-3.5 text-[#53bdeb] ml-1"
            viewBox="0 0 16 15"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.36.12.486-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-3.5 h-3.5 text-red-500 ml-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render message content based on type
  const renderContent = () => {
    switch (message.type) {
      case "text":
        return (
          <p className="whitespace-pre-wrap break-words">
            {message.content.text}
          </p>
        );

      case "image":
        return (
          <div>
            <img
              src={message.content.url}
              alt="Image"
              className="rounded-md max-w-full max-h-60 mb-1"
            />
            {message.content.caption && <p>{message.content.caption}</p>}
          </div>
        );

      case "video":
        return (
          <div>
            <video
              src={message.content.url}
              controls
              className="rounded-md max-w-full max-h-60 mb-1"
            />
            {message.content.caption && <p>{message.content.caption}</p>}
          </div>
        );

      case "audio":
        return (
          <audio src={message.content.url} controls className="max-w-full" />
        );

      case "document":
        return (
          <div className="flex items-center">
            <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <a
              href={message.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              {message.content.filename || "Document"}
            </a>
          </div>
        );

      case "location":
        return (
          <div>
            <div className="bg-gray-200 rounded-md p-2 mb-1">
              <svg
                className="w-8 h-8 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="font-medium">{message.content.name || "Location"}</p>
            {message.content.address && (
              <p className="text-sm">{message.content.address}</p>
            )}
            <a
              href={`https://maps.google.com/?q=${message.content.latitude},${message.content.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600"
            >
              View on Google Maps
            </a>
          </div>
        );

      default:
        return <p>Unsupported message type</p>;
    }
  };

  return (
    <div
      className={`group flex mb-2 ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative px-2 py-1.5 rounded-lg max-w-[65%] ${
          isOutgoing
            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
        }`}
      >
        {/* Delete button */}
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={!showConfirm ? handleDeleteClick : undefined}
            className="p-1.5 rounded-full bg-[#182229] hover:bg-[#293942] transition-colors border border-[#00a884]/20 cursor-pointer"
            title="Delete message"
            type="button"
          >
            <svg
              className="w-3.5 h-3.5 text-[#00a884]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Delete confirmation dialog */}
        {showConfirm && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-20" onClick={handleCancelDelete} />

            {/* Dialog */}
            <div className="absolute z-30 top-0 right-0 -translate-y-full -translate-x-1 bg-[#2a3942] rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[200px]">
              <p className="text-sm text-[#e9edef]">Delete this message?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1 text-sm text-[#e9edef] hover:bg-[#ffffff1a] rounded"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
        {renderContent()}
        <div className="flex items-center justify-end text-[10px] text-[#8696a0] mt-1 min-w-[65px]">
          <span>{formatTime(message.timestamp)}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default Message;
