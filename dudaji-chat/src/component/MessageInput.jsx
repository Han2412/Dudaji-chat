import React, { useState } from "react";
import { AiOutlineFileAdd, AiOutlineSend } from "react-icons/ai";

export default function MessageInput({
  onSend,
  onFileUploadm,
  roomId,
  username,
  socket,
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      console.log("Sending text:", text);
      onSend(text);
      setText("");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleFileUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result; // Base64 dataURL

      socket.emit("fileUpload", {
        roomId,
        username,
        fileName: file.name,
        fileData,
      });

      // Hiển thị tạm (optimistic UI)
      onSend(null, [
        {
          user: username,
          text: `Đang upload: ${file.name}...`,
          isMe: true,
          file: { fileName: file.name, fileUrl: uploadResponse.secure_url },
          roomId,
          _id: Date.now().toString(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-4 bg-white border-t border-[#122670] "
    >
      <div className="flex flex-1 items-center">
        <input
          type="file"
          onChange={handleFileChange} 
          className="hidden"
          id="fileInput"
        />

        <label htmlFor="fileInput" className="cursor-pointer">
          <AiOutlineFileAdd className="w-6 h-6 text-amber-50 hover:text-yellow-500" />
        </label>

        <button
          type="button"
          onClick={handleFileUpload} // click button mới upload
          disabled={!file}
          className={`px-2 py-2 rounded bg-[#122670] text-white font-bold ${
            !file ? "opacity-50" : ""
          }`}
        >
          Upload
        </button>

        <input
          className="flex-1 p-3 rounded bg-gray-50 text-black mx-4 outline-none border border-gray-300"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#122670] hover:bg-yellow-100 hover:text-[#122670] px-2 py-2 rounded text-amber-50 font-bold"
        >
          <AiOutlineSend className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
}
