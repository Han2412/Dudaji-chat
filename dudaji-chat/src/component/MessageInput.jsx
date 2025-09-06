import React, { useState } from "react";
export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
      }}
      className="flex items-center p-4 border-t border-gray-700 bg-gray-800"
    >
      <input
        className="flex-1 p-3 rounded bg-gray-700 text-white mr-4 outline-none"
        placeholder="Enter message..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        type="submit"
        className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded text-white font-bold"
      >
        ▶
      </button>
    </form>
  );
}