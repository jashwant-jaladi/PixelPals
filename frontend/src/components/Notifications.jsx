import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { fetchNotifications, markNotificationAsRead } from "../apis/postApi"; // Import utility functions

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const currentUser = useRecoilValue(getUser);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const data = await fetchNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        loadNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const removedNotificationId = await markNotificationAsRead(notificationId);
            setNotifications((prev) => prev.filter((notif) => notif._id !== removedNotificationId));
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    return (
        <div className="w-full mt-6 p-4 bg-inherit rounded-lg text-white">
            {notifications.length === 0 ? (
                <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium">
                    No new notifications
                </p>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className="flex justify-between bg-inherit px-4 py-2 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={notif.sender.profilePic}
                                    alt={notif.sender.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <Link
                                  to={`/${currentUser.username}/${notif.post}`} // Link to the post
                                  className="text-white text-opacity-90"
                                >
                                  <p>
                                    <strong>{notif.sender.username}</strong> {notif.message}
                                  </p>
                                </Link>
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
