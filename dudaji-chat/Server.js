import express from "express";
import http from "http";
import bcrypt from "bcrypt";
import axios from "axios";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Room } from "./src/model/Room.js";
import { Message } from "./src/model/Message.js";
import { User } from "./src/model/User.js";
import cloudinary from "./cloudinary.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username, password });
    await user.save();
    res.status(201).json({ username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Sai username hoặc mật khẩu" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Sai username hoặc mật khẩu" });
    }

    res.json({ username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
});

// API lấy danh sách phòng
app.get("/rooms", async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: 1 });
  const roomList = await Promise.all(
    rooms.map(async (room) => {
      const lastMessage = await Message.findOne({ roomId: room._id }).sort({
        createdAt: -1,
      });
      return {
        _id: room._id,
        name: room.name,
        lastMessage: lastMessage
          ? lastMessage.message ||
            (lastMessage.fileUrl
              ? `File: ${lastMessage.fileUrl.split("/").pop()}`
              : "")
          : "Chưa có tin nhắn",
        lastMessageTime: lastMessage
          ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "N/A",
      };
    })
  );
  res.json(roomList);
});

// API Create group
app.post("/createRoom", async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const room = new Room({ name, createdBy });
    io.emit("roomCreated", {
      _id: room._id,
      name: room.name,
    });

    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.get("/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ _id: room._id, name: room.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API get messages for a room
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

  socket.on("getRooms", async () => {
    const rooms = await Room.find();
    const roomList = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room._id }).sort({
          createdAt: -1,
        });
        return {
          _id: room._id,
          name: room.name,
          lastMessage: lastMessage
            ? lastMessage.message ||
              (lastMessage.fileUrl
                ? `File: ${lastMessage.fileUrl.split("/").pop()}`
                : "")
            : "Chưa có tin nhắn",
          lastMessageTime: lastMessage
            ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "N/A",
        };
      })
    );
    socket.emit("roomList", roomList);
  });

  socket.on("joinRoom", async ({ roomId }) => {
    try {
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

      socket.emit("loadMessages", messagesWithTime);
      socket.to(roomId).emit("userJoined", { username });
    } catch (error) {
      console.error(`Error joining room ${roomId} for ${username}:`, error);
    }
  });

  //Save mes from client
  socket.on("chatMessage", async ({ roomId, message, file, tempId }) => {
    if (!roomId) return;

    let fileInfo = null;

    if (file?.fileData) {
      const { fileName, fileData } = file;
      try {
        const uploadResponse = await cloudinary.uploader.upload(fileData, {
          folder: "chat_files",
          resource_type: "auto",
        });
        fileInfo = {
          fileName,
          fileUrl: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
        };
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    const msg = new Message({
      roomId,
      username,
      message: message || "",
      file: fileInfo,
    });

    await msg.save();

    const msgWithTime = {
      ...msg._doc,
      _id: msg._id.toString(),
      tempId,
      time: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    io.to(roomId).emit("message", msgWithTime);
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", username);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
