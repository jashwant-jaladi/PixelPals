import { createContext, useContext } from "react";
import getUser from "../Atom/getUser";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();


export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const currentUser = useRecoilValue(getUser);

    useEffect(() => {
        const socket = io("http://localhost:4000", {
            query: {
                userId: currentUser?._id
            },
        });
        setSocket(socket);
        socket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        });
        return () => {
           socket && socket.close();
        }
    }, [currentUser?._id]);
    console.log(onlineUsers, "onlineUsers");
    return (
        <SocketContext.Provider value={{socket, onlineUsers}}>  
            {children}
        </SocketContext.Provider>
    )
}