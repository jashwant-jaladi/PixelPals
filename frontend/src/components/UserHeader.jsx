import React, { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import ShareIcon from '@mui/icons-material/Share';
import { pink } from '@mui/material/colors';

const UserHeader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyProfileUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setSnackbarOpen(true); 
    }).catch(err => {
      console.error('Failed to copy profile URL:', err);
    });
    handleClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close Snackbar
  };

  return (
    <div>
      <div className='flex justify-between mt-20'>
        <div className='pt-10'>
          <div className='text-3xl font-bold'>Winston Shamraj</div>
          <div className='flex gap-2 mt-2'>
            <div className='text-xl font-bold'>theShamraj</div>
            <div className='text-sm py-1 text-pink-700 font-bold bg-pink-400 px-1 rounded-lg'>PixelPals.net</div>
          </div>
        </div>
        <Avatar src="https://i.pravatar.cc/300?u=theShamraj" sx={{ width: 150, height: 150 }} />
      </div>
      <p className='py-5 w-[90%] font-bold'>Just a tech lover navigating the world of code. Coffee addict, gym enthusiast, and avid reader. Always up for a good challenge and new adventures. #CodeLife #GymRat #Bookworm</p>
      <div className='flex justify-between'>
        <div className='flex gap-2 text-pink-700 font-bold items-center'>
          <div>3.2k followers</div>
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleCopyProfileUrl}>
                Copy Profile URL
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Profile URL copied to clipboard &#128513;"
        ContentProps={{
            sx: {
              backgroundColor: 'green', // Background color
              color: 'black',
              fontWeight: 'bold', // Text color
              borderRadius: '4px',
              padding: '8px 16px',
            }
          }}
      />
  
  <div className='flex justify-evenly mt-8 font-bold text-xl'>
    <div className='w-[50%] border-b-2 text-center'>
    <div >Posts</div>
    </div>
    <div className='w-[50%] border-b-2 border-gray-500 text-center'>
    <div className='text-gray-500'>Replies</div>
    </div>
  </div>
    </div>
    
  );
}

export default UserHeader;
