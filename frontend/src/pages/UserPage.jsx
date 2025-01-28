import React, { useEffect, useState } from 'react';
import { Snackbar, CircularProgress, Alert, Box } from '@mui/material';
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
  const [comments, setComments] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
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
      if (!user) {
        return;
      }
      setFetchingData(true);
      try {
        const response = await fetch(`/api/posts/user/${username}`);
        const data = await response.json();
  
        if (response.ok) {
          setPosts(data.posts || []);
        } else {
          setSnackbarMessage(data.error || 'Failed to fetch posts');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message || 'An error occurred while fetching posts');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setPosts([]);
      } finally {
        setFetchingData(false);
      }
    };
  
    fetchData();
  }, [username, setPosts, user]);
  

  return (
    <>
      {loadingUser ? (
        <div className="text-center mt-10 text-gray-500 text-xl">Loading user profile...</div>
      ) : (
        <>
          <UserHeader user={user} setTabIndex={setTabIndex} tabIndex={tabIndex} />
          
          {fetchingData ? (
            <div className="flex justify-center mt-10">
              <CircularProgress />
            </div>
          ) : (
            <div className="mt-5">
              {tabIndex === 0 && (
                <>
                  {posts.length === 0 ? (
                    <div className="text-center text-pink-700 text-xl">
                      Looks like you didn't post anything yet, please create a post.
                    </div>
                  ) : (
                    posts.map((post) => <Post key={post._id} post={post} />)
                  )}
                </>
              )}
             
            </div>
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
