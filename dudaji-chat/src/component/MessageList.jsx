import React from "react";
export default function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`max-w-[60%] px-4 py-3 rounded-lg ${msg.isMe ? "bg-indigo-500 self-end" : "bg-gray-700 self-start"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <img src={msg.avatar} alt={msg.user} className="w-7 h-7 rounded-full" />
            <span className="font-bold">{msg.user}</span>
          </div>
          <div>{msg.text}</div>
          <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
        </div>
      ))}
    </div>
  );
}