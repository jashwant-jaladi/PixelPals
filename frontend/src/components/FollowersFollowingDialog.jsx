import React, { useMemo, useState } from "react";
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

const FollowersFollowingDialog = ({
  open,
  onClose,
  loading,
  setLoading,
  setFollowersList,
  setFollowingList,
  followers,
  following,
  selectedTab,
  setSelectedTab,
}) => {
  const [processingId, setProcessingId] = useState(null);

  const selectedList = useMemo(
    () => (selectedTab === "followers" ? followers : following),
    [selectedTab, followers, following]
  );

  const isFollowingUser = (userId) => {
    return following.some(user => user._id === userId);
  };

  const followUnfollowDialog = async (userId, isFollowing) => {
    try {
      // Update both lists simultaneously
      setFollowersList((prevFollowers) =>
        prevFollowers.map((user) =>
          user._id === userId ? { ...user, isFollowing: !isFollowing } : user
        )
      );

      // If unfollowing, remove from following list
      if (isFollowing) {
        setFollowingList((prevFollowing) =>
          prevFollowing.filter((user) => user._id !== userId)
        );
      } else {
        // If following, add to following list if not already present
        const userToAdd = followers.find(user => user._id === userId);
        if (userToAdd && !following.some(user => user._id === userId)) {
          setFollowingList((prevFollowing) => [...prevFollowing, { ...userToAdd, isFollowing: true }]);
        }
      }

      setProcessingId(userId);
      setLoading(true);

      const response = await fetch("/api/users/followUnfollowDialog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Follow/unfollow failed");
      }

    } catch (error) {
      console.error("Follow/unfollow error:", error);

      // Rollback both lists in case of failure
      setFollowersList((prevFollowers) =>
        prevFollowers.map((user) =>
          user._id === userId ? { ...user, isFollowing: isFollowing } : user
        )
      );

      if (isFollowing) {
        // Restore to following list if was previously following
        const userToRestore = followers.find(user => user._id === userId);
        if (userToRestore) {
          setFollowingList((prevFollowing) => [...prevFollowing, { ...userToRestore, isFollowing: true }]);
        }
      } else {
        // Remove from following list if was previously not following
        setFollowingList((prevFollowing) =>
          prevFollowing.filter((user) => user._id !== userId)
        );
      }
    } finally {
      setProcessingId(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" scroll="paper">
      <DialogTitle
        className="text-center font-bold text-xl"
        style={{
          fontFamily: "Parkinsans",
          color: "white",
          backgroundColor: "black",
          fontWeight: "bold",
        }}
      >
        {selectedTab === "followers" ? "Followers" : "Following"}
      </DialogTitle>

      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        centered
        sx={{
          backgroundColor: "black",
          ".MuiTabs-indicator": { backgroundColor: "pink" },
        }}
      >
        <Tab
          label="Followers"
          value="followers"
          sx={{
            color: "gray",
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
          }}
        />
        <Tab
          label="Following"
          value="following"
          sx={{
            color: "gray",
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
          }}
        />
      </Tabs>

      <DialogContent className="bg-black">
        {loading ? (
          <div className="flex justify-center bg-black">
            <CircularProgress color="secondary" />
          </div>
        ) : selectedList.length > 0 ? (
          <ul>
            {selectedList.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between p-4 border-2 border-pink-500 bg-black rounded-lg mb-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.profilePic} alt={user.name} sx={{ width: 55, height: 55 }} />
                  <div>
                    <div className="font-bold text-lg" style={{ fontFamily: "Parkinsans", color: "white" }}>
                      {user.name}
                    </div>
                    <div className="text-gray-600 text-sm" style={{ fontFamily: "Parkinsans" }}>
                      @{user.username}
                    </div>
                  </div>
                </div>
                {selectedTab === "followers" && (
                  <button
                    onClick={() => followUnfollowDialog(user._id, isFollowingUser(user._id))}
                    disabled={processingId === user._id}
                    className="text-sm font-bold px-4 py-2 rounded-lg border-2 border-pink-500 text-pink-500 hover:bg-pink-700 hover:text-white transition-all duration-300 tracking-wide"
                    style={{ fontFamily: "Parkinsans" }}
                  >
                    {processingId === user._id
                      ? "Processing..."
                      : isFollowingUser(user._id)
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
                {selectedTab === "following" && (
                  <button
                    onClick={() => followUnfollowDialog(user._id, true)}
                    disabled={processingId === user._id}
                    className="text-sm font-bold px-4 py-2 rounded-lg border-2 border-pink-500 text-pink-500 hover:bg-pink-700 hover:text-white transition-all duration-300 tracking-wide"
                    style={{ fontFamily: "Parkinsans" }}
                  >
                    {processingId === user._id
                      ? "Processing..."
                      : "Unfollow"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-6" style={{ fontFamily: "Parkinsans", fontWeight: "bold" }}>
            No {selectedTab} yet.
          </p>
        )}
      </DialogContent>

      <div className="flex justify-center p-4 bg-black">
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            backgroundColor: pink[700],
            color: "white",
            fontFamily: "Parkinsans",
            fontWeight: "bold",
          }}
        >
          Close
        </Button>
      </div>
    </Dialog>
  );
};

export default FollowersFollowingDialog;