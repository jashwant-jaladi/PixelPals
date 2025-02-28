import { createContext, useContext, useEffect, useState } from "react";
import getUser from "../Atom/getUser";
import { useRecoilValue } from "recoil";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const currentUser = useRecoilValue(getUser);

  useEffect(() => {
    if (!currentUser?._id) {
      // If user logs out, close socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Avoid creating duplicate sockets
    const newSocket = io("http://localhost:4000", {
      query: { userId: currentUser._id },
      reconnection: true, // Ensure auto-reconnection
      reconnectionAttempts: 5, // Retry 5 times before failing
      reconnectionDelay: 2000, // Wait 2 seconds before retry
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser?._id]); // Only recreate socket if user ID changes

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
