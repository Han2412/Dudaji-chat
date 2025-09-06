import React from "react";
import ChatHeader from "./Chatheader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatArea({ messages, onSend }) {
  return (
    <section className="flex-1 flex flex-col">
      <ChatHeader />
      <MessageList messages={messages} />
      <MessageInput onSend={onSend} />
    </section>
  );
}