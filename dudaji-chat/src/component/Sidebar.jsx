import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AiFillWechat,
  AiOutlineSearch,
  AiFillSetting,
  AiOutlineUsergroupAdd,
  AiFillCloseCircle,
} from "react-icons/ai";

export default function Sidebar({ socket, setSelectedRoom, username }) {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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

    try {
      await axios.post("http://localhost:5000/createRoom", {
        name: newRoomName,
        createdBy: username, // hoặc userId
      });
      setNewRoomName("");
      setShowModal(false);
    } catch (error) {
      console.error(
        "Error creating group:",
        error.response?.data || error.message
      );
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      localStorage.removeItem("username"); 
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }
  };

  return (
    <aside className="flex w-96 h-screen text-xl bg-white border-r border-r-[#122670] ">
      <div className="flex flex-col justify-between items-center w-1/5 h-full bg-[#122670] ">
        <AiFillWechat className="w-8 h-8 mt-4 text-amber-50" />
        <div className=" flex flex-col gap-6 text-amber-50">
          <button
            type="button"
            className="bg-[#122670] hover:bg-yellow-100 hover:text-black px-2 py-2 rounded-full text-amber-50 font-bold"
            onClick={() => setShowModal(true)}
          >
            <AiOutlineUsergroupAdd className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="relative bg-[#122670] hover:bg-yellow-100 hover:text-black px-2 py-2 rounded-full text-amber-50 font-bold"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <AiFillSetting className="w-6 h-6" />
          </button>

          {showDropdown && (
            <div className="absolute mt-25 ml-5 w-40 bg-white border shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-black hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
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

        {/* Room List */}
        <ul className="h-[86%] text overflow-y-auto  text-left ml-2">
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100/70">
          <div className="bg-white p-0.5 rounded-lg shadow-lg w-96">
            {/* header */}
            <div className="flex items-center justify-between bg-[#122670] p-2 w-full rounded-t-lg mb-4">
              <h2 className="text-xl font-bold text-white ml-2 mb-4">
                Create group
              </h2>
              <button
                className="flex justify-center items-center w-8 h-8 hover:bg-amber-50  rounded-full "
                onClick={() => setShowModal(false)}
              >
                <AiFillCloseCircle className="w-8 h-8 text-white hover:text-[#122670]" />
              </button>
            </div>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter group name"
              className="border-b border-[#122670] rounded w-80 outline-none ml-7 mt-4 mb-4 px-2 py-1"
            />

            {/* footer */}
            <div className="flex justify-end gap-2 py-2 mt-4 border-t border-[#122670]">
              <button
                className="px-2 py-1 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-2 py-1 mr-2 bg-[#122670] text-white rounded"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
