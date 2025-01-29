import React, { useMemo } from "react";
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
  followers = [],
  following = [],
  selectedTab,
  setSelectedTab,
}) => {
  const selectedList = useMemo(
    () => (selectedTab === "followers" ? followers : following),
    [selectedTab, followers, following]
  );

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

      {/* Tabs to toggle between Followers & Following */}
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
                className="flex items-center justify-between p-4 border-2 border-pink-500 bg-black rounded-lg"
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
                <button
                  onClick={() => handleFollowToggle(user._id, selectedTab === "following")}
                  className="text-sm font-bold px-4 py-2 rounded-lg border-2 border-pink-500 text-pink-500 hover:bg-pink-700 hover:text-white transition-all duration-300 tracking-wide"
                  style={{ fontFamily: "Parkinsans" }}
                >
                  {selectedTab === "following" ? "Unfollow" : "Follow"}
                </button>
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
