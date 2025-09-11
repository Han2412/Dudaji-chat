import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config(); // load .env

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,   // từ dashboard
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export default cloudinary;
