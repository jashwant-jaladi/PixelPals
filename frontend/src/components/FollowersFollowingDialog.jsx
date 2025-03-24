import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { Avatar } from "@mui/material";
import { followUser } from "../apis/followApi";
import {useNavigate} from "react-router-dom";

const FollowersFollowingDialog = ({
  open,
  onClose,
  loading,
  setFollowingList,
  followers,
  following,
  selectedTab,
  setSelectedTab,
  currentUser,
  currentUserFollowing=[],
}) => {
  const [selectedList, setSelectedList] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [followingMap, setFollowingMap] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const map = {};
    currentUserFollowing.forEach(id => {
      map[id] = true;
    });
    setFollowingMap(map);
  }, [currentUserFollowing]);

  useEffect(() => {
    // Make sure we have unique users by ID in the selected list
    const uniqueUsers = selectedTab === "followers" 
      ? removeDuplicateById(followers) 
      : removeDuplicateById(following);
    setSelectedList(uniqueUsers);
  }, [selectedTab, followers, following]);

  // Helper function to remove duplicates by ID
  const removeDuplicateById = (users) => {
    const uniqueMap = {};
    return users.filter(user => {
      if (user._id && !uniqueMap[user._id]) {
        uniqueMap[user._id] = true;
        return true;
      }
      return false;
    });
  };

  async function handleFollowUnfollow(userId, isFollowing) {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }));
  
    try {
      // API call
      const response = await followUser(userId);
      if (!response?.success) throw new Error("Follow/unfollow failed");
  
      // Update local state only after successful API call
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !isFollowing
      }));
  
      // If current user is unfollowing someone
      if (isFollowing) {
        setFollowingList((prev) => prev.filter((user) => user._id !== userId));
      } else {
        // If current user is following someone
        const newUser = followers.find((user) => user._id === userId) || following.find((user) => user._id === userId);
        if (newUser) {
          setFollowingList((prev) => [...prev, newUser]);
        }
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      // Revert the UI state if the API call fails
      setFollowingMap(prev => ({
        ...prev,
        [userId]: isFollowing // Revert to the previous state
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth={isMobile ? "xs" : "sm"}
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: 'black',
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : '90vh',
          m: isMobile ? 0 : 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontFamily: "Parkinsans",
          color: "white",
          bgcolor: "black",
          fontWeight: "bold",
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
          py: { xs: 1.5, sm: 2 }
        }}
      >
        {selectedTab === "followers" ? "Followers" : "Following"}
      </DialogTitle>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        centered
        sx={{ 
          bgcolor: "black", 
          ".MuiTabs-indicator": { bgcolor: "pink" },
          mb: { xs: 1, sm: 2 }
        }}
      >
        <Tab 
          label="Followers" 
          value="followers" 
          sx={{ 
            color: "gray", 
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }} 
        />
        <Tab 
          label="Following" 
          value="following" 
          sx={{ 
            color: "gray", 
            "&.Mui-selected": { color: "pink", fontWeight: "bold" },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }} 
        />
      </Tabs>

      <DialogContent sx={{ bgcolor: "black", p: { xs: 1, sm: 2 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: pink[500] }} />
          </Box>
        ) : selectedList.length > 0 ? (
          <Stack spacing={2}>
            {selectedList.map((user) => {
              const isFollowing = followingMap[user._id] || false;
              const isLoading = loadingStates[user._id] || false;

              return (
                <Box 
                  key={user._id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: { xs: 2, sm: 3 },
                    border: '2px solid',
                    borderColor: 'pink.500',
                    borderRadius: 2,
                    bgcolor: 'black',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 2, sm: 3 },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/${user.username}`)}
                  >
                    <Avatar 
                      src={user.profilePic} 
                      alt={user.name} 
                      sx={{ 
                        width: { xs: 45, sm: 55 }, 
                        height: { xs: 45, sm: 55 } 
                      }} 
                    />
                    <Box>
                      <Typography 
                        sx={{ 
                          fontFamily: "Parkinsans",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontFamily: "Parkinsans",
                          color: "gray.600",
                          fontSize: { xs: '0.8rem', sm: '0.9rem' }
                        }}
                      >
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>

                  {user._id === currentUser?._id ? (
                    <Button 
                      disabled 
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        fontWeight: "bold",
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        borderRadius: 2,
                        bgcolor: 'gray.900',
                        color: 'gray.500',
                        border: '2px solid',
                        borderColor: 'gray.700',
                        cursor: 'not-allowed',
                        fontFamily: "Parkinsans"
                      }}
                    >
                      You
                    </Button>
                  ) : user?.Requested?.includes(currentUser._id) ? (
                    <Button 
                      disabled 
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        fontWeight: "bold",
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        borderRadius: 2,
                        bgcolor: 'gray.700',
                        color: 'gray.400',
                        border: '2px solid',
                        borderColor: 'gray.500',
                        cursor: 'not-allowed',
                        fontFamily: "Parkinsans"
                      }}
                    >
                      Requested
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollowUnfollow(user._id, isFollowing)}
                      disabled={isLoading}
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        fontWeight: "bold",
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'pink.500',
                        color: isLoading ? 'white' : 'pink.500',
                        bgcolor: isLoading ? 'gray.500' : 'transparent',
                        '&:hover': {
                          bgcolor: 'pink.700',
                          color: 'white'
                        },
                        transition: 'all 0.3s ease',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: "Parkinsans"
                      }}
                    >
                      {isLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography 
            sx={{ 
              textAlign: "center", 
              color: "gray.500", 
              py: { xs: 4, sm: 6 },
              fontFamily: "Parkinsans",
              fontWeight: "bold",
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            No {selectedTab} yet.
          </Typography>
        )}
      </DialogContent>

      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "black", display: 'flex', justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            bgcolor: pink[700],
            color: "white",
            fontFamily: "Parkinsans",
            fontWeight: "bold",
            px: { xs: 3, sm: 4 },
            py: { xs: 0.75, sm: 1 },
            '&:hover': {
              bgcolor: pink[800]
            }
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default FollowersFollowingDialog;