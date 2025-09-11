import React, { useEffect, useCallback, useState } from "react";
import axios from "axios";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./Chatheader";
export default function ChatArea({
  messages,
  onSend,
  headerProps,
  username,
  socket,
}) {
  // Load messages first
  const handleLoadMessages = useCallback(
    (loadedMessages) => {
      if (Array.isArray(loadedMessages)) {
        const newMessages = loadedMessages.map((msg) => ({
          user: msg.username || "Unknown",
          text: msg.message || (msg.file ? `File: ${msg.file.fileName}` : ""),
          time:
            msg.time ||
            new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          isMe: msg.username === username,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${
            msg.username || "Unknown"
          }`,
          file: msg.file
            ? { fileName: msg.file.fileName, fileUrl: msg.file.fileUrl }
            : null,
          _id: msg._id?.toString() || `fallback-${Date.now()}`,
          roomId: msg.roomId,
        }));
        onSend(null, newMessages);
      }
    },
    [username, onSend]
  );
  const [roomName, setRoomName] = useState("");

  // Get room name from roomid
  useEffect(() => {
    const fetchRoomName = async () => {
      if (!headerProps.roomId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/rooms/${headerProps.roomId}`
        );
        setRoomName(res.data.name);
      } catch (err) {
        console.error("Error fetching room name:", err);
      }
    };
    fetchRoomName();
  }, [headerProps.roomId]);

  // New message handler
  const handleNewMessage = useCallback(
    (msg) => {
      if (msg.roomId !== headerProps.roomId) return;

      const newMessage = {
        user: msg.username || "Unknown",
        text: msg.message || (msg.file ? `File: ${msg.file.fileName}` : ""),
        time:
          msg.time ||
          new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        isMe: msg.username === username,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${
          msg.username || "Unknown"
        }`,
        file: msg.file
          ? { fileName: msg.file.fileName, fileUrl: msg.file.fileUrl }
          : null,
        _id: msg._id?.toString() || `fallback-${Date.now()}`,
        roomId: msg.roomId,
      };

      
      if (msg.tempId) {
        onSend(null, (prev) =>
          prev.map((m) => (m._id === msg.tempId ? newMessage : m))
        );
      } else {
        onSend(null, [newMessage]);
      }
    },
    [username, onSend, headerProps.roomId]
  );

  useEffect(() => {
    if (!headerProps.roomId) return;

    // Load messs
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/rooms/${headerProps.roomId}/messages`
        );
        handleLoadMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();

    // Join room
    socket.emit("joinRoom", {
      roomId: headerProps.roomId,
      name: headerProps.name,
    });

    // Listen
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [headerProps.roomId, socket, handleNewMessage]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader roomId={headerProps.roomId} roomName={roomName} />
      <MessageList messages={messages} />

      <MessageInput
        onSend={onSend}
        socket={socket}
        username={username}
        roomId={headerProps.roomId}
      />
    </div>
  );
}
