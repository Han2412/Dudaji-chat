import React, { useState, useEffect } from "react";
import {
  AiFillWechat,
  AiOutlineSearch,
  AiFillSetting,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";

export default function Sidebar({
  socket,
  setSelectedRoom,
  username,
  setMessages,
}) {
  const [rooms, setRooms] = useState([]);
  console.log("Rsocket", socket);
  useEffect(() => {
    socket.emit("getRooms");

    socket.on("roomList", (roomList) => {
      console.log("Received roomList:", roomList);
      if (Array.isArray(roomList)) {
        setRooms(
          roomList.map((room) => ({
            name: room.name || "Unknown",
            message: room.lastMessage || "No message",
            time: room.lastMessageTime || "N/A",
            avatar: room.avatar || "",
            active: false,
          }))
        );
      }
    });

    socket.on("userJoined", ({ username: joinedUser }) => {
      console.log("User joined:", joinedUser);
    });

    socket.on("connect_error", (error) =>
      console.error("Socket.IO connect error:", error)
    );

    return () => {
      socket.off("roomList");
      socket.off("userJoined");
      socket.off("connect_error");
    };
  }, [socket]);

// Click room
  const handleJoinRoom = (roomName) => {
    if (!roomName) {
      console.log("Invalid room name:", roomName);
      return;
    }
    console.log("Selecting room:", roomName);
    setSelectedRoom(roomName);
    // setMessages([]);
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        active: room.name === roomName,
      }))
    );
  };

  return (
    <aside className="flex w-96 h-screen text-xl bg-white border-r border-r-[#122670] ">
      <div className="flex flex-col justify-between items-center w-1/5 h-full bg-[#122670] ">
        <AiFillWechat className="w-8 h-8 mt-4 text-amber-50" />
        <div className="flex flex-col gap-6 text-amber-50">
          <button
            type="button"
            className="bg-[#122670] hover:bg-yellow-100 hover:text-black px-2 py-2 rounded-full text-amber-50 font-bold"
          >
            <AiOutlineUsergroupAdd className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="bg-[#122670] hover:bg-yellow-100 hover:text-black px-2 py-2 rounded-full text-amber-50 font-bold"
          >
            <AiFillSetting className="w-6 h-6" />
          </button>
        </div>
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=${username}`}
          alt="User"
          className="w-12 h-12 rounded-full mb-4"
        />
      </div>
      <div className="">
        <div className="text-black text-center my-4  font-bold text-3xl">
          Chats
        </div>
        {/* Search */}
        <div className="flex items-center bg-gray-100 relative rounded-lg  mb-2 py-2 ml-3 border-b border-[#122670]">
          <AiOutlineSearch className="flex absolute w-6 h-6 ml-3" />
          <div className="flex flex-1">
            <input
              className="flex justify-center outline-none w-70 pl-14 "
              placeholder="Search group"
            />
          </div>
        </div>

        {/* userName */}
        {/* <div className="text-black  text-center my-5">Hello, {username}</div> */}

        {/* Room List */}
        <ul className="text overflow-y-auto text-left ml-2">
          {rooms.map((room, i) => (
            <li
              key={room.name || i}
              onClick={() => handleJoinRoom(room.name)}
              className={`flex flex-row items-center text-center  cursor-pointer rounded-lg mb-2 p-2 hover:bg-gray-100 ${
                room.active ? "bg-blue-200" : ""
              } gap-2`}
            >
              {room.avatar ? (
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${room.avatar}`}
                  alt={room.name}
                  className="w-12 h-12 rounded-full flex justify-start"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${room.name}`}
                  alt={room.name[0]}
                  className="w-12 h-12 rounded-full flex justify-start"
                />
              )}
              <div className="flex flex-col  ml-3 ">
                <div className="text-black text-xl ">{room.name}</div>
                {/* <div className="text-xs">{room.message}</div> */}
              </div>
              {/* <div className="text-xs">{room.time}</div> */}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
