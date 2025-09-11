import React from "react";

export default function ChatHeader({ roomName, roomId }) {
  return (
    <div className="p-4 border-b bg-[#122670] flex justify-between items-center">
      <div className="flex items-center ml-2">
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=${roomName}`}
          alt="User"
          className="w-12 h-12 rounded-full"
        />
        <span className="text-xl text-white ml-5">
          {roomName || "No Room Selected"}
        </span>
        <span className="ml-2 w-2 h-2 bg-green-400 rounded-full inline-block"></span>
      </div>
      <div></div>
    </div>
  );
}
