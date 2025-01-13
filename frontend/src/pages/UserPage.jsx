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
  const [tabIndex, setTabIndex] = useState(0); // State to track selected tab

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
        const [postsRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/user/${username}`),
          fetch(`/api/comments/user/${username}`),
        ]);

        const postsData = await postsRes.json();
        const commentsData = await commentsRes.json();

        if (postsRes.ok) {
          setPosts(postsData.posts || []);
        } else {
          setSnackbarMessage(postsData.error || 'Failed to fetch posts');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }

        if (commentsRes.ok) {
          setComments(commentsData.comments || []);
        } else {
          setSnackbarMessage(commentsData.error || 'Failed to fetch comments');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setPosts([]);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [username, setPosts, setComments, user]);

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
              {tabIndex === 1 && (
                <>
                  {comments.length === 0 ? (
                    <div className="text-center text-pink-700 text-xl">
                      No comments yet. Start interacting with posts!
                    </div>
                  ) : (
                    comments.map((comment) => <Comment key={comment._id} comment={comment} />)
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
