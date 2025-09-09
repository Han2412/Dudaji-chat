import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Room } from "./src/model/Room.js";
import { Message } from "./src/model/Message.js";
import { User } from "./src/model/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Cập nhật origin cụ thể để debug dễ hơn
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// API đăng ký
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username, password });
    await user.save();
    res.status(201).json({ username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API đăng nhập
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy danh sách phòng
app.get("/rooms", async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: 1 });
  const roomList = await Promise.all(
    rooms.map(async (room) => {
      const lastMessage = await Message.findOne({ roomId: room.roomId }).sort({
        createdAt: -1,
      });
      return {
        name: room.name,
        // lastMessage: lastMessage
        //   ? lastMessage.message ||
        //     (lastMessage.fileUrl
        //       ? `File: ${lastMessage.fileUrl.split("/").pop()}`
        //       : "")
        //   : "Chưa có tin nhắn",
        // lastMessageTime: lastMessage
        //   ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
        //       hour: "2-digit",
        //       minute: "2-digit",
        //       hour12: false,
        //     })
        //   : "N/A",
      };
    })
  );
  res.json(roomList);
});

// API tạo phòng
app.post("/rooms", async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const room = new Room({ roomId: name, name, createdBy });
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API lấy tin nhắn theo phòng
app.get("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
  const messagesWithTime = messages.map((msg) => ({
    ...msg._doc,
    time: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));
  res.json(messagesWithTime);
});

// Socket.IO
io.on("connection", (socket) => {
  const { username } = socket.handshake.query;
  if (!username) {
    console.log("No username provided, disconnecting socket");
    return socket.disconnect();
  }

  // console.log("User connected:", username);

  socket.on("getRooms", async () => {
    const rooms = await Room.find();
    const roomList = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room.roomId }).sort(
          { createdAt: -1 }
        );
        return {
          name: room.name,
          // lastMessage: lastMessage
          //   ? lastMessage.message ||
          //     (lastMessage.fileUrl
          //       ? `File: ${lastMessage.fileUrl.split("/").pop()}`
          //       : "")
          //   : "Chưa có tin nhắn",
          // lastMessageTime: lastMessage
          //   ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
          //       hour: "2-digit",
          //       minute: "2-digit",
          //       hour12: false,
          //     })
          //   : "N/A",
        };
      })
    );
    console.log("Sending roomList to", username, ":", roomList); // Debug
    socket.emit("roomList", roomList);
  });

  socket.on("joinRoom", async ({ roomId }) => {
    try {
      console.log(`User ${username} joining room: ${roomId}`); // Debug
      socket.join(roomId);
      const messages = await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50);
      const messagesWithTime = messages.map((msg) => ({
        ...msg._doc,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));
      console.log(
        `Loaded messages for ${username} in room ${roomId}:`,
        messagesWithTime
      ); // Debug
      socket.emit("loadMessages", messagesWithTime);
      socket.to(roomId).emit("userJoined", { username });
    } catch (error) {
      console.error(`Error joining room ${roomId} for ${username}:`, error);
    }
  });

  socket.on("chatMessage", async ({ roomId, message }) => {
    try {
      if (!roomId || !message || !username) {
        console.error(
          `Invalid message data from ${username} (socket ${socket.id}):`,
          { roomId, message }
        );
        return;
      }
      const normalizedRoomId = roomId.trim();
      console.log(`Received message from ${username} (socket ${socket.id}):`, {
        roomId: normalizedRoomId,
        message,
      });
      const roomExists = await Room.findOne({ name: normalizedRoomId }); // Sử dụng name thay vì roomId
      if (!roomExists) {
        console.error(
          `Room ${normalizedRoomId} does not exist, creating it...`
        );
        const newRoom = new Room({
          name: normalizedRoomId,
          createdBy: username,
        });
        await newRoom.save();
        console.log(`Created new room: ${normalizedRoomId}`);
      }
      const msg = new Message({ roomId: normalizedRoomId, username, message });
      await msg.save();
      console.log("Saved message:", msg);
      const msgWithTime = {
        ...msg._doc,
        _id: msg._id.toString(),
        roomId: normalizedRoomId,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      console.log(`Emitting message to room ${normalizedRoomId}:`, msgWithTime);
      io.to(normalizedRoomId).emit("message", msgWithTime);
      const clientsInRoom = await io.in(normalizedRoomId).allSockets();
      console.log(`Clients in room ${normalizedRoomId} receiving message:`, [
        ...clientsInRoom,
      ]);
    } catch (error) {
      console.error("Error saving or emitting message:", error);
    }
  });
  socket.on("fileUpload", async ({ roomId, fileName, fileData }) => {
    try {
      console.log("Received file:", { roomId, fileName, username }); // Debug
      const fileMsg = new Message({ roomId, username, fileUrl: fileData });
      await fileMsg.save();
      const fileMsgWithTime = {
        ...fileMsg._doc,
        roomId, // Thêm roomId
        time: new Date(fileMsg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      console.log("Emitting file to room", roomId, ":", fileMsgWithTime); // Debug
      io.to(roomId).emit("file", fileMsgWithTime);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", username);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
