import React, { useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab 
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ShareIcon from "@mui/icons-material/Share";
import { pink } from "@mui/material/colors";
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { Link } from "react-router-dom";
import FollowersFollowingDialog from "./FollowersFollowingDialog";

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

    setUpdating(true);
    try {
      const response = await fetch(`/api/users/follow/${userData._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.error) {
        setErrorSnackbarOpen(true);
        return;
      }

      // Update local state
      const updatedFollowers = following
        ? userData.followers.filter(id => id !== currentUser._id)
        : [...userData.followers, currentUser._id];

      setUserData(prev => ({
        ...prev,
        followers: updatedFollowers
      }));

      if (following) {
        setSnackbarMessage(`You have unfollowed ${userData.name}.`);
      } else {
        setSnackbarMessage(`You are now following ${userData.name}!`);
      }

      setFollowing(!following);
      setSnackbarOpen(true);
      
      // Refresh followers list
      await fetchFollowersAndFollowing();
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      setErrorSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  const fetchFollowersAndFollowing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/follow-unfollow/${userData._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      setFollowersList(data.followers);
      setFollowingList(data.following);
      
      // Update the userData state with new follower counts
      setUserData(prev => ({
        ...prev,
        followers: data.followers.map(f => f._id),
        following: data.following.map(f => f._id)
      }));
      
      // Update following state based on current user's status
      setFollowing(data.followers.some(f => f._id === currentUser?._id));
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
    setLoading(false);
  };

  const handleDialogClose = () => {
    setFollowersDialogOpen(false);
    // Refresh the followers list when dialog closes
    fetchFollowersAndFollowing();
  };

  return (
    <div className="font-parkinsans">
      <div className="flex justify-between items-center mt-20 w-full">
        <div className="pt-10">
          <div className="text-3xl font-bold">{userData.name}</div>
          <div className="flex gap-2 mt-2 items-center">
            <div className="text-xl font-bold">@{userData.username}</div>
            <div className="text-sm py-1 text-pink-700 font-bold bg-pink-400 px-1 rounded-lg">
              PixelPals.net
            </div>
          </div>
        </div>
        <Avatar src={userData.profilePic} sx={{ width: 170, height: 170 }} />
      </div>

      <p className="py-5 w-[90%] font-bold">{userData.bio}</p>

      {currentUser?._id === userData?._id ? (
  <button className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">
    <Link to="/update">Edit Profile</Link>
  </button>
) : (
  <div className="flex gap-2">
    <button
      onClick={handleFollowToggle}
      className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300 flex items-center justify-center"
      disabled={updating}
    >
      {updating ? <CircularProgress size={24} color="inherit" /> : following ? "Unfollow" : "Follow"}
    </button>

    {/* Show Message button only if the current user is following the profile */}
    {following && (
      <button className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">
        <Link to={"/chat"}>Message</Link>
      </button>
    )}
  </div>
)}


      <div className="flex justify-between">
        <div
          className="flex gap-2 text-pink-700 font-bold items-center cursor-pointer"
          onClick={() => {
            fetchFollowersAndFollowing();
            setFollowersDialogOpen(true);
          }}
        >
          <div>{userData.followers.length} followers</div>
          <span className="font-bold">.</span>
          <div>{userData.following.length} following</div>
        </div>

        <div className="flex gap-4">
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
        centered
        sx={{
          ".MuiTabs-indicator": { backgroundColor: "pink" },
        }}
      >
        <Tab label="Posts" sx={{ color: "gray", "&.Mui-selected": { color: "pink", fontWeight: "bold" } }} />
        <Tab label="Followers" sx={{ color: "gray", "&.Mui-selected": { color: "pink", fontWeight: "bold" } }} />
      </Tabs>

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
        setLoading={setLoading}
        setFollowersList={setFollowersList}
        setFollowingList={setFollowingList}
        followers={followersList}
        following={followingList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        onFollowToggle={async () => {
          // Refresh the followers list whenever a follow/unfollow action happens in the dialog
          await fetchFollowersAndFollowing();
        }}
      />

      
    </div>
  );
};

export default UserHeader;