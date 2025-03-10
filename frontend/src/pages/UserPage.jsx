import React, { useState, useEffect } from 'react';
import { Snackbar, CircularProgress, Alert, Box, Container } from '@mui/material';
import UserHeader from '../components/UserHeader';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState, useRecoilValue } from 'recoil';
import postAtom from '../Atom/postAtom';
import { fetchPosts } from '../apis/postApi';
import getUser from '../Atom/getUser';
import { pink } from '@mui/material/colors';

const UserPage = () => {
  const currentUser = useRecoilValue(getUser);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [posts, setPosts] = useRecoilState(postAtom);
  const { username } = useParams();
  const { user, loading: loadingUser } = useGetUserProfile(setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen);
  const [tabIndex, setTabIndex] = useState(0);

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Fetch posts after user data is available
  useEffect(() => {
    const fetchData = async () => {
      if (!user || loadingUser) return; 

      setFetchingPosts(true);
      try {
        console.log(`Fetching posts for: ${user.username} | Private: ${user.private}`);
        const fetchedPosts = await fetchPosts(username, user);
        console.log('Fetched posts:', fetchedPosts);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setSnackbarMessage(error.message || 'An error occurred while fetching posts');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    fetchData();
  }, [username, user, loadingUser, setPosts]);

  // Show loading spinner while fetching user profile
  if (loadingUser) {
    return (
      <Box className="flex justify-center items-center" sx={{ minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Determine if the current user can view posts
  const canViewPosts = 
    currentUser._id === user._id || 
    !user.private || 
    (user.followers && user.followers.includes(currentUser._id)); 

  return (
    <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <UserHeader user={user} setTabIndex={setTabIndex} tabIndex={tabIndex} />

      <Box className="mt-5" sx={{ width: '100%' }}>
        {tabIndex === 0 && (
          <>
            {!canViewPosts ? (
               <Box sx={{ textAlign: 'center'  }}>
                      <p className="text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium mt-6">
                        This user's posts are private, follow them to see their posts.
                      </p>
                    </Box>
            ) : fetchingPosts ? (
              <Box className="flex justify-center items-center" sx={{ minHeight: '30vh' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {posts.length === 0 ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <p className='text-pink-700 text-lg sm:text-xl text-opacity-90 font-medium mt-6'>
                    {currentUser._id === user._id
                      ? "Looks like you didn't post anything yet, please create a post."
                      : `Looks like ${user.username} hasn't posted anything yet.`}
                      </p>
                  </Box>
                ) : (
                  <Box className="flex flex-col items-center">
                    {posts.map((post) => (
                      <Post key={post._id} post={post} />
                    ))}
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserPage;
