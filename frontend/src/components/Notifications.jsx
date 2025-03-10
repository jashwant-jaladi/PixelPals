import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { markNotificationAsRead } from "../apis/postApi";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import { useTheme, useMediaQuery } from "@mui/material";

// Helper function to format notification message
const formatNotificationMessage = (notification) => {
  // Check if it's a follow request notification
  if (notification.type === 'follow_request_declined' || notification.type === 'follow_reject') {
    return 'declined your follow request';
  } else if (notification.type === 'follow_request_accepted' || notification.type === 'follow_accept') {
    return 'accepted your follow request';
  } else {
    // Return the original message for other notification types
    return notification.message || 'interacted with your post';
  }
};

const Notifications = ({ onNotificationUpdate, userData, notifications, setNotifications }) => {
  const currentUser = useRecoilValue(getUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <div className="flex justify-center mx-auto w-full px-2 text-center">
        <p className="text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium mt-6">
          You are not allowed to see notifications for this user
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 sm:mt-6 p-2 sm:p-4 bg-inherit rounded-lg text-white">
      {notifications.length === 0 ? (
        <div className="flex justify-center mx-auto w-full px-2 text-center">
          <p className="text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium">
            No new notifications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex flex-col sm:flex-row sm:justify-between items-start bg-inherit px-3 py-3 rounded-lg border border-gray-800"
            >
              {/* Notification Content */}
              <div className="flex items-start space-x-2 sm:space-x-3 w-full min-w-0 overflow-hidden mb-2 sm:mb-0">
                <Avatar
                  src={notif.sender.profilePic || ""}
                  alt={notif.sender.username || "User"}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                  sx={{ 
                    width: isMobile ? 32 : 40, 
                    height: isMobile ? 32 : 40 
                  }}
                >
                  {!notif.sender.profilePic && <PersonIcon fontSize={isMobile ? "small" : "medium"} />}
                </Avatar>
                {currentUser && (
                  <Link
                    to={`/${currentUser.username}/${notif.post}`}
                    className="text-white text-opacity-90 hover:text-opacity-100 flex-1 min-w-0 overflow-hidden"
                  >
                    <div className="text-xs sm:text-sm md:text-base">
                      <strong className="mr-1">{notif.sender.username}</strong> 
                      <span className="text-gray-300">{formatNotificationMessage(notif)}</span>
                    </div>
                  </Link>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => handleMarkAsRead(notif._id)}
                className="text-xs sm:text-sm text-red-400 hover:text-red-600 self-end sm:self-center px-2 py-1 ml-auto sm:ml-3 whitespace-nowrap border border-red-400 rounded-full"
              >
                {isMobile ? "Dismiss" : "Dismiss"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;