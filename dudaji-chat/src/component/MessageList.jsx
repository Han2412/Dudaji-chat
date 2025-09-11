import React, { useEffect, useRef } from "react";

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);
 
  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentNode; // div overflow-y
    if (!container) return;

    const threshold = 150; // px khoảng cách gần cuối
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < threshold) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderFile = (file, text) => {
   
    if (!file || !file.fileUrl) return text || "No content";

    const ext = file.fileName?.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return (
        <img
          src={file.fileUrl}
          alt={file.fileName}
          className="max-w-full max-h-64 rounded"
        />
      );
    } else if (["mp4", "webm", "ogg"].includes(ext)) {
      return (
        <video controls className="max-w-full max-h-64 rounded">
          <source src={file.fileUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {text || `File: ${file.fileName || "Unknown"}`}
        </a>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div
            key={msg._id || `fallback-${index}-${Date.now()}`}
            className={`max-w-[60%] px-4 py-3 rounded-lg ${
              msg.isMe
                ? "bg-[#122670] self-end text-white"
                : "bg-gray-100 self-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <img
                src={
                  msg.avatar ||
                  "https://api.dicebear.com/9.x/initials/svg?seed=Unknown"
                }
                alt={msg.user || "Unknown"}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-bold">{msg.user || "Unknown"}</span>
            </div>

            <div>
              {msg.text && <p className="mb-2">{msg.text}</p>}{" "}
              {/* Hiển thị text nếu có */}
              {msg.file && renderFile(msg.file)} {/* Hiển thị file nếu có */}
            </div>

            <div
              className={`text-xs ${
                msg.isMe ? "text-gray-300" : "text-gray-500"
              } mt-1`}
            >
              {msg.time || "N/A"}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No messages yet</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
