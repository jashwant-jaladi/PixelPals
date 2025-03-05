import React, { useEffect, useState } from "react";
import { Avatar, Button, Box, Typography, Stack, CircularProgress } from "@mui/material";
import { acceptFollow, rejectFollow } from "../apis/followApi";
import { fetchUserById } from "../apis/userApi";

const FollowRequest = ({ currentUser, setFollowRequestCount, setCurrentUser, userData }) => {
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestedUsers = async () => {
      if (!currentUser?.Requested?.length) {
        setLoading(false);
        setRequestedUsers([]);
        return;
      }

      try {
        const usersPromises = currentUser.Requested.map(async (userId) => {
          try {
            return await fetchUserById(userId);
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });

        const usersData = await Promise.all(usersPromises);
        setRequestedUsers(usersData.filter((user) => user));
      } catch (error) {
        console.error("Error fetching requested users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestedUsers();
  }, [currentUser]);

  const handleAccept = async (userId) => {
    if (!currentUser?._id) return;

    try {
      const response = await acceptFollow(currentUser._id, userId);

      if (response.error) {
        console.error("Error accepting follow:", response.error);
        return;
      }

      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
      setCurrentUser((prev) => ({
        ...prev,
        followers: [...prev.followers, userId],
        Requested: prev.Requested.filter((id) => id !== userId),
      }));
      setFollowRequestCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error in handleAccept:", error);
    }
  };

  const handleReject = async (userId) => {
    if (!currentUser?._id) return;

    try {
      const response = await rejectFollow(currentUser._id, userId);

      if (response.error && !response.error.includes("No follow request")) {
        console.error("Error rejecting follow:", response.error);
        return;
      }

      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
      setCurrentUser((prev) => ({
        ...prev,
        Requested: prev.Requested.filter((id) => id !== userId),
      }));
      setFollowRequestCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error in handleReject:", error);
    }
  };

  if (currentUser._id !== userData._id) {
    return (
      <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium mt-6">
        You are not allowed to see follow requests for this user
      </p>
    );
  }

  return (
    <div className="w-full mt-6 p-4 bg-inherit rounded-lg text-white">
      {loading ? (
        <div className="flex justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : requestedUsers.length === 0 ? (
        <p className="flex justify-center mx-auto w-full text-pink-700 text-xl text-opacity-90 font-medium">
          No new Follow Requests
        </p>
      ) : (
        <div className="space-y-4">
          {requestedUsers.map((user) => (
            <Box
              key={user._id}
              className="flex flex-col sm:flex-row items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800 shadow-md"
            >
              {/* User Info */}
              <Stack direction="row" spacing={2} alignItems="center" className="w-full sm:w-auto ">
                <Avatar src={user.profilePic} alt={user.name} />
                <Box>
                  <Typography variant="body1" className="font-bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    @{user.username}
                  </Typography>
                </Box>
              </Stack>

              {/* Buttons */}
              <Stack
                direction="row"
                spacing={2}
                className="w-full sm:w-auto mt-4 sm:mt-0 justify-end"
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleAccept(user._id)}
                  sx={{
                    backgroundColor: "green",
                    "&:hover": { backgroundColor: "darkgreen" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleReject(user._id)}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Reject
                </Button>
              </Stack>
            </Box>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowRequest;