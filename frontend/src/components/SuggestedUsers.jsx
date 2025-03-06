import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import SuggestedUser from './SuggestedUser';
import { Box, Divider, Alert } from '@mui/material';
import { fetchSuggestedUsers } from '../apis/userApi'; // Import the API function

const SuggestedUsers = () => {
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSuggestedUsers = async () => {
      try {
        const users = await fetchSuggestedUsers();
        setSuggestedUsers(users.slice(0, 4));
      } catch (error) {
        setError(error.message); // Display the error message
      } finally {
        setLoading(false);
      }
    };

    getSuggestedUsers();
  }, []);

  return (
    <>
      <h3 className="text-lg font-bold mb-4 text-center text-primary font-parkinsans">Suggested Users</h3>
      
      {loading ? (
        Array.from({ length: 4}).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              marginBottom: 3,
              padding: 2,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.05)', // Slightly tinted background
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)', // Hover effect
              },
            }}
          >
            {/* Profile Skeleton */}
            <Skeleton variant="circular" width={50} height={50} />
            
            <Box sx={{ flex: 1 }}>
              {/* Name and Username Skeleton */}
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            
            {/* Follow Button Skeleton */}
            <Skeleton
              variant="rectangular"
              width={100}
              height={35}
              sx={{ borderRadius: '20px' }}
            />
          </Box>
        ))
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <div className="flex flex-col gap-4">
          {suggestedUsers.map((user) => <SuggestedUser key={user._id} user={user} />)}
        </div>
      )}

      <Divider sx={{ marginY: 3, backgroundColor: 'rgba(0, 0, 0, 0.12)' }} />
    </>
  );
};

export default SuggestedUsers;
