import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import getUser from '../Atom/getUser';
import { useRecoilValue } from 'recoil';
import Snackbar from '@mui/material/Snackbar';
import { pink } from '@mui/material/colors';
const SuggestedUser = ({ user }) => {
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); // New error snackbar
  const currentUser = useRecoilValue(getUser);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to follow users.');
      setSnackbarOpen(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/users/follow/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.error) {
        setErrorSnackbarOpen(true);
      }

      if (following) {
        setSnackbarMessage(`You have unfollowed ${user.name}.`);
        user.followers = user.followers.filter(followerId => followerId !== currentUser._id); // Avoid direct mutation
      } else {
        setSnackbarMessage(`You are now following ${user.name}!`);
        user.followers.push(currentUser._id); // Again, avoid direct mutation
      }

      setFollowing(!following);
    } catch (error) {
      console.error(error);
      setErrorSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  // Close error snackbar
  const handleErrorSnackbarClose = () => {
    setErrorSnackbarOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" >
        {/* Left side */}
        <Stack direction="row" spacing={2} component={Link} to={`/${user.username}`} alignItems="center">
          <Avatar src={user.profilePic} />
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.name}
            </Typography>
          </Box>
        </Stack>

        {/* Right side */}
        <Button
          size="small"
          color="primary"
          variant={following ? 'outlined' : 'contained'}
          onClick={handleFollowUnfollow}
          disabled={updating}
          sx={{
            minWidth: 80,
            backgroundColor: pink[500], 
            '&:hover': {
              backgroundColor: pink[700], 
            },
            '&:disabled': {
              backgroundColor: pink[100], 
            },
            color: 'black', 
            fontWeight: 'bold', 
          }}
        >
          {following ? 'Unfollow' : 'Follow'}
        </Button>
      </Stack>

      {/* Success Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: 'green',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '4px',
            padding: '8px 16px',
          },
        }}
      />

      {/* Error Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        message="An error occurred. Please try again later."
        ContentProps={{
          sx: {
            backgroundColor: 'red',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '4px',
            padding: '8px 16px',
          },
        }}
      />
    </>
  );
};

export default SuggestedUser;
