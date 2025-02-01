import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { unreadMessagesAtom } from "../Atom/messageAtom";
import getUser from "../Atom/getUser";
import { io } from "socket.io-client";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import { Button } from "@mui/material";
import { fetchUnreadCount, markAllMessagesAsSeen } from "../apis/messageApi";

const ChatButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useRecoilState(unreadMessagesAtom);
  const user = useRecoilValue(getUser);

  useEffect(() => {
    if (!user) return;

    const initializeUnreadCount = async () => {
      const count = await fetchUnreadCount(user._id);
      setUnreadCount(count);
    };

    initializeUnreadCount();

    const socket = io("http://localhost:4000"); 

    socket.on("newMessage", (message) => {
      if (message.recipient === user._id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => socket.disconnect();
  }, [user, setUnreadCount]);

  const handleChatClick = async () => {
    navigate("/chat");
    setUnreadCount(0);
    await markAllMessagesAsSeen(user.token);
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
      }}
      onClick={handleChatClick}
    >
      <Badge badgeContent={unreadCount} color="error">
        <ChatIcon />
      </Badge>
    </Button>
  );
};

export default ChatButton;
