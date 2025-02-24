import React, { useEffect, useState } from "react";
import { Avatar, Button, Box, Typography, Stack, CircularProgress } from "@mui/material";
import { acceptFollow, rejectFollow } from "../apis/followApi";
import { fetchUserById } from "../apis/userApi";

const FollowRequest = ({ currentUser }) => {
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
        // Fetch all user details
        const usersPromises = currentUser.Requested.map(async (userId) => {
          try {
            return await fetchUserById(userId);
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });

        const usersData = await Promise.all(usersPromises);
        
        // Filter out any null results from failed requests
        setRequestedUsers(usersData.filter(user => user));
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
      
      // Update local state regardless of the specific success response
      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error in handleAccept:", error);
    }
  };

  const handleReject = async (userId) => {
    if (!currentUser?._id) return;

    try {
      const response = await rejectFollow(currentUser._id, userId);

      // Even if we get a "No follow request" error, we should still remove it from the UI
      // since it means it's already been handled on the backend
      if (response.error && !response.error.includes("No follow request")) {
        console.error("Error rejecting follow:", response.error);
        return;
      }
      
      // Update local state regardless of backend status
      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error in handleReject:", error);
    }
  };

  return (
    <div className="w-full mt-6 p-4 bg-inherit rounded-lg text-white shadow-lg">
      <Typography variant="h5" className="text-pink-500 font-bold mb-4 text-center">
        Follow Requests
      </Typography>

      {loading ? (
        <div className="flex justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : requestedUsers.length === 0 ? (
        <p className="text-center text-pink-700 text-lg">No new follow requests</p>
      ) : (
        <div className="space-y-4">
          {requestedUsers.map((user) => (
            <Box
              key={user._id}
              className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800 shadow-md"
            >
              <Stack direction="row" spacing={2} alignItems="center">
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

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleAccept(user._id)}
                  sx={{ backgroundColor: "green", "&:hover": { backgroundColor: "darkgreen" } }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleReject(user._id)}
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