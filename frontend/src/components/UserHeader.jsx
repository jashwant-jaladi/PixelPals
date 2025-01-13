import React, { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress, Tabs, Tab, Box } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import ShareIcon from '@mui/icons-material/Share';
import { pink } from '@mui/material/colors';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { Link } from 'react-router-dom';


const UserHeader = ({ user, setTabIndex, tabIndex }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); 
  const currentUser = useRecoilValue(getUser);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [updating, SetUpdating] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyProfileUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => setSnackbarOpen(true))
      .catch((err) => console.error('Failed to copy profile URL:', err));
    handleClose();
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleErrorSnackbarClose = () => setErrorSnackbarOpen(false);

  const handleFollowToggle = async () => {
    if(!currentUser){
      setSnackbarMessage('You must be logged in to follow users.');
      setSnackbarOpen(true);
      return;
    }
    SetUpdating(true);
    try {
      const response = await fetch(`/api/users/follow/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if(data.error){
        setErrorSnackbarOpen(true);
      }
      if(following){
        setSnackbarOpen(true);
        user.followers.pop();
        setSnackbarMessage(`You have unfollowed ${user.name}.`);
      }else{
        setSnackbarOpen(true);
        user.followers.push(currentUser._id);
        setSnackbarMessage(`You are now following ${user.name}!`);
      }
      setFollowing(!following);
    } catch (error) {
      console.error(error);
      setErrorSnackbarOpen(true);
    }
    finally{
      SetUpdating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-20 w-full">
        <div className="pt-10">
          <div className="text-3xl font-bold">{user.name}</div>
          <div className="flex gap-2 mt-2 items-center">
            <div className="text-xl font-bold">{user.username}</div>
            <div className="text-sm py-1 text-pink-700 font-bold bg-pink-400 px-1 rounded-lg">
              PixelPals.net
            </div>
          </div>
        </div>
        <div className="ml-4">
          <Avatar src={user.profilePic} sx={{ width: 170, height: 170 }} />
        </div>
      </div>

      <p className="py-5 w-[90%] font-bold">{user.bio}</p>
      {currentUser?._id === user?._id && (
        <button className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300">
          <Link to="/update">Edit Profile</Link>
        </button>
      )}

      {currentUser?._id !== user?._id && (
        <button
          onClick={handleFollowToggle}
          className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300 flex items-center justify-center"
          disabled={updating}
        >
          {updating ? <CircularProgress size={24} color="inherit" /> : following ? 'Unfollow' : 'Follow'}
        </button>
      )}

      <div className="flex justify-between">
        <div className="flex gap-2 text-pink-700 font-bold items-center">
          <div>{user.followers ? user.followers.length : 0} followers</div>
          <span className="font-bold">.</span>
          <div>instagram.com</div>
        </div>
        <div className="flex gap-4">
          <IconButton sx={{ color: pink[500] }}>
            <InstagramIcon />
          </IconButton>
          <div>
            <IconButton onClick={handleClick} sx={{ color: pink[500] }}>
              <ShareIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={handleCopyProfileUrl}>Copy Profile URL</MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      <Box
  sx={{
    width: '100%',
    borderBottom: 1,
    borderColor: 'divider',
    mt: 3,
    display: 'flex',
    justifyContent: 'center',
  }}
>

<Tabs
  value={tabIndex} // Use tabIndex to track the active tab
  onChange={(event, newValue) => setTabIndex(newValue)} // Update tabIndex when the tab changes
  aria-label="User content tabs"
  centered
  sx={{
    '.MuiTabs-indicator': {
      backgroundColor: 'pink', // Pink color for the underline
    },
  }}
>
  <Tab
    label="Posts"
    sx={{
      color: 'gray', // Default tab color
      '&.Mui-selected': {
        color: 'pink', // Pink color for the selected tab
        fontWeight: 'bold',
      },
      textTransform: 'none', // Keeps the label text as is
      fontSize: '16px',
    }}
  />
  <Tab
    label="Followers"
    sx={{
      color: 'gray', // Default tab color
      '&.Mui-selected': {
        color: 'pink', // Pink color for the selected tab
        fontWeight: 'bold',
      },
      textTransform: 'none', // Keeps the label text as is
      fontSize: '16px',
    }}
  />
</Tabs>
</Box>

      
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: 'green',
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '4px',
            padding: '8px 16px',
          },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        message={snackbarMessage}
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
    </div>
  );
};

export default UserHeader;
