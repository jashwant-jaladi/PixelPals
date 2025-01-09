import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import {  useParams } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';

const ResetPasswordAction = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Get the user id from the URL parameters
  const { id } = useParams(); // id will be extracted from the URL
    console.log(id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/reset-password/${id}`, { // Pass id in URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // Only send password since id is in the URL
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Your password has been reset successfully.');
        setPassword('');
        setConfirmPassword('');
        navigate('/auth');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reset Your Password
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Enter your new password below.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Box>
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              backgroundColor: pink[500],
              color: 'white',
              '&:hover': {
                backgroundColor: pink[700],
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ResetPasswordAction;
