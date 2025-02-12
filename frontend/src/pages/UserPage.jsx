import React, { useEffect, useState } from 'react';
import { Snackbar, CircularProgress, Alert } from '@mui/material';
import UserHeader from '../components/UserHeader';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState } from 'recoil';
import postAtom from '../Atom/postAtom';

const UserPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [posts, setPosts] = useRecoilState(postAtom);
  const { username } = useParams();
  const { user, loading: loadingUser } = useGetUserProfile();

  useEffect(() => {
    const getPosts = async () => {
      if (!user) {
        return;
      }
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();

        if (res.ok) {
          setPosts(data.posts || []);
        } else {
          setSnackbarMessage(data.error || 'Failed to fetch posts');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, setPosts, user]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      {loadingUser ? (
        <div className='text-center mt-10 text-gray-500 text-xl'>Loading user profile...</div>
      ) : (
        <>
          <UserHeader user={user} />
          {fetchingPosts ? (
            <div className='flex justify-center mt-10'>
              <CircularProgress />
            </div>
          ) : posts.length === 0 ? (
            <div className='text-center mt-10 text-pink-700 text-xl'>
              Looks like you didn't post anything yet, please create a post.
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} />
            ))
          )}
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserPage;
