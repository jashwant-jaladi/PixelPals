import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";  // ✅ Import CORS
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import { app, server } from "./socket/socket.js";

dotenv.config();
connectDB();

// ✅ Enable CORS for ALL Origins
app.use(
  cors({
    origin: "*", // Allows ALL origins
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/followUsers", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);



server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
