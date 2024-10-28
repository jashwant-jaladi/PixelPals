import React, { useEffect, useState } from 'react';
import { Snackbar } from '@mui/material';
import UserHeader from '../components/UserHeader';
import UserPost from '../components/UserPost';
import { useParams } from 'react-router-dom';

const UserPage = () => {
  const [user, setUser] = useState(null); // Initialize as null instead of an empty object
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const { username } = useParams();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        
        if (res.ok) { // Check if the response is OK (status in the range 200-299)
          setUser(data);
        } else {
          setSnackbarMessage(data.error || 'User not found');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    getUser();
  }, [username]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      {user ? ( // Conditional rendering based on the user state
        <>
          <UserHeader user={user} />
          <UserPost />
        </>
      ) : (
        <div className='text-center mt-20 text-xl'>Loading...</div> // You can also add a loading spinner or a message
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </>
  );
};

export default UserPage;
