import React, { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import ShareIcon from '@mui/icons-material/Share';
import { pink } from '@mui/material/colors';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { Link } from 'react-router-dom';

const UserHeader = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(''); 
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); // New error snackbar
  const currentUser = useRecoilValue(getUser);
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [updating,SetUpdating] = useState(false);

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
      console.log(data)
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
      <div className='flex justify-between mt-20'>
        <div className='pt-10'>
          <div className='text-3xl font-bold'>{user.name}</div>
          <div className='flex gap-2 mt-2'>
            <div className='text-xl font-bold'>{user.username}</div>
            <div className='text-sm py-1 text-pink-700 font-bold bg-pink-400 px-1 rounded-lg'>PixelPals.net</div>
          </div>
        </div>
        <Avatar src={user.profilePic} sx={{ width: 150, height: 150 }} />
      </div>
      <p className='py-5 w-[90%] font-bold'>{user.bio}</p>
      {currentUser?._id === user?._id && (
        <button className='text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300'>
          <Link to="/update">Edit Profile</Link>
        </button>
      )}

{currentUser?._id !== user?._id && (
        <button
          onClick={handleFollowToggle}
          className="text-pink-700 font-bold border-2 border-pink-700 px-3 py-1 rounded-md glasseffect hover:bg-pink-700 hover:text-white transition duration-300 flex items-center justify-center"
          disabled={updating} // Disable button while updating
        >
          {updating ? (
            <CircularProgress size={24} color="inherit" /> // Show spinner if updating
          ) : (
            following ? 'Unfollow' : 'Follow'
          )}
        </button>
      )}

      <div className='flex justify-between'>
        <div className='flex gap-2 text-pink-700 font-bold items-center'>
          <div>{user.followers ? user.followers.length : 0} followers</div>
          <span className='font-bold'>.</span>
          <div>instagram.com</div>
        </div>
        <div className='flex gap-4'>
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

      <div className='flex justify-evenly mt-8 font-bold text-xl'>
        <div className='w-[50%] border-b-2 text-center'>
          <div>Posts</div>
        </div>
        <div className='w-[50%] border-b-2 border-gray-500 text-center'>
          <div className='text-gray-500'>Replies</div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
