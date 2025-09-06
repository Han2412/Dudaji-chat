import React, { useState } from "react";
import Sidebar from "./component/Sidebar";
import ChatArea from "./component/ChatArea";
import "./index.css";

const messagesData = [
  {
    user: "Doris Brown",
    text: "Good morning",
    time: "10:00",
    isMe: false,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    user: "Me",
    text: "Good morning, How are you? What about our next meeting?",
    time: "10:02",
    isMe: true,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

export default function App() {
  const [messages, setMessages] = useState(messagesData);

  const handleSend = (text) => {
    setMessages([
      ...messages,
      {
        user: "Me",
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    ]);
  };

  return (
    <div className="flex h-screen bg-whitte text-black">
      <Sidebar />
      <ChatArea messages={messages} onSend={handleSend} />
   
    </div>
  );
}