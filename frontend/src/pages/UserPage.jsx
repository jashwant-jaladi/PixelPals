// UserPage.js
import React, { useState, useEffect } from 'react';
import { Snackbar, CircularProgress, Alert } from '@mui/material';
import UserHeader from '../components/UserHeader';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState } from 'recoil';
import postAtom from '../Atom/postAtom';
import { fetchPosts } from '../apis/postApi'

const UserPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [posts, setPosts] = useRecoilState(postAtom);
  const { username } = useParams();
  const { user, loading: loadingUser } = useGetUserProfile();
  const [tabIndex, setTabIndex] = useState(0);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setFetchingPosts(true);
      try {
        const fetchedPosts = await fetchPosts(username, user);
        setPosts(fetchedPosts);
      } catch (error) {
        setSnackbarMessage(error.message || 'An error occurred while fetching posts');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    fetchData();
  }, [username, setPosts, user]);

  if (loadingUser) {
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <UserHeader user={user} setTabIndex={setTabIndex} tabIndex={tabIndex} />
      
      <div className="mt-5">
        {tabIndex === 0 && (
          <>
            {user.private ? (
              <div className="text-center text-xl mt-10 font-parkinsans text-pink-700">
                This account is private. Follow to see their posts.
              </div>
            ) : fetchingPosts ? (
              <div className="flex justify-center mt-10">
                <CircularProgress />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center font-parkinsans text-pink-700 text-xl">
                Looks like you didn't post anything yet, please create a post.
              </div>
            ) : (
              posts.map((post) => <Post key={post._id} post={post} />)
            )}
          </>
        )}
      </div>

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
