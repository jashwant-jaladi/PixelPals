import React, { useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
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
      const response = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.error) {
        setErrorSnackbarOpen(true);
        return;
      }

      if (following) {
        user.followers.pop();
        setSnackbarMessage(`You have unfollowed ${user.name}.`);
      } else {
        user.followers.push(currentUser._id);
        setSnackbarMessage(`You are now following ${user.name}!`);
      }

      setFollowing(!following);
      setSnackbarOpen(true);
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
      const response = await fetch(`/api/users/follow-unfollow/${user._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      setFollowersList(data.followers);
      setFollowingList(data.following);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
    setLoading(false);
  };

  return (
    <div className="font-parkinsans">
      <div className="flex justify-between items-center mt-20 w-full">
        <div className="pt-10">
          <div className="text-3xl font-bold">{user.name}</div>
          <div className="flex gap-2 mt-2 items-center">
            <div className="text-xl font-bold">@{user.username}</div>
            <div className="text-sm py-1 text-pink-700 font-bold bg-pink-400 px-1 rounded-lg">
              PixelPals.net
            </div>
          </div>
        </div>
        <Avatar src={user.profilePic} sx={{ width: 170, height: 170 }} />
      </div>

      <p className="py-5 w-[90%] font-bold">{user.bio}</p>

      {currentUser?._id === user?._id ? (
        <button className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">
          <Link to="/update">Edit Profile</Link>
        </button>
      ) : (
        <button
          onClick={handleFollowToggle}
          className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300 flex items-center justify-center"
          disabled={updating}
        >
          {updating ? <CircularProgress size={24} color="inherit" /> : following ? "Unfollow" : "Follow"}
        </button>
      )}

      <div className="flex justify-between">
        <div
          className="flex gap-2 text-pink-700 font-bold items-center cursor-pointer"
          onClick={() => {
            fetchFollowersAndFollowing();
            setFollowersDialogOpen(true);
          }}
        >
          <div>{user.followers.length} followers</div>
          <span className="font-bold">.</span>
          <div>{user.following.length} following</div>
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
        onClose={() => setFollowersDialogOpen(false)}
        loading={loading}
        followers={followersList}  
        following={followingList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    </div>
  );
};

export default UserHeader;
