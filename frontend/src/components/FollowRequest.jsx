import React, { useEffect, useState } from "react";
import { 
  Avatar, 
  Button, 
  Box, 
  Typography, 
  Stack, 
  CircularProgress, 
  Paper,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { acceptFollow, rejectFollow } from "../apis/followApi";
import { fetchUserById } from "../apis/userApi";
import { useRecoilState } from "recoil";
import getUser from "../Atom/getUser";

const FollowRequest = ({ userData, setFollowRequestCount }) => {
  const [currentUser, setCurrentUser] = useRecoilState(getUser);
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      // Immediately update the UI by removing this user from the list
      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
      
      // Update the currentUser state with the new follower and remove from Requested
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followers: [...(prev.followers || []), userId],
          Requested: (prev.Requested || []).filter((id) => id !== userId),
        };
      });
      
      // Update the follow request count
      setFollowRequestCount((prev) => Math.max(0, prev - 1));
      
      // Force update userData in parent component by dispatching a custom event
      window.dispatchEvent(new CustomEvent('followStatusChanged', { 
        detail: { userId, action: 'accept' } 
      }));
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

      // Immediately update the UI by removing this user from the list
      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
      
      // Update the currentUser state to remove from Requested
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          Requested: (prev.Requested || []).filter((id) => id !== userId),
        };
      });
      
      // Update the follow request count
      setFollowRequestCount((prev) => Math.max(0, prev - 1));
      
      // Force update userData in parent component by dispatching a custom event
      window.dispatchEvent(new CustomEvent('followStatusChanged', { 
        detail: { userId, action: 'reject' } 
      }));
    } catch (error) {
      console.error("Error in handleReject:", error);
    }
  };

  if (currentUser?._id !== userData?._id) {
    return (
      <Box sx={{ textAlign: 'center'  }}>
        <p className="text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium mt-6">
          You are not allowed to see follow requests for this user
        </p>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 2, p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: pink[500] }} />
        </Box>
      ) : requestedUsers.length === 0 ? (
        <Box sx={{ textAlign: 'center'}}>
        <p className="text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium">no new follow requests</p>
        </Box>
      ) : (
        <Stack spacing={2}>
          {requestedUsers.map((user) => (
            <Paper
              key={user._id}
              elevation={1}
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'center', sm: 'flex-start' }}
                justifyContent="space-between"
              >
                {/* User Info */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar 
                    src={user.profilePic} 
                    alt={user.name} 
                    sx={{ 
                      width: { xs: 40, sm: 48 }, 
                      height: { xs: 40, sm: 48 },
                      border: `2px solid ${pink[200]}`
                    }}
                  />
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontFamily: 'Parkinsans',
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {user.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontFamily: 'Parkinsans',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      @{user.username}
                    </Typography>
                  </Box>
                </Stack>

                {/* Buttons */}
                <Stack 
                  direction="row" 
                  spacing={2} 
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    mt: { xs: 2, sm: 0 },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' }
                  }}
                >
                  <Button
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                    onClick={() => handleAccept(user._id)}
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': { bgcolor: 'success.dark' },
                      minWidth: { xs: '45%', sm: '80px' },
                      fontFamily: 'Parkinsans'
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size={isMobile ? "small" : "medium"}
                    onClick={() => handleReject(user._id)}
                    sx={{ 
                      minWidth: { xs: '45%', sm: '80px' },
                      fontFamily: 'Parkinsans'
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FollowRequest;