import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const typing = {};  // Changed from typingUsers to typing

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

export const getRecipientSocketId = (recipientId) => {
	return userSocketMap[recipientId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
            await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
            if (userSocketMap[userId]) {
                io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
            }
        } catch (error) {
            console.log(error);
        }
    });

	socket.on("typing", ({ conversationId, userId }) => {
		typing[conversationId] = userId;
		socket.broadcast.emit("typing", { conversationId, userId });
	});

	socket.on("stopTyping", ({ conversationId }) => {
		delete typing[conversationId];
		socket.broadcast.emit("stopTyping", { conversationId });
	});

    socket.on("disconnect", () => {
        console.log("User disconnected");
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, server, app };
