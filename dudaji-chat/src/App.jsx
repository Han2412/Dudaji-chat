import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Sidebar from "./component/Sidebar";
import ChatArea from "./component/ChatArea";
import Auth from "./component/Auth";
import "./index.css";

export default function App() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!username) return;

    const newSocket = io("http://localhost:5000", { query: { username } });

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("disconnect", () => console.log("Socket disconnected"));
    newSocket.on("connect_error", (err) => console.error("Socket error:", err));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [username]);

  const handleSend = (text, apiMessages = null) => {
    if (apiMessages) {
      setMessages((prev) => {
        const newMessages = apiMessages.map((msg) => ({
          user: msg.user || "Unknown",
          text: msg.text || (msg.file ? `File: ${msg.file.fileName}` : ""),
          time:
            msg.time ||
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }) ||
            "N/A",
          isMe: msg.user === username,
          avatar:
            msg.avatar ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${
              msg.user || "Unknown"
            }`,
          file: msg.file || null,
          _id: msg._id?.toString() || `fallback-${Date.now()}`,
          roomId: msg.roomId,
        }));
        const combined = [
          ...prev.filter((m) => !newMessages.some((nm) => nm._id === m._id)),
          ...newMessages,
        ];
     
        return combined;
      });
      return;
    }
    if (typeof text === "string" && text.trim() && selectedRoom) {
      console.log("Sending message:", { roomId: selectedRoom, message: text });
      socket.emit("chatMessage", { roomId: selectedRoom, message: text });
      setMessages((prev) => [
        ...prev,
        {
          user: username,
          text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          isMe: true,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${username}`,
          file: null,
          _id: `temp-${Date.now()}`,
          roomId: selectedRoom,
        },
      ]);
    } else {
      console.error("No room selected or invalid message:", {
        text,
        selectedRoom,
      });
    }
  };

  // const handleFileUpload = (file) => {
  //   if (!file || !selectedRoom) return;
  //   console.log("Uploading file:", file.name);
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     socket.emit("fileUpload", {
  //       roomId: selectedRoom,
  //       fileName: file.name,
  //       fileData: reader.result,
  //     });
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         user: username,
  //         text: `File: ${file.name}`,
  //         time: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //           hour12: false,
  //         }),
  //         isMe: true,
  //         avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${username}`,
  //         file: { fileName: file.name, fileData: reader.result },
  //         _id: `temp-${Date.now()}`,
  //         roomId: selectedRoom,
  //       },
  //     ]);
  //   };
  //   reader.readAsDataURL(file);
  // };

  return (
    <div className="flex h-screen bg-gray-300 text-black">
      {!username ? (
        <Auth setUsername={setUsername} /> // render login form khi username rỗng
      ) : !socket ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Đang kết nối...</p>
        </div>
      ) : (
        <>
          <Sidebar
            socket={socket}
            setSelectedRoom={setSelectedRoom}
            username={username}
            setMessages={setMessages}
          />
          {selectedRoom ? (
            <ChatArea
              socket={socket}
              username={username}
              messages={messages.filter((msg) => msg.roomId === selectedRoom)}
              onSend={handleSend}
              // onFileUpload={handleFileUpload}
              headerProps={{ roomId: selectedRoom, name: selectedRoom }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p>Vui lòng chọn một phòng chat</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
