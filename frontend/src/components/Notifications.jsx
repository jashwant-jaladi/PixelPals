import { useEffect, useState } from "react";

const Notifications = ({ setNotificationCount }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch("/api/posts/notifications");
                if (!response.ok) throw new Error("Failed to fetch notifications");
                const data = await response.json();
                
                setNotifications(data);
                setNotificationCount(data.length); // Update notification count in parent
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
    }, [setNotificationCount]);

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/posts/mark-notification-as-read/${notificationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to mark as read");

            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
            setNotificationCount((prevCount) => prevCount - 1); // Decrease count
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
                        <div key={notif._id} className="flex justify-between bg-inherit px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={notif.sender.profilePic}
                                    alt={notif.sender.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <p className="text-white text-opacity-90">
                                    <strong>{notif.sender.username}</strong> {notif.message}
                                </p>
                            </div>
                            <button
                                onClick={() => markAsRead(notif._id)}
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



