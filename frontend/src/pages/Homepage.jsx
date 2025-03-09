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
  Grid,
  Paper,
  Divider,
  Card,
  CardContent
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
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

  // Search Result Component
  const SearchResultComponent = ({ user }) => {
    if (!user) return null;
    
    const followRequested = user?.Requested?.includes(currentUser?._id) || false;

    return (
      <Card 
        elevation={1}
        sx={{ 
          mt: 2, 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${pink[100]}`,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Stack 
              direction="row" 
              spacing={2} 
              component={Link} 
              to={`/${user.username}`} 
              alignItems="center"
              sx={{ textDecoration: 'none' }}
            >
              <Avatar 
                src={user.profilePic} 
                sx={{ 
                  width: { xs: 45, sm: 50 }, 
                  height: { xs: 45, sm: 50 },
                  border: `2px solid ${pink[200]}`,
                }}
              />
              <Box>
                <Typography 
                  variant="body1" 
                  fontWeight="bold" 
                  fontFamily={'Parkinsans'}
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
                >
                  {user.username}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  fontFamily={'Parkinsans'}
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                >
                  {user.name}
                </Typography>
              </Box>
            </Stack>

            {currentUser && (
              <Button
                size={isMobile ? "small" : "medium"}
                variant={following ? "outlined" : "contained"}
                onClick={() => handleFollowUnfollow(user)}
                disabled={followRequested || updating}
                sx={{
                  minWidth: { xs: 80, sm: 90 },
                  backgroundColor: followRequested ? pink[300] : pink[500],
                  "&:hover": { backgroundColor: followRequested ? pink[300] : pink[700] },
                  "&:disabled": { backgroundColor: pink[300] },
                  color: "black",
                  fontWeight: "bold",
                  fontFamily: 'Parkinsans',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  borderRadius: '20px',
                  textTransform: 'none',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  border: following ? `1px solid ${pink[500]}` : 'none',
                }}
              >
                {followRequested ? "Requested" : following ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Empty State Component
  const EmptyState = () => (
    <Card
      elevation={1}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        py: { xs: 6, sm: 8, md: 10 },
        px: 3,
        borderRadius: 4,
        border: `1px solid ${pink[100]}`,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px',
        mx: 'auto',
        mb: 4
      }}
    >
      <SentimentDissatisfiedIcon 
        sx={{ 
          fontSize: { xs: '50px', sm: '60px', md: '70px' }, 
          color: pink[500],
          mb: 3,
        }} 
      />
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          color: pink[700],
          fontWeight: 'bold',
          fontFamily: 'Parkinsans',
          mb: 2
        }}
      >
        No posts found
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontFamily: 'Parkinsans',
          maxWidth: '400px',
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        Follow some users to see their posts in your feed
      </Typography>
    </Card>
  );

  // Loading Component
  const LoadingComponent = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        height: { xs: '200px', md: '300px' },
        width: '100%',
      }}
    >
      <CircularProgress sx={{ color: pink[500], mb: 2 }} />
      <Typography 
        variant="body1" 
        sx={{ 
          fontFamily: 'Parkinsans',
          color: 'text.secondary'
        }}
      >
        Loading posts...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container 
        maxWidth={isLargeScreen ? "lg" : "md"} 
        sx={{ 
          py: { xs: 2, md: 3 },
        }}
      >
        <Grid container spacing={3}>
          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              {/* Search Users - Visible on all devices */}
              <Card 
                elevation={1} 
                sx={{ 
                  borderRadius: 3, 
                  mb: 3,
                  border: `1px solid ${pink[100]}`,
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <SearchUsers onSearchResult={handleSearchResult} />
                </CardContent>
              </Card>
              
              <SearchResultComponent user={searchResult} />
              
              {/* Mobile/Tablet Suggested Users */}
              {(isMobile || isTablet) && (
                <Card 
                  elevation={1} 
                  sx={{ 
                    borderRadius: 3, 
                    mb: 3,
                    border: `1px solid ${pink[100]}`,
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Parkinsans', 
                        fontWeight: 'bold',
                        mb: 2,
                        color: pink[700],
                        textAlign: 'center'
                      }}
                    >
                      Suggested For You
                    </Typography>
                    <SuggestedUsers 
                      renderMode="mobile" 
                      onFollowClick={handleFollowUnfollow}
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
            
            {/* Posts Section */}
            <Box>
              {loading ? (
                <LoadingComponent />
              ) : posts.length === 0 ? (
                <EmptyState />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4 
                }}>
                  {posts.map((post) => (
                    <Box key={post._id} sx={{ mb: 3, width: '100%', maxWidth: '600px' }}>
                      <Post post={post} postedBy={post.postedBy} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Sidebar - Only visible on desktop */}
          {!isMobile && !isTablet && (
            <Grid item md={4}>
              <Box 
                sx={{ 
                  position: 'sticky',
                  top: '20px',
                }}
              >
                <Card 
                  elevation={1}
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    border: `1px solid ${pink[100]}`,
                    overflow: 'visible',
                    mb: 3
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      fontFamily={'Parkinsans'} 
                      fontWeight="bold"
                      sx={{ 
                        mb: 3,
                        color: pink[700],
                        fontSize: { sm: '1.1rem', md: '1.25rem' },
                        textAlign: 'center'
                      }}
                    >
                      Suggested For You
                    </Typography>
                    <SuggestedUsers onFollowClick={handleFollowUnfollow} />
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={1}
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    border: `1px solid ${pink[100]}`,
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontFamily: 'Parkinsans',
                        textAlign: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      © 2023 PixelPals • All Rights Reserved
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: isMobile ? 'center' : 'right' 
          }}
          sx={{
            '& .MuiSnackbarContent-root': {
              bgcolor: 'background.paper',
              color: 'text.primary',
              fontWeight: 'medium',
              fontFamily: 'Parkinsans',
              borderRadius: 2,
              boxShadow: 3,
            }
          }}
        />
      </Container>
    </Box>
  );
};

export default Homepage;