import React, { useState } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../apis/userApi'; // Import the API function

const ResetPasswordAction = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // id will be extracted from the URL

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
      const result = await resetPassword(token, password); // Call the resetPassword function

      setMessage('Your password has been reset successfully.');
      setPassword('');
      setConfirmPassword('');

      // Delay navigation for 3 seconds after showing success message
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      setError(error.message);
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
          fontFamily: 'Parkinsans, sans-serif', // Apply Parkinsans font globally
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontFamily: 'Parkinsans, sans-serif', fontWeight: 600 }}
        >
          Reset Your Password
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          gutterBottom
          sx={{ fontFamily: 'Parkinsans, sans-serif' }}
        >
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
              sx={{ fontFamily: 'Parkinsans, sans-serif' }}
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
              sx={{ fontFamily: 'Parkinsans, sans-serif' }}
            />
          </Box>
          {message && (
            <Alert severity="success" sx={{ mb: 2, fontFamily: 'Parkinsans, sans-serif' }}>
              {message} Redirecting...
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: 'Parkinsans, sans-serif' }}>
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
              fontFamily: 'Parkinsans, sans-serif',
              fontWeight: 'bold',
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
