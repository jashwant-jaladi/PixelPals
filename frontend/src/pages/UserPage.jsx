import React, { useState, useEffect } from 'react';
import { Snackbar, CircularProgress, Alert } from '@mui/material';
import UserHeader from '../components/UserHeader';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState, useRecoilValue } from 'recoil';
import postAtom from '../Atom/postAtom';
import { fetchPosts } from '../apis/postApi';
import getUser from '../Atom/getUser';

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
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  // Determine if the current user can view posts
  const canViewPosts = 
    currentUser._id === user._id || 
    !user.private || 
    (user.followers && user.followers.includes(currentUser._id)); 

  return (
    <>
      <UserHeader user={user} setTabIndex={setTabIndex} tabIndex={tabIndex} />

      <div className="mt-5">
        {tabIndex === 0 && (
          <>
            {!canViewPosts ? (
              <div className="text-center text-xl mt-10 font-parkinsans text-pink-700">
                This account is private. Follow to see their posts.
              </div>
            ) : fetchingPosts ? (
              <div className="flex justify-center mt-10">
                <CircularProgress />
              </div>
            ) : (
              <>
                {posts.length === 0 ? (
                  <div className="text-center font-parkinsans text-pink-700 text-xl">
                    {currentUser._id === user._id
                      ? "Looks like you didn't post anything yet, please create a post."
                      : `Looks like ${user.username} hasn't posted anything yet.`}
                  </div>
                ) : (
                  posts.map((post) => <Post key={post._id} post={post} />)
                )}
              </>
            )}
          </>
        )}
      </div>

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
    </>
  );
};

export default UserPage;
