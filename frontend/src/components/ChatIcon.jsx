import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { unreadMessagesAtom, conversationAtom } from "../Atom/messageAtom";
import getUser from "../Atom/getUser";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import { Button } from "@mui/material";
import { fetchUnreadCount } from "../apis/messageApi";
import { useSocket } from "../context/socketContext";

const ChatButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useRecoilState(unreadMessagesAtom);
  const selectedConversation = useRecoilValue(conversationAtom);
  const user = useRecoilValue(getUser);
  const { socket } = useSocket();
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshUnreadCount = async () => {
    if (!user?._id) return;
    try {
      const count = await fetchUnreadCount(user._id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    if (!user?._id || !socket) return;

    refreshUnreadCount();
    setIsInitialized(true);

    // Listen for new messages
    socket.on("newMessage", (message) => {
      // Only increment unread count if message is for current user and not from current conversation
      if (message.sender !== user._id) {
        if (!selectedConversation || selectedConversation._id !== message.conversationId) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    // Listen for seen messages
    socket.on("messagesSeen", () => {
      refreshUnreadCount();
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
    };
  }, [user?._id, socket, selectedConversation?._id]);

  const handleChatClick = () => {
    navigate("/chat");
  };

  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: "rgba(176, 73, 174, 0.1)",
        color: "#ffffff",
        fontWeight: "bold",
        borderRadius: "12px",
        border: "1px solid rgba(176, 73, 174, 0.69)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        ":hover": {
          backgroundColor: "rgba(176, 73, 174, 0.2)",
          boxShadow: "0 6px 35px rgba(0, 0, 0, 0.15)",
        },
        minWidth: "36px",
        height: "36px",
      }}
      onClick={handleChatClick}
    >
      <Badge badgeContent={unreadCount} color="error">
        <ChatIcon fontSize="small" />
      </Badge>
    </Button>
  );
};

export default ChatButton;