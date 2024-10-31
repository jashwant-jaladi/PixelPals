import React, { useEffect, useState } from 'react';
import { Snackbar } from '@mui/material';
import UserHeader from '../components/UserHeader';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [fetching, setFetching] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if (res.ok) {
          setUser(data);
        } else {
          setSnackbarMessage(data.error || 'User not found');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const getPosts = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();

        if (res.ok) {
          // Assuming your API returns an object like { message: 'success', posts: [...] }
          setPosts(data.posts || []); // Use data.posts to set the posts
          console.log(data);
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
        setFetching(false);
      }
    };

    getUser();
    getPosts();
  }, [username]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      
        {user ? (
          <>
            <UserHeader user={user} />
            {fetching ? (
              <div>Loading posts...</div>
            ) : (
              <>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Post key={post._id} post={post} />
                  ))
                ) : (
                  <div>No posts found</div>
                )}
              </>
            )}
          </>
        ) : (
          <div>Loading user profile...</div>
        )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </>
  );
};

export default UserPage;
