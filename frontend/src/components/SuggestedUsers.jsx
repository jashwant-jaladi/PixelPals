import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import SuggestedUser from './SuggestedUser';
import { Box, Divider } from '@mui/material';

const SuggestedUsers = () => {
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(()=>{
  const getSuggestedUsers = async () => {
    try {
    const response = await fetch("/api/users/suggested")
    const data = await response.json()
    if (data.error) {
      console.log(data.error)
    } else {
      setSuggestedUsers(data)
    }
    } catch (error) {
      console.log(error)
    }
  }
    getSuggestedUsers()
  },[])

  useEffect(() => {
    // Simulate loading state
    setTimeout(() => {
      setLoading(false); // Simulate a successful data fetch
    }, 2000);
  }, []);

  return (
    <>
      <h3 className="text-lg font-bold mb-4 text-center text-primary font-parkinsans">Suggested Users</h3>
      
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
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
