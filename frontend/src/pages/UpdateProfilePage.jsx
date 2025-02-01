import React, { useRef, useState } from 'react';
import { Avatar, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { pink } from '@mui/material/colors';
import { useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { useNavigate } from 'react-router-dom';
import { updateProfileAPI } from '../apis/userApi';  // Import the API logic

const UpdateProfilePage = () => {
  const [user, setUser] = useRecoilState(getUser);
  const [updating, setUpdating] = useState(false);
  const [input, setInput] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    password: '',
    profilePic: user?.profilePic || '', 
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSnackbar({ open: false, message: '', severity: 'success' });

    try {
      const data = await updateProfileAPI(user._id, input);

      if (data.error) {
        setSnackbar({
          open: true,
          message: data.error,
          severity: 'error'
        });
      } else if (data.user) {
        // Update both localStorage and Recoil state
        const updatedUser = data.user;
        localStorage.setItem('PixelPalsUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating the profile.',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setInput((prevInput) => ({
          ...prevInput,
          profilePic: e.target.result // Base64 string for the image
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setSnackbar({
        open: true,
        message: 'Please select a valid image file.',
        severity: 'error'
      });
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen font-bold'>
      <div className='border-2 border-pink-700 w-full max-w-md p-10 flex flex-col items-center glasseffect rounded-lg shadow-lg'>
        <h1 className='text-3xl font-semibold mb-4'>Update Profile</h1>
        <p className='mb-6'>Update your profile</p>
        <Avatar sx={{ width: 80, height: 80 }} src={input.profilePic} />
        <Button
          variant='contained'
          sx={{ mt: 2, color: 'white', bgcolor: pink[500], fontWeight: 'bold', ":hover": { bgcolor: pink[700] } }}
          onClick={handleFileInputClick}
        >
          Change Avatar
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <form className='w-full mt-6' onSubmit={handleUpdate}>
          <div className='mb-4'>
            <label htmlFor="name" className='block text-sm font-bold mb-1'>Full name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={input.name}
              onChange={e => setInput({ ...input, name: e.target.value })}
              className='w-full p-2 rounded-md border-2 border-pink-700 transition-all duration-300 focus:border-pink-500 focus:ring-1 text-pink-700 focus:ring-pink-500'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor="username" className='block text-sm font-bold mb-1'>User name</label>
            <input
              type="text"
              name="username"
              id="username"
              value={input.username}
              onChange={e => setInput({ ...input, username: e.target.value })}
              className='w-full p-2 rounded-md border-2 border-pink-700 transition-all duration-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-pink-700'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor="email" className='block text-sm font-bold mb-1'>Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={input.email}
              onChange={e => setInput({ ...input, email: e.target.value })}
              className='w-full p-2 text-pink-700 rounded-md border-2 border-pink-700 transition-all duration-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor="bio" className='block text-sm font-bold mb-1'>Bio</label>
            <input
              type="text"
              name="bio"
              id="bio"
              value={input.bio}
              onChange={e => setInput({ ...input, bio: e.target.value })}
              className='w-full p-2 rounded-md border-2 border-pink-700 transition-all duration-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-pink-700'
            />
          </div>
          <div className='mb-6'>
            <label htmlFor="password" className='block text-sm font-bold mb-1'>Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={input.password}
              onChange={e => setInput({ ...input, password: e.target.value })}
              className='w-full p-2 rounded-md border-2 border-pink-700 transition-all duration-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-pink-700'
            />
          </div>
          <div className='flex gap-4'>
            {updating?<CircularProgress sx={{ color: pink[500] }} />:<Button type='submit' variant='contained' color='success' className='w-full' sx={{ fontWeight: 'bold' }}>Update</Button>}
            <Button variant='outlined' color='error' className='w-full' onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={
          <Button color="inherit" onClick={handleCloseSnackbar}>
            Close
          </Button>
        }
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UpdateProfilePage;
