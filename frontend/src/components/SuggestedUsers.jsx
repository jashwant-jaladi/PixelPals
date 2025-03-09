import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import SuggestedUser from './SuggestedUser';
import { Box, Divider, Alert, Typography, Stack, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { fetchSuggestedUsers } from '../apis/userApi';
import { pink } from '@mui/material/colors';

const SuggestedUsers = ({ renderMode = 'desktop', onFollowClick }) => {
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getSuggestedUsers = async () => {
      try {
        const users = await fetchSuggestedUsers();
        // Show more users in mobile mode
        const limit = renderMode === 'mobile' ? 3 : 4;
        setSuggestedUsers(users.slice(0, limit));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getSuggestedUsers();
  }, [renderMode]);

  // Loading skeletons
  const LoadingSkeletons = () => (
    <Stack spacing={2}>
      {Array.from({ length: renderMode === 'mobile' ? 3 : 4 }).map((_, index) => (
        <Card
          key={index}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(233, 30, 99, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(233, 30, 99, 0.1)' }} />
              <Box>
                <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(233, 30, 99, 0.1)' }} />
                <Skeleton variant="text" width={60} height={16} sx={{ bgcolor: 'rgba(233, 30, 99, 0.1)' }} />
              </Box>
            </Stack>
            <Skeleton
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: '16px', bgcolor: 'rgba(233, 30, 99, 0.1)' }}
            />
          </Stack>
        </Card>
      ))}
    </Stack>
  );

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2, 
          fontFamily: 'Parkinsans',
          mb: 2
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {loading ? (
        <LoadingSkeletons />
      ) : (
        <Stack spacing={2}>
          {suggestedUsers.map((user) => (
            <SuggestedUser 
              key={user._id} 
              user={user} 
              onFollowClick={onFollowClick}
              renderMode={renderMode}
            />
          ))}
          
          {suggestedUsers.length === 0 && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 2,
                color: 'text.secondary',
                fontFamily: 'Parkinsans'
              }}
            >
              <Typography variant="body2">
                No suggestions available at the moment
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default SuggestedUsers;
