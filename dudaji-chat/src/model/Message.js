import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rooms', required: true },
  username: { type: String, required: true },
  message: { type: String },

   file: {
    fileName: String, // Tên file gốc (sun.jpg, video.mp4...)
    fileUrl: String,  // Link Cloudinary trả về (secure_url)
    publicId: String, // (tuỳ chọn) để xoá file sau này
  },

  createdAt: { type: Date, default: Date.now },
  time: { type: String }, // Trường time định dạng HH:MM
});

export const Message = mongoose.model('Message', messageSchema);