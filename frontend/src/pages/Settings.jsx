import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useSetRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 
  const setUserAtom = useSetRecoilState(getUser);
  const navigate = useNavigate(); 




  const handleDeactivate = async () => {
   
    if (!window.confirm("Are you sure you want to freeze your account?")) return;

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log(data);

      if (data.error) {
        // Show error message via Snackbar
        setSnackbarMessage("Error: " + data.error);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      if (data.success) {
        // Log out the user
        await logout();
        setSnackbarMessage("Your account has been frozen.");
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setModalOpen(false); // Close the modal after success
      }
    } catch (error) {
      setSnackbarMessage("Error: " + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };


  const logout = async () => {
 
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
 
      if (data.error) {
        setSnackbarMessage("Error: " + data.error);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      // Remove user session from localStorage and state
      localStorage.removeItem('PixelPalsUser');
      setUserAtom(null); // Reset user state to null

      // Redirect to login page using React Router
      navigate('/login');
    } catch (error) {
      console.log("Logout error:", error);
      setSnackbarMessage("Error: " + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        padding: 3,
      }}
    >
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Account Settings
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
        Manage your account preferences below. Deactivate your account if you wish to permanently delete it.
      </Typography>

      <Button
        variant="contained"
        color="error"
        size="large"
        onClick={() => setModalOpen(true)}
        sx={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: 3,
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: '#c0392b', // Darker red on hover
            transform: 'scale(1.05)', // Subtle scale effect on hover
            boxShadow: 6,
          },
        }}
      >
        Deactivate Account
      </Button>

      {/* Confirmation Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
        sx={{
          '.MuiDialog-paper': {
            borderRadius: 2,  // Rounded corners for the dialog
            padding: 3,
          },
        }}
      >
        <DialogTitle id="deactivate-dialog-title" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
          Confirm Deactivation
        </DialogTitle>
        <DialogContent>
          <Typography id="deactivate-dialog-description" variant="body1" color="textSecondary">
            Are you sure you want to deactivate your account? This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            onClick={() => setModalOpen(false)}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '6px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeactivate}
            color="error"
            variant="contained"
            sx={{
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '6px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#c0392b',
              },
            }}
          >
            Yes, Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
