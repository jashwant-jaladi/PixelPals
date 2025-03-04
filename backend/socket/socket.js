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
          // Update all unseen messages in the conversation
          await Message.updateMany(
            { 
              conversationId, 
              recipient: userId,
              seen: false 
            },
            { $set: { seen: true } }
          );
      
          // Update conversation's last message
          await Conversation.updateOne(
            { _id: conversationId },
            { 
              $set: { 
                "lastMessage.seen": true 
              } 
            }
          );
      
          // Broadcast to all clients
          io.emit("messagesSeen", { 
            conversationId, 
            userId 
          });
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      });


    socket.on("typing", ({ conversationId, userId }) => {
        if (!typing[conversationId]) typing[conversationId] = new Set();
        typing[conversationId].add(userId);
        
        // Emit to all users in that conversation except sender
        socket.broadcast.emit("typing", { conversationId, users: Array.from(typing[conversationId]) });
    });
    
    socket.on("stopTyping", ({ conversationId, userId }) => {
        if (typing[conversationId]) {
            typing[conversationId].delete(userId);
            if (typing[conversationId].size === 0) delete typing[conversationId];
        }
        
        // Emit to all users in that conversation except sender
        socket.broadcast.emit("stopTyping", { conversationId, users: Array.from(typing[conversationId] || []) });
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
