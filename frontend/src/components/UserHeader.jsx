import React, { useState, useEffect, useCallback } from "react";
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress, Tabs, Tab, Badge, useMediaQuery, useTheme } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ShareIcon from "@mui/icons-material/Share";
import { pink } from "@mui/material/colors";
import { useRecoilState } from "recoil";
import getUser from "../Atom/getUser";
import { Link } from "react-router-dom";
import FollowersFollowingDialog from "./FollowersFollowingDialog";
import Notifications from "./Notifications";
import { followUser, fetchFollowersAndFollowing } from "../apis/followApi";
import { fetchNotifications } from "../apis/postApi";
import { requestFollow } from "../apis/followApi";
import CreatePost from "./CreatePost";
import FollowRequest from "./FollowRequest";
import { useRefreshUser } from "../hooks/useRefreshUser";
import { conversationAtom } from "../Atom/messageAtom";
import { useNavigate } from "react-router-dom";



const UserHeader = ({ user, setTabIndex, tabIndex }) => {
  const [currentUser, setCurrentUser] = useRecoilState(getUser);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("followers");
  const [userData, setUserData] = useState(user);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [followRequested, setFollowRequested] = useState(
    
    currentUser && user.followers?.includes(currentUser._id)
  );
  const [followRequestCount, setFollowRequestCount] = useState(currentUser?.Requested?.length || 0);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const [conversation, setSelectedConversation] = useRecoilState(conversationAtom);
  const Navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  useRefreshUser(3000);

  useEffect(() => {
    const fetchCurrentUserFollowingIds = async () => {
      if (currentUser?._id) {
        try {
          const { following = [] } = await fetchFollowersAndFollowing(currentUser._id);
          setCurrentUserFollowing(following.map(f => f._id));
        } catch (error) {
          console.error("Error fetching current user following:", error);
        }
      }
    };
    
    fetchCurrentUserFollowingIds();
  }, [currentUser?._id]);
  
  useEffect(() => {
    if (currentUser && userData) {
      // Check if current user has already requested to follow this user
      setFollowRequested(userData.Requested?.includes(currentUser._id));
    }
  }, [currentUser, userData]);

  useEffect(() => {
    // Only fetch notifications if viewing own profile
    if (currentUser && userData && currentUser._id === userData._id) {
      const loadNotifications = async () => {
        try {
          const data = await fetchNotifications();
          setNotificationCount(data.length);
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications", error);
        }
      };
      
      loadNotifications();
    } else {
      // Reset notifications when viewing other profiles
      setNotificationCount(0);
      setNotifications([]);
    }
  }, [currentUser, userData]);

  const handleCopyProfileUrl = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => setSnackbarMessage("Profile URL copied!"))
      .catch(() => setSnackbarMessage("Failed to copy URL"));
    setSnackbarOpen(true);
    handleClose();
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleErrorSnackbarClose = () => setErrorSnackbarOpen(false);

  const handleFollowToggle = async () => {
    if (!currentUser || currentUser._id === userData._id) return;

    setUpdating(true);

    try {
      let response;
      if (userData.private && !following) {
        response = await requestFollow(userData._id, currentUser._id);
        if (response.error) throw new Error(response.error);
      
        // Update the userData state to include the current user in Requested array
        setUserData(prev => ({
          ...prev,
          Requested: [...(prev.Requested || []), currentUser._id]
        }));
        
        setFollowRequested(true);
        setSnackbarMessage("Follow request sent!");
      } else {
        response = await followUser(userData._id);
        if (response.error) throw new Error(response.error);

        setFollowing(response.isFollowing);
        setUserData((prev) => ({
          ...prev,
          followers: response.isFollowing
            ? [...prev.followers, currentUser._id]
            : prev.followers.filter((id) => id !== currentUser._id),
        }));
      }
    } catch (error) {
      setSnackbarMessage(error.message || "An error occurred.");
      setErrorSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  const fetchFollowersAndUpdateLists = async () => {
    setLoading(true);

    try {
      const { followers = [], following = [] } = await fetchFollowersAndFollowing(userData._id);

      setFollowersList(followers);
      setFollowingList(following);

      setUserData((prev) => ({
        ...prev,
        followers: followers.map((f) => f._id),
        following: following.map((f) => f._id),
      }));

      if (currentUser) {
        setFollowing(followers.some((f) => f._id === currentUser._id));
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setSnackbarMessage("Failed to load followers. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (followersDialogOpen) {
      fetchFollowersAndUpdateLists();
    }
  }, [followersDialogOpen]);

  const handleDialogClose = () => {
    setFollowersDialogOpen(false);
  };

  useEffect(() => {
    if (currentUser?.Requested) {
      setFollowRequestCount(currentUser.Requested.length);
    }
  }, [currentUser]);

  const refreshFollowData = useCallback(async () => {
    try {
      const { followers = [], following = [] } = await fetchFollowersAndFollowing(userData._id);
      
      // Update the count in userData state
      setUserData((prev) => ({
        ...prev,
        followers: followers.map((f) => f._id),
        following: following.map((f) => f._id),
      }));

      // If dialog is open, also update those lists
      if (followersDialogOpen) {
        setFollowersList(followers);
        setFollowingList(following);
      }

      if (currentUser) {
        setFollowing(followers.some((f) => f._id === currentUser._id));
      }
    } catch (error) {
      console.error("Error refreshing follow data:", error);
    }
  }, [userData?._id, followersDialogOpen, currentUser]);

  // Set up polling - refresh every 5 seconds
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      refreshFollowData();
    }, 2000); // Poll every 5 seconds

    // Initial fetch
    refreshFollowData();

    // Clean up on unmount
    return () => clearInterval(pollingInterval);
  }, [refreshFollowData]);
  // Show notification badge only on user's own profile
  const isOwnProfile = currentUser?._id === userData?._id;

  const handleDirectMessage = () => {
    // Create a conversation object
    const conversationObj = {
      _id: Date.now(),
      userId: userData._id,
      username: userData.username,
      userProfilePic: userData.profilePic
    };
    
    // Update Recoil state
    setSelectedConversation(conversationObj);
    
    // Save to localStorage
    localStorage.setItem('selectedConversation', JSON.stringify(conversationObj));
    
    // Navigate to the chat page
    Navigate('/chat');
  };
  
  return (
    <div className="font-parkinsans px-4 sm:px-8 md:px-16 lg:px-10 xl:px-10">
      <div className="flex flex-col md:flex-row items-center justify-between mt-10 w-full">
        <div className="text-center md:text-left">
          <div className="text-3xl font-bold">{userData.name}</div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2 items-center">
            <div className="text-xl font-bold">@{userData.username}</div>
            <div className="text-sm py-1 text-pink-700 font-bold bg-pink-400 px-2 rounded-lg">PixelPals.net</div>
          </div>
        </div>
        <Avatar src={userData.profilePic} sx={{ width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 } }} className="mt-4 md:mt-0" />
      </div>

      <p className="py-4 text-center md:text-left max-w-3xl">{userData.bio}</p>

      <div className="flex flex-col md:flex-row justify-center md:justify-start gap-2">
        {currentUser?._id === userData?._id ? (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <CreatePost />
            <button className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">
              <Link to="/update">Edit Profile</Link>
            </button>
          </div>
        ) : ( 
          <>
            <button
              className={`text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect transition duration-300 ${
                followRequested ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-700 hover:text-white"
              }`}
              onClick={handleFollowToggle}
              disabled={updating || followRequested}
            >
              {updating ? <CircularProgress size={24} color="inherit" /> : followRequested ? "Requested" : following ? "Unfollow" : "Follow"}
            </button>

            {following && (
  <button 
    onClick={handleDirectMessage}
    className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300"
  >
    Message
  </button>
)}
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="flex gap-2 text-pink-700 font-bold items-center cursor-pointer" onClick={() => setFollowersDialogOpen(true)}>
          <span>{userData.followers.length} followers</span>
          <span className="font-bold">.</span>
          <span>{userData.following.length} following</span>
        </div>

        <div className="flex gap-4 mt-3 md:mt-0">
          <IconButton sx={{ color: pink[500] }}>
            <InstagramIcon />
          </IconButton>
          <IconButton onClick={handleClick} sx={{ color: pink[500] }}>
            <ShareIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleCopyProfileUrl}>Copy Profile URL</MenuItem>
          </Menu>
        </div>
      </div>

      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          ".MuiTabs-indicator": { backgroundColor: "pink" },
          width: "100%",
          maxWidth: "100vw",
          overflowX: "auto",
          "& .MuiTabs-flexContainer": {
            gap: { xs: "4px", sm: "8px" },
          },
          "& .MuiTabs-scrollButtons": {
            color: "pink",
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          },
          "& .MuiTab-root": {
            textTransform: "none",
          },
        }}
      >
        <Tab
          label="Posts"
          sx={{
            color: "gray",
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
            minWidth: { xs: "60px", sm: "unset" },
            padding: { xs: "6px 8px", sm: "6px 12px" },
            fontSize: { xs: "12px", sm: "14px" },
            flexShrink: 0,
          }}
        />

        <Tab
          label={
            <Badge
              color="error"
              badgeContent={isOwnProfile ? notificationCount : 0}
              invisible={!isOwnProfile || notificationCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "10px",
                  minWidth: "16px",
                  height: "16px",
                  right: 1,
                  top: -7,
                  padding: "2px 4px",
                },
              }}
            >
              <span style={{ 
                whiteSpace: "nowrap", 
                display: "flex", 
                alignItems: "center",
                fontSize: { xs: "12px", sm: "14px" },
              }}>
                Notifications
              </span>
            </Badge>
          }
          sx={{
            color: "gray",
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
            minWidth: { xs: "60px", sm: "unset" },
            padding: { xs: "6px 8px", sm: "6px 12px" },
            fontSize: { xs: "12px", sm: "14px" },
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        />
        <Tab
          label={
            <Badge
              color="error"
              badgeContent={isOwnProfile ? followRequestCount : 0}
              invisible={!isOwnProfile || followRequestCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "10px",
                  minWidth: "16px",
                  height: "16px",
                  right: 1,
                  top: -7,
                  padding: "2px 4px",
                },
              }}
            >
              <span style={{ 
                whiteSpace: "nowrap", 
                display: "flex", 
                alignItems: "center",
                fontSize: { xs: "12px", sm: "14px" },
              }}>
                Follow Requests
              </span>
            </Badge>
          }
          sx={{
            color: "gray",
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
            minWidth: { xs: "60px", sm: "unset" },
            padding: { xs: "6px 8px", sm: "6px 12px" },
            fontSize: { xs: "12px", sm: "14px" },
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        />
      </Tabs>

      {tabIndex === 1 && <Notifications onNotificationUpdate={setNotificationCount} userData={userData} notifications={notifications} setNotifications={setNotifications} />}
      {tabIndex === 2 && <FollowRequest currentUser={currentUser} setCurrentUser={setCurrentUser} userData={userData} setFollowRequestCount={setFollowRequestCount} />}

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        ContentProps={{
          sx: { backgroundColor: "green", color: "black", fontWeight: "bold", borderRadius: "4px", padding: "8px 16px" },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        message="Something went wrong!"
        ContentProps={{
          sx: { backgroundColor: "red", color: "white", fontWeight: "bold", borderRadius: "4px", padding: "8px 16px" },
        }}
      />

      <FollowersFollowingDialog
        open={followersDialogOpen}
        onClose={handleDialogClose}
        loading={loading}
        setLoading={setLoading}
        followers={followersList}
        following={followingList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        setFollowersList={setFollowersList}
        setFollowingList={setFollowingList}
        currentUser={currentUser}
        currentUserFollowing={currentUserFollowing}
      />
    </div>
  );
};

export default UserHeader;