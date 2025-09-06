import React from "react";

const users = [
  { name: "Patrick", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Doris", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Emily", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Steve", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
];

const rooms = [
  {
    name: "Patrick Hendricks",
    message: "Hey! there I'm available",
    time: "05 min",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    active: true,
  },
  {
    name: "Mark Messer",
    message: "Images",
    time: "12 min",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    active: false,
  },
  {
    name: "General",
    message: "This theme is awesome!",
    time: "20 min",
    avatar: "",
    active: false,
  },
  {
    name: "Doris Brown",
    message: "Nice to meet you",
    time: "10:12 AM",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    active: false,
  },
];

export default function Sidebar() {
  return (
    <aside className=" mx-4 w-96 text-xl  h-full ">
      <div className="text-black mt-4 text-2xl">Chats </div>
      <input
        className="justify-center mb-5 text-gray-900 bg-gray-200 rounded-lg w-90 my-2 p-2"
        placeholder="Search messeget or user "
      />

      <div className="flex  gap-6 px-2">
        {users.map((u, i) => (
          <img
            key={i}
            src={u.avatar}
            alt={u.name}
            className="w-12 h-12 rounded-full gap-2"
          ></img>
        ))}
      </div>

      <div className="text-black my-3">Recents</div>

      <ul className="overflow-y-auto text-left">
        {rooms.map((room, i) => (
          <li
            key={i}
            className={`flex flex-row items-center justify-between cursor-pointer rounded-lg mb-2
             p-2 hover:bg-gray-300 ${room.active ? "bg-blue-200" : ""} gap-2`}
          >
            {room.avatar ? (
              <img
                src={room.avatar}
                alt={room.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {room.name[0]}
              </div>
            )}
            <div className="flex flex-col  text-left w-full">
              <div className="text-black text-xl">{room.name}</div>
              <div>{room.message}</div>
            </div>

            <div className="text-xs ">{room.time}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
