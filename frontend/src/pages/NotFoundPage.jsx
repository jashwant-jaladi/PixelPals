import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '100vh',
        textAlign: 'center',
        padding: 4,
      }}
    >
      {/* Tacky Heading */}
      <Typography 
        variant="h1" 
        sx={{
          fontSize: '6rem', 
          fontWeight: 'bold', 
          
          textTransform: 'uppercase',
          textShadow: '4px 4px 10px rgba(0, 0, 0, 0.4)',
          marginBottom: 2,
          fontFamily: 'Comic Sans MS, cursive, sans-serif', // Super tacky
        }}
      >
        Oops! <br /> 404
      </Typography>

      {/* Fun Images */}
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          marginBottom: 3,
        }}
      >
        <img src="public/240_F_508674247_d8JegDh7o9yJmYcae2jdEpsQ9LVmiXDM.jpg" alt="Tacky cat" style={{ width: '200px', borderRadius: '50%', boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)' }} />
        
      </Box>

      {/* Fun message */}
      <Typography 
        variant="h6" 
        sx={{
        
          fontSize: '1.5rem', 
          fontFamily: 'Arial, sans-serif', 
          fontWeight: 'lighter', 
          marginBottom: 4,
        }}
      >
        Looks like you've traveled to a place that doesn't exist... 🛸
      </Typography>

      {/* Go back Button */}
      <Button 
        variant="contained" 
        sx={{
          backgroundColor: '#ff1493', 
          fontSize: '1.2rem', 
          color: '#fff', 
          padding: '12px 24px', 
          borderRadius: '50px',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#ff6eb1',
          },
        }} 
        onClick={goHome}
      >
        Go Home 🏡
      </Button>
    </Box>
  );
};

export default NotFoundPage;
