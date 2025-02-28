import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const userSocketMap = {}; 
const typing = {};  

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId] || null;
};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            await Message.updateMany(
                { conversationId, seen: false },
                { $set: { seen: true } }
            );
            await Conversation.updateOne(
                { _id: conversationId },
                { $set: { "lastMessage.seen": true } }
            );
    
            // Notify the user that messages have been seen
            io.emit("messagesSeen", { conversationId });
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    });
    

    socket.on("typing", ({ conversationId, userId }) => {
        if (!typing[conversationId]) typing[conversationId] = new Set();
        typing[conversationId].add(userId);
        io.to(conversationId).emit("typing", { conversationId, users: Array.from(typing[conversationId]) });
    });

    socket.on("stopTyping", ({ conversationId, userId }) => {
        if (typing[conversationId]) {
            typing[conversationId].delete(userId);
            if (typing[conversationId].size === 0) delete typing[conversationId];
        }
        io.to(conversationId).emit("stopTyping", { conversationId, users: Array.from(typing[conversationId] || []) });
    });

    const updateOnlineUsers = () => {
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    };

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        const userIdToRemove = Object.keys(userSocketMap).find(
            key => userSocketMap[key] === socket.id
        );

        if (userIdToRemove) {
            delete userSocketMap[userIdToRemove];
            updateOnlineUsers();
        }
    });
});

export { io, server, app };
