import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AiFillWechat,
  AiOutlineSearch,
  AiFillSetting,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";

export default function Sidebar({ socket, setSelectedRoom, username }) {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  // Load room list from server
  useEffect(() => {
    socket.emit("getRooms");
    socket.on("roomList", (roomList) => {
      console.log("Received roomList:", roomList);
      if (Array.isArray(roomList)) {
        setRooms(
          roomList.map((room) => ({
            id: room._id,
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

    // Khi server thông báo room mới được tạo
    socket.on("roomCreated", (newRoom) => {
      setRooms((prev) => {
        // tránh push trùng
        if (prev.some((room) => room.id === newRoom._id)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: newRoom._id,
            name: newRoom.name,
            message: "No message",
            time: "N/A",
            avatar: newRoom.name,
            active: false,
          },
        ];
      });
    });

    return () => {
      socket.off("roomList");
      socket.off("userJoined");
      socket.off("connect_error");
    };
  }, [socket]);

  // Click room to join
  const handleJoinRoom = (roomId) => {
    setSelectedRoom(roomId); // dùng _id luôn
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        active: room.id === roomId, // so sánh với id
      }))
    );
  };

 const handleCreate = async () => {
  if (!newRoomName.trim()) return;
  if (!username) {
    console.error("Username chưa sẵn sàng!");
    return;
  }

  console.log("Sending createRoom:", { name: newRoomName, createdBy: username });

  try {
    await axios.post("http://localhost:5000/createRoom", {
      name: newRoomName,
      createdBy: username, // hoặc userId
    });
    setNewRoomName("");
    setShowModal(false);
  } catch (error) {
    console.error("Error creating group:", error.response?.data || error.message);
  }
};

  return (
    <aside className="flex w-96 h-screen text-xl bg-white border-r border-r-[#122670] ">
      <div className="flex flex-col justify-between items-center w-1/5 h-full bg-[#122670] ">
        <AiFillWechat className="w-8 h-8 mt-4 text-amber-50" />
        <div className="flex flex-col gap-6 text-amber-50">
          <button
            type="button"
            className="bg-[#122670] hover:bg-yellow-100 hover:text-black px-2 py-2 rounded-full text-amber-50 font-bold"
            onClick={() => setShowModal(true)}
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
              key={room.id || i}
              onClick={() => handleJoinRoom(room.id)}
              className={`flex flex-row items-center text-center justify-between cursor-pointer rounded-lg mb-2 p-2 hover:bg-gray-100 ${
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
                <div className="text-xs">{room.message}</div>
              </div>
              <div className="text-xs">{room.time}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal create group */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Tạo nhóm mới</h2>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nhập tên nhóm"
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleCreate}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
