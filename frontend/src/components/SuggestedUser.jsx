import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, Stack, Snackbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { pink } from '@mui/material/colors';
import { followUser, requestFollow } from '../apis/followApi'; // Import requestFollow

const SuggestedUser = ({ user }) => {
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const currentUser = useRecoilValue(getUser);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [followRequested, setFollowRequested] = useState(user.Requested?.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);

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
    } catch (error) {
      console.error(error);
      setErrorSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
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

        {/* Follow Button */}
        <Button
  size="small"
  color="primary"
  variant={following ? 'outlined' : 'contained'}
  onClick={handleFollowUnfollow}
  disabled={updating || followRequested}
  sx={{
    minWidth: 100,
    backgroundColor: followRequested ? pink[300] : pink[500], // Lighter pink for better contrast
    '&:hover': {
      backgroundColor: followRequested ? pink[400] : pink[700], // Slightly darker hover effect
    },
    '&:disabled': {
      backgroundColor: pink[300], // Keeps contrast when disabled
      color: 'black', // Ensures legibility
    },
    color: followRequested ? 'black' : 'white', // Makes "Requested" easy to read
    fontWeight: 'bold',
    textTransform: 'none', // Optional: Makes text easier to read
  }}
>
  {following ? 'Unfollow' : followRequested ? 'Requested' : 'Follow'}
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
        onClose={() => setErrorSnackbarOpen(false)}
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
