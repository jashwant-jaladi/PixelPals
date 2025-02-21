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
import { followUnfollowUserDialog } from "../apis/followApi"; // Import the API service

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
  currentUser,
}) => {
  const [processingId, setProcessingId] = useState(null);
  const [selectedList, setSelectedList] = useState([]);

  // Update the selected list whenever the dialog opens, tab changes, or lists update
  useEffect(() => {
    if (open) {
      // Ensure we're using the latest data
      setSelectedList(selectedTab === "followers" ? followers : following);
    }
  }, [open, selectedTab, followers, following]);

  const isFollowingUser = (userId) => {
    return following.some(user => user._id === userId);
  };

  const followUnfollowDialog = async (userId, isFollowing) => {
    let isMounted = true;
    setProcessingId(userId);
    setLoading(true);
  
    try {
      // Optimistic UI update
      setFollowersList((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isFollowing: !isFollowing } : user
        )
      );
  
      if (isFollowing) {
        setFollowingList((prev) => prev.filter((user) => user._id !== userId));
      } else {
        const userToAdd = followers.find(user => user._id === userId);
        if (userToAdd && !following.some(user => user._id === userId)) {
          setFollowingList((prev) => [...prev, { ...userToAdd, isFollowing: true }]);
        }
      }
  
      await followUnfollowUserDialog(userId);
  
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      // Note: setSnackbarMessage and setSnackbarOpen aren't defined in this component
      // You may need to add these as props or define them locally
      
      if (isMounted) {
        // Rollback in case of failure
        setFollowersList((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isFollowing: isFollowing } : user
          )
        );
  
        if (isFollowing) {
          const userToRestore = followers.find(user => user._id === userId);
          if (userToRestore) {
            setFollowingList((prev) => [...prev, { ...userToRestore, isFollowing: true }]);
          }
        } else {
          setFollowingList((prev) => prev.filter((user) => user._id !== userId));
        }
      }
    } finally {
      if (isMounted) {
        setProcessingId(null);
        setLoading(false);
      }
    }
  
    return () => {
      isMounted = false;
    };
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Immediately update the selectedList based on the new tab
    setSelectedList(newValue === "followers" ? followers : following);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs" 
      scroll="paper"
      TransitionProps={{
        onEntered: () => {
          // Force update the selected list when dialog fully opens
          setSelectedList(selectedTab === "followers" ? followers : following);
        }
      }}
    >
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
        onChange={handleTabChange}
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
        {loading && processingId === null ? (
          <div className="flex justify-center bg-black">
            <CircularProgress color="secondary" />
          </div>
        ) : selectedList.length > 0 ? (
          <ul>
            {selectedList.map((user) => {
  // 🔥 Updated: Read `followersList` directly for real-time updates
  const isFollowing = followers.some(follower => follower._id === user._id);

  return (
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

      {user._id === currentUser?._id ? (
        <button
          disabled
          className="text-sm font-bold px-4 py-2 rounded-lg bg-gray-900 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
          style={{ fontFamily: "Parkinsans" }}
        >
          You
        </button>
      ) : (
        <button
          onClick={() => followUnfollowDialog(user._id, isFollowing)}
          disabled={processingId === user._id}
          className={`text-sm font-bold px-4 py-2 rounded-lg border-2 border-pink-500 
            ${processingId === user._id 
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "text-pink-500 hover:bg-pink-700 hover:text-white transition-all duration-300 tracking-wide"
            }`}
          style={{ fontFamily: "Parkinsans" }}
        >
          {processingId === user._id
            ? "Processing..."
            : isFollowing
            ? "Unfollow"
            : "Follow"}
        </button>
      )}
    </li>
  );
})}

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