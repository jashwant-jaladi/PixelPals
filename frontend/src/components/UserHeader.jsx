import React, { useState, useEffect } from "react";
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress, Tabs, Tab, Badge } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ShareIcon from "@mui/icons-material/Share";
import { pink } from "@mui/material/colors";
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { Link } from "react-router-dom";
import FollowersFollowingDialog from "./FollowersFollowingDialog";
import Notifications from "./Notifications";
import { followUser, fetchFollowersAndFollowing } from "../apis/followApi";
import CreatePost from "./CreatePost";


const UserHeader = ({ user, setTabIndex, tabIndex }) => {
  const currentUser = useRecoilValue(getUser);
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

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
    if (!currentUser) {
      setSnackbarMessage("You must be logged in to follow users.");
      setSnackbarOpen(true);
      return;
    }
  
    // Prevent multiple clicks
    if (updating) return;
    
    setUpdating(true);
  
    try {
      const response = await followUser(userData._id);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to update followers.");
      }
  
      // Update local state with new followers from API response
      setUserData((prev) => ({
        ...prev,
        followers: response.updatedFollowers.map((user) => user._id)
      }));
  
      // Update following state based on API response
      setFollowing(response.isFollowing);
      
      // Show appropriate message
      setSnackbarMessage(
        response.isFollowing
          ? `You are now following ${userData.name}!`
          : `You have unfollowed ${userData.name}.`
      );
      setSnackbarOpen(true);
  
      // Refresh followers list if needed
      await fetchFollowersAndUpdateLists();
    } catch (error) {
      setSnackbarMessage(error.message || "An error occurred while updating follow status.");
      setErrorSnackbarOpen(true);
      console.error("Follow/Unfollow failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const fetchFollowersAndUpdateLists = async () => {
    setLoading(true);
    try {
      const { followers, following } = await fetchFollowersAndFollowing(userData._id);
      setFollowersList(followers);
      setFollowingList(following);
      setUserData((prev) => ({
        ...prev,
        followers: followers.map((f) => f._id),
        following: following.map((f) => f._id),
      }));
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setFollowersDialogOpen(false);
    fetchFollowersAndUpdateLists();
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/posts/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotificationCount(data.length);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, []);

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
            className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300"
              onClick={handleFollowToggle}
              disabled={updating}
            >
              {updating ? <CircularProgress size={24} color="inherit" /> : following ? "Unfollow" : "Follow"}
            </button>
            {following && (
              <Link to="/chat" className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">Message</Link>
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
    maxWidth: "100vw", // Ensures it doesn't exceed screen width
    overflowX: "auto", // Enables scrolling if needed
  }}
>
  <Tab
    label="Posts"
    sx={{
      color: "gray",
      "&.Mui-selected": { color: "pink", fontWeight: "bold" },
      minWidth: "unset", // Allow tabs to shrink
      padding: "6px 12px", // Smaller padding for small screens
      fontSize: "14px", // Smaller font size for small screens
      flexShrink: 0, // Prevents shrinking
    }}
  />
  <Tab
    label={
      <Badge
        color="error"
        variant="dot"
        invisible={notificationCount === 0}
        sx={{
          "& .MuiBadge-badge": {
            right: -5,
            top: 5,
          },
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>Notifications</span>
      </Badge>
    }
    sx={{
      color: "gray",
      "&.Mui-selected": { color: "pink", fontWeight: "bold" },
      minWidth: "unset", // Allow tabs to shrink
      padding: "6px 12px", // Smaller padding for small screens
      fontSize: "14px", // Smaller font size for small screens
      flexShrink: 0, // Prevents shrinking
    }}
  />
  <Tab
    label="Follow Requests"
    sx={{
      color: "gray",
      "&.Mui-selected": { color: "pink", fontWeight: "bold" },
      minWidth: "unset", // Allow tabs to shrink
      padding: "6px 12px", // Smaller padding for small screens
      fontSize: "14px", // Smaller font size for small screens
      flexShrink: 0, // Prevents shrinking
    }}
  />
</Tabs>

      {tabIndex === 1 && <Notifications setNotificationCount={setNotificationCount} />}

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
        followers={followersList}
        following={followingList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    </div>
  );
};

export default UserHeader;