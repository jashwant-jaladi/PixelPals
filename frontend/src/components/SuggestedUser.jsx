import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, Stack, Snackbar, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { pink } from '@mui/material/colors';
import { followUser, requestFollow } from '../apis/followApi';

const SuggestedUser = ({ user, onFollowClick, renderMode = 'desktop' }) => {
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const currentUser = useRecoilValue(getUser);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [followRequested, setFollowRequested] = useState(user.Requested?.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to follow users.');
      setSnackbarOpen(true);
      return;
    }

    setUpdating(true);
    try {
      let response;

      if (user.private && !following) {
        // Private account: Send follow request
        response = await requestFollow(user._id, currentUser._id);
        if (response.error) throw new Error(response.error);

        setFollowRequested(true);
        setSnackbarMessage("Follow request sent!");
      } else {
        // Public account: Follow/unfollow directly
        response = await followUser(user._id);
        if (response.error) throw new Error(response.error);

        setFollowing(response.isFollowing);
        setSnackbarMessage(response.isFollowing ? `You are now following ${user.name}!` : `You have unfollowed ${user.name}.`);
      }
      
      // Call the parent component's callback if provided
      if (onFollowClick) {
        onFollowClick(user);
      }
    } catch (error) {
      console.error(error);
      setErrorSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${pink[100]}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)'
        },
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="space-between" 
          alignItems="center"
        >
          {/* User Info */}
          <Stack 
            direction="row" 
            spacing={1.5} 
            component={Link} 
            to={`/${user.username}`} 
            alignItems="center"
            sx={{ 
              textDecoration: 'none',
              flex: 1,
              minWidth: 0 // Allows text truncation
            }}
          >
            <Avatar 
              src={user.profilePic} 
              alt={user.name}
              sx={{ 
                width: { xs: 40, sm: 45 }, 
                height: { xs: 40, sm: 45 },
                border: `2px solid ${pink[200]}`,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography 
                variant="body1" 
                fontWeight="bold" 
                fontFamily={'Parkinsans'}
                color="text.primary"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.username}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontFamily={'Parkinsans'}
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.name}
              </Typography>
            </Box>
          </Stack>

          {/* Follow Button */}
          <Button
            size={isMobile ? "small" : "medium"}
            variant={following ? "outlined" : "contained"}
            onClick={handleFollowUnfollow}
            disabled={updating || followRequested}
            sx={{
              minWidth: { xs: 70, sm: 80 },
              backgroundColor: followRequested ? pink[300] : pink[500],
              '&:hover': {
                backgroundColor: followRequested ? pink[300] : pink[700],
              },
              '&:disabled': {
                backgroundColor: pink[300],
                opacity: 0.7,
              },
              color: "black",
              fontWeight: "bold",
              fontFamily: 'Parkinsans',
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              borderRadius: '20px',
              textTransform: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              border: following ? `1px solid ${pink[500]}` : 'none',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 0.75 },
            }}
          >
            {updating ? "..." : following ? "Unfollow" : followRequested ? "Requested" : "Follow"}
          </Button>
        </Stack>
      </CardContent>

      {/* Success Snackbar */}
      <Snackbar
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: 'success.main',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 2,
            fontFamily: 'Parkinsans',
            boxShadow: 3,
          },
        }}
      />

      {/* Error Snackbar */}
      <Snackbar
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbarOpen(false)}
        message="An error occurred. Please try again later."
        ContentProps={{
          sx: {
            backgroundColor: 'error.main',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 2,
            fontFamily: 'Parkinsans',
            boxShadow: 3,
          },
        }}
      />
    </Card>
  );
};

export default SuggestedUser;
