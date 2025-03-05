import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { markNotificationAsRead } from "../apis/postApi";
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

  if (currentUser._id !== userData._id) {
    return (
      <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium mt-6">
        You are not allowed to see notifications for this user
      </p>
    );
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
            <div
              key={notif._id}
              className="flex justify-between items-start bg-inherit px-4 py-2 rounded-lg"
            >
              {/* Notification Content */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <Avatar
                  src={notif.sender.profilePic || ""}
                  alt={notif.sender.username || "User"}
                  className="w-10 h-10 flex-shrink-0"
                >
                  {!notif.sender.profilePic && <PersonIcon />}
                </Avatar>
                {currentUser && (
                  <Link
                    to={`/${currentUser.username}/${notif.post}`}
                    className="text-white text-opacity-90 hover:text-opacity-100 flex-1 min-w-0"
                  >
                    <p className="text-sm sm:text-base break-words">
                      <strong>{notif.sender.username}</strong> {notif.message}
                    </p>
                  </Link>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => handleMarkAsRead(notif._id)}
                className="text-sm text-red-400 hover:text-red-600 flex-shrink-0 ml-3"
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