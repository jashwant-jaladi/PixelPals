import React, { useEffect, useState } from 'react';
import { Snackbar, CircularProgress, Typography, Box } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import Post from '../components/Post';
import SuggestedUsers from '../components/SuggestedUsers';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts/feed');
        const data = await res.json();
  
        if (res.ok && Array.isArray(data.posts)) { // Check if data.posts is an array
          setPosts(data.posts);
          console.log(data.posts);
        } else {
          throw new Error(data.error || 'Failed to fetch posts');
        }
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
  
    getPosts();
  }, []);
  

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
        {/* Posts Section (70% width) */}
        <Box flex={7} mr={2}>
          {loading && (
            <CircularProgress
              sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          )}
          {!loading && posts.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh', // Full height of the viewport
              flexDirection: 'column', // Aligns items vertically
              textAlign: 'center',
            }}>
              <SentimentDissatisfiedIcon style={{ fontSize: '50px', color: '#e91e63' }} />
              <Typography
                variant="h4"
                style={{
                  color: '#e91e63 ',
                  fontWeight: 'bold',
                  marginTop: '10px',
                }}
              >
                No posts found, follow some users to see their posts
              </Typography>
            </div>
          )}
          {posts.length > 0 &&
            posts.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))}
        </Box>

     
        <Box flex={3} p={2}  >
         <SuggestedUsers />
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default Homepage;
