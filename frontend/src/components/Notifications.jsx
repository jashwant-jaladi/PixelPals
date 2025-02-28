import { Link } from "react-router-dom"; 
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import {  markNotificationAsRead } from "../apis/postApi"; 
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";

const Notifications = ({ onNotificationUpdate, userData, notifications, setNotifications }) => {
    
    const currentUser = useRecoilValue(getUser);



    const handleMarkAsRead = async (notificationId) => {
        try {
            const removedNotificationId = await markNotificationAsRead(notificationId);
            setNotifications((prev) => prev.filter((notif) => notif._id !== removedNotificationId));
            onNotificationUpdate((prevCount) => Math.max(0, prevCount - 1));
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    if(currentUser._id !== userData._id){
        return(
        <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium mt-6">
            You are not allowed to see notifications for this user
        </p>)
    }    

    return (
        <div className="w-full mt-6 p-4 bg-inherit rounded-lg text-white">
            {notifications.length === 0 ? (
                <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium">
                    No new notifications
                </p>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div key={notif._id} className="flex justify-between bg-inherit px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Avatar
                                    src={notif.sender.profilePic || ""}
                                    alt={notif.sender.username || "User"}
                                    className="w-10 h-10"
                                >
                                    {!notif.sender.profilePic && <PersonIcon />}
                                </Avatar>
                                {currentUser && (
                                    <Link to={`/${currentUser.username}/${notif.post}`} className="text-white text-opacity-90">
                                        <p>
                                            <strong>{notif.sender.username}</strong> {notif.message}
                                        </p>
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                className="text-sm text-red-400 hover:text-red-600"
                            >
                                Dismiss
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
