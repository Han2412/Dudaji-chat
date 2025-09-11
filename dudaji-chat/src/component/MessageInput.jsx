import React, { useState, useEffect } from "react";
import { AiOutlineFileAdd, AiOutlineSend } from "react-icons/ai";

export default function MessageInput({ onSend, roomId, username, socket }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  // Reset khi đổi room
  useEffect(() => {
    setText("");
    setFile(null);
  }, [roomId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Nếu không có text và không có file thì thôi
    if (!text.trim() && !file) return;

    const sendMessage = async () => {
      let filePayload = null;

      if (file) {
        // Đọc file thành Base64 để gửi server
        const reader = new FileReader();
        reader.onload = async () => {
          filePayload = {
            fileName: file.name,
            fileData: reader.result,
          };

          // Gửi tin nhắn + file cùng lúc
          socket.emit("chatMessage", {
            roomId,
            username,
            message: text.trim() || "",
            file: filePayload,
          });

        
          setText("");
          setFile(null);
        };
        reader.readAsDataURL(file);
      } else {
        // Chỉ gửi text
        socket.emit("chatMessage", { roomId, username, message: text.trim() });
        setText("");
      }
    };

    sendMessage();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-4 bg-white border-t border-[#122670]"
    >
      <div className="flex flex-1 items-center">
        {/* Input file ẩn */}
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <AiOutlineFileAdd className="w-6 h-6 text-[#122670] hover:text-yellow-500" />
        </label>

        {/* input text */}
        <input
          className="flex-1 p-3 rounded bg-gray-50 text-black mx-4 outline-none border border-gray-300"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* button send */}
        <button
          type="submit"
          className="bg-[#122670] hover:bg-yellow-100 hover:text-[#122670] px-2 py-2 rounded text-white font-bold"
        >
          <AiOutlineSend className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
}
