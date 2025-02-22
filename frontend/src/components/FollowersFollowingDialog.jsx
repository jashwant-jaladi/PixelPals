import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { Avatar } from "@mui/material";
import { followUser } from "../apis/followApi";

const FollowersFollowingDialog = ({
  open,
  onClose,
  loading,
  setLoading,
  setFollowingList,
  followers,
  following,
  selectedTab,
  setSelectedTab,
  currentUser,
}) => {
  const [selectedList, setSelectedList] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    setSelectedList(selectedTab === "followers" ? followers : following);
  }, [selectedTab, followers, following]);

  async function handleFollowUnfollow(userId, isFollowing) {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }));

    try {
      if (isFollowing) {
        setFollowingList((prev) => prev.filter((user) => user._id !== userId));
      } else {
        const newUser = followers.find((user) => user._id === userId) || following.find((user) => user._id === userId);
        if (newUser) {
          setFollowingList((prev) => [...prev, newUser]);
        }
      }

      setSelectedList(selectedTab === "followers" ? followers : following);

      // API call
      const response = await followUser(userId);
      if (!response?.success) throw new Error("Follow/unfollow failed");
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedList(newValue === "followers" ? followers : following);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" scroll="paper">
      <DialogTitle
        className="text-center font-bold text-xl"
        style={{ fontFamily: "Parkinsans", color: "white", backgroundColor: "black", fontWeight: "bold" }}
      >
        {selectedTab === "followers" ? "Followers" : "Following"}
      </DialogTitle>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        centered
        sx={{ backgroundColor: "black", ".MuiTabs-indicator": { backgroundColor: "pink" } }}
      >
        <Tab label="Followers" value="followers" sx={{ color: "gray", "&.Mui-selected": { color: "pink", fontWeight: "bold" } }} />
        <Tab label="Following" value="following" sx={{ color: "gray", "&.Mui-selected": { color: "pink", fontWeight: "bold" } }} />
      </Tabs>

      <DialogContent className="bg-black">
        {loading ? (
          <div className="flex justify-center bg-black">
            <CircularProgress color="secondary" />
          </div>
        ) : selectedList.length > 0 ? (
          <ul>
            {selectedList.map((user) => {
              const isFollowing = following.some((f) => f._id === user._id);
              const isLoading = loadingStates[user._id] || false;

              return (
                <li key={user._id} className="flex items-center justify-between p-4 border-2 border-pink-500 bg-black rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.profilePic} alt={user.name} sx={{ width: 55, height: 55 }} />
                    <div>
                      <div className="font-bold text-lg" style={{ fontFamily: "Parkinsans", color: "white" }}>{user.name}</div>
                      <div className="text-gray-600 text-sm" style={{ fontFamily: "Parkinsans" }}>@{user.username}</div>
                    </div>
                  </div>

                  {user._id === currentUser?._id ? (
                    <button disabled className="text-sm font-bold px-4 py-2 rounded-lg bg-gray-900 text-gray-500 border-2 border-gray-700 cursor-not-allowed" style={{ fontFamily: "Parkinsans" }}>You</button>
                  ) : (
                    <button
                      onClick={() => handleFollowUnfollow(user._id, isFollowing)}
                      disabled={isLoading}
                      className={`text-sm font-bold px-4 py-2 rounded-lg border-2 border-pink-500 
                        ${isLoading ? "bg-gray-500 text-white cursor-not-allowed" : "text-pink-500 hover:bg-pink-700 hover:text-white transition-all duration-300 tracking-wide"}`}
                      style={{ fontFamily: "Parkinsans" }}
                    >
                      {isLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-6" style={{ fontFamily: "Parkinsans", fontWeight: "bold" }}>No {selectedTab} yet.</p>
        )}
      </DialogContent>

      <div className="flex justify-center p-4 bg-black">
        <Button onClick={onClose} variant="outlined" sx={{ backgroundColor: pink[700], color: "white", fontFamily: "Parkinsans", fontWeight: "bold" }}>Close</Button>
      </div>
    </Dialog>
  );
};

export default FollowersFollowingDialog;