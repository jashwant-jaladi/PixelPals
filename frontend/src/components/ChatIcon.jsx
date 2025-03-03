import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { unreadMessagesAtom, conversationAtom } from "../Atom/messageAtom";
import getUser from "../Atom/getUser";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import { Button, Tooltip } from "@mui/material";
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
        const isCurrentConversation = selectedConversation && selectedConversation._id === message.conversationId;
        
        // Don't increment if message is part of the current conversation and user is on chat page
        if (!isCurrentConversation || window.location.pathname !== '/chat') {
          setUnreadCount((prev) => prev + 1);
          
          // Show browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("New Message", {
              body: message.text || "You received a new message",
              icon: "/favicon.ico" // Add your app icon path
            });
            
            notification.onclick = () => {
              window.focus();
              navigate('/chat');
            };
          }
        }
      }
    });

    // Listen for seen messages
    socket.on("messagesSeen", () => {
      refreshUnreadCount();
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
    };
  }, [user?._id, socket, selectedConversation, navigate]);

  // Reset unread count when entering chat page
  useEffect(() => {
    if (window.location.pathname === '/chat') {
      refreshUnreadCount();
    }
  }, [window.location.pathname]);

  const handleChatClick = () => {
    navigate("/chat");
  };

  return (
    <Tooltip title={unreadCount > 0 ? `${unreadCount} unread messages` : "Chat"}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: unreadCount > 0 ? "rgba(233, 30, 99, 0.2)" : "rgba(176, 73, 174, 0.1)",
          color: "#ffffff",
          fontWeight: "bold",
          borderRadius: "12px",
          border: unreadCount > 0 ? "1px solid rgba(233, 30, 99, 0.69)" : "1px solid rgba(176, 73, 174, 0.69)",
          boxShadow: unreadCount > 0 ? "0 4px 30px rgba(233, 30, 99, 0.2)" : "0 4px 30px rgba(0, 0, 0, 0.1)",
          ":hover": {
            backgroundColor: unreadCount > 0 ? "rgba(233, 30, 99, 0.3)" : "rgba(176, 73, 174, 0.2)",
            boxShadow: "0 6px 35px rgba(0, 0, 0, 0.15)",
          },
          minWidth: "36px",
          height: "36px",
          animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
          "@keyframes pulse": {
            "0%": {
              boxShadow: "0 0 0 0 rgba(233, 30, 99, 0.4)"
            },
            "70%": {
              boxShadow: "0 0 0 10px rgba(233, 30, 99, 0)"
            },
            "100%": {
              boxShadow: "0 0 0 0 rgba(233, 30, 99, 0)"
            }
          }
        }}
        onClick={handleChatClick}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <ChatIcon />
        </Badge>
      </Button>
    </Tooltip>
  );
};

export default ChatButton;