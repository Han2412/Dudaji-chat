import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // Đảm bảo là String
  username: { type: String, required: true },
  message: { type: String },

  file: {
    fileName: String,
    fileData: String, // Base64
  },
  createdAt: { type: Date, default: Date.now },
  time: { type: String }, // Trường time định dạng HH:MM
});

export const Message = mongoose.model('Message', messageSchema);