import React, { useState } from 'react';
import { 
  Snackbar, 
  CircularProgress, 
  Typography, 
  Box, 
  Stack, 
  Avatar, 
  Button, 
  useMediaQuery, 
  useTheme,
  Container,
  Grid
} from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import Post from '../components/Post';
import SuggestedUsers from '../components/SuggestedUsers';
import SearchUsers from '../components/SearchUsers';
import { pink } from '@mui/material/colors'; 
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { getFeedPosts } from '../apis/postApi';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchResult, setSearchResult] = useState(null); 
  const [following, setFollowing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUser = useRecoilValue(getUser);

  React.useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const data = await getFeedPosts();
        setPosts(data);
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, []);

  const handleFollowUnfollow = async (user) => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to follow users.');
      setSnackbarOpen(true);
      return;
    }

    setUpdating(true);
    try {
      // Implement your follow/unfollow logic here
      setSnackbarMessage(following ? `You have unfollowed ${user.username}.` : `You are now following ${user.username}!`);
      setFollowing(!following);
    } catch (error) {
      setSnackbarMessage('An error occurred while updating follow status.');
      setSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSearchResult = (user) => {
    setSearchResult(user);
    setFollowing(user.followers.includes(currentUser._id));
  };

  // Mobile Suggested Users Grid Component
  const MobileSuggestedUsersGrid = () => {
    return (
      <Box sx={{ width: '100%', mb: 2, mt: 2 }}>
        
        <SuggestedUsers 
          renderMode="mobile" 
          onFollowClick={handleFollowUnfollow}
        />
      </Box>
    );
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <Container maxWidth="sm">
        <Box>
          {/* Mobile Suggested Users Grid */}
          <MobileSuggestedUsersGrid />

          {/* Search Users */}
          <Box sx={{ mb: 2 }}>
            <SearchUsers onSearchResult={handleSearchResult} />
            
            {searchResult && (() => {
              const followRequested = searchResult?.Requested?.includes(currentUser?._id) || false;

              return (
                <Stack 
                  direction="row" 
                  spacing={2} 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ mt: 2 }}
                >
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    component={Link} 
                    to={`/${searchResult.username}`} 
                    alignItems="center"
                  >
                    <Avatar src={searchResult.profilePic} />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {searchResult.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchResult.name}
                      </Typography>
                    </Box>
                  </Stack>

                  {currentUser && (
                    <Button
                      size="small"
                      color="primary"
                      variant={following ? "outlined" : "contained"}
                      onClick={() => handleFollowUnfollow(searchResult)}
                      disabled={followRequested || updating}
                      sx={{
                        minWidth: 80,
                        backgroundColor: followRequested ? pink[300] : pink[500],
                        "&:hover": { backgroundColor: followRequested ? pink[300] : pink[700] },
                        "&:disabled": { backgroundColor: pink[700] },
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      {followRequested ? "Requested" : following ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Stack>
              );
            })()}
          </Box>

          {/* Posts */}
          <Box>
            {loading && (
              <CircularProgress
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
            {!loading && posts.length === 0 && (
              <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  textAlign: 'center',
                  py: 4
                }}
              >
                <SentimentDissatisfiedIcon style={{ fontSize: '50px', color: '#e91e63' }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: '#e91e63',
                    fontWeight: 'bold',
                    mt: 2,
                  }}
                >
                  No posts found, follow some users to see their posts
                </Typography>
              </Box>
            )}
            {posts.length > 0 &&
              posts.map((post) => (
                <Post key={post._id} post={post} postedBy={post.postedBy} />
              ))}
          </Box>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
      </Container>
    );
  }

  // Desktop Layout
  return (
    <>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
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
              height: '100vh',
              flexDirection: 'column',
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

        <Box flex={3} p={2}>
          <SuggestedUsers />
          <SearchUsers onSearchResult={handleSearchResult} /> 
          
          {searchResult && (() => {
            const followRequested = searchResult?.Requested?.includes(currentUser?._id) || false;

            return (
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} component={Link} to={`/${searchResult.username}`} alignItems="center">
                  <Avatar src={searchResult.profilePic} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {searchResult.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchResult.name}
                    </Typography>
                  </Box>
                </Stack>

                {currentUser && (
                  <Button
                    size="small"
                    color="primary"
                    variant={following ? "outlined" : "contained"}
                    onClick={() => handleFollowUnfollow(searchResult)}
                    disabled={followRequested || updating}
                    sx={{
                      minWidth: 80,
                      backgroundColor: followRequested ? pink[300] : pink[500],
                      "&:hover": { backgroundColor: followRequested ? pink[300] : pink[700] },
                      "&:disabled": { backgroundColor: pink[700] },
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {followRequested ? "Requested" : following ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </Stack>
            );
          })()}
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