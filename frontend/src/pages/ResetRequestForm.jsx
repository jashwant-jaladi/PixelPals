import React, { useState } from 'react';
import { TextField, Button, Snackbar, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import { pink } from '@mui/material/colors';

const ResetRequestForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSnackbarSeverity('success');
        setMessage(data.message || 'Please check your email for a reset link.');
      } else {
        setSnackbarSeverity('error');
        setMessage(data.message || 'Error occurred.');
      }

      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity('error');
      setMessage('Error occurred while requesting reset.');
      setSnackbarOpen(true);
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/public/pixel-bg.jpg')",
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundSize: 'cover',
        padding: '20px',
      }}
    >
      <div className="glasseffect" style={{ maxWidth: 400, padding: 20, borderRadius: 12 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          style={{ color: pink[500], fontWeight: 'bold' }}
        >
          Request Password Reset
        </Typography>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           
            
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={{
              marginTop: '16px',
              fontWeight: 'bold',
              backgroundColor: pink[500],
              borderRadius: '8px',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            Request Reset
          </Button>
        </form>


     

      </div>
      <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbarOpen(false)}
    severity={snackbarSeverity}
    sx={{
      fontWeight: 'bold',
      backgroundColor: snackbarSeverity === 'success' ? '#4CAF50' : '#F44336',
      color: 'white',
      borderRadius: '8px',
      boxShadow: 2, // Added subtle shadow for depth
    }}
  >
    {message}
  </Alert>
</Snackbar>

    </div>
  );
};

export default ResetRequestForm;
