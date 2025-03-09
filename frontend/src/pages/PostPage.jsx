import React, { useEffect, useState } from 'react';
import { 
  Avatar, 
  Button, 
  CircularProgress, 
  Snackbar, 
  Box, 
  IconButton, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider, 
  Chip,
  Paper,
  Tooltip,
  Fade
} from '@mui/material';
import { pink } from '@mui/material/colors';
import Comment from '../components/Comment';
import Actions from '../components/Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import postAtom from '../Atom/postAtom';
import { fetchPost, deletePost, deleteComment } from '../apis/postApi';

const PostPage = () => {
  const { user, loading: loadingUser } = useGetUserProfile();
  const [post, setPost] = useRecoilState(postAtom);
  const { id } = useParams();
  const currentUser = useRecoilValue(getUser);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPost = post[0];

  useEffect(() => {
    const getPosts = async () => {
      setPost([]);
      try {
        if (id && id.length > 40) {
          console.warn('Invalid post format');
          navigate('/');
        }
        const fetchedPost = await fetchPost(id);
        setPost([fetchedPost]);
      } catch (err) {
        setSnackbarMessage(err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    getPosts();
  }, [id, setPost]);

  const handleDeletePost = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeleting(true);
    try {
      await deletePost(currentPost._id);
      setSnackbarMessage('Post deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      navigate('/');
    } catch (error) {
      setSnackbarMessage('Failed to delete post');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
  
    try {
      await deleteComment(postId, commentId);
  
      setPost((prevPosts) => {
        return prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment._id !== commentId) }
            : post
        );
      });
  
      setSnackbarMessage('Comment deleted successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Failed to delete comment');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSharePost = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!currentPost) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <CircularProgress sx={{ color: pink[500] }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Parkinsans',
            color: 'text.secondary'
          }}
        >
          Loading post...
        </Typography>
      </Box>
    );
  }

  // Format date for small screens
  const formattedDate = currentPost.createdAt
    ? format(new Date(currentPost.createdAt), 'MMM d') // e.g., "Mar 4"
    : '';

  return (
    <Box 
      className="font-parkinsans"
      sx={{
        maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
        mx: 'auto',
        px: { xs: 2, sm: 4 },
        py: { xs: 2, sm: 4 },
      }}
    >
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          bgcolor: 'background.paper',
          transition: 'all 0.3s ease',
          mb: 4,
          border: `1px solid ${pink[50]}`,
        }}
      >
        {/* Header Section with Back Button */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton 
            onClick={handleGoBack}
            sx={{ 
              color: pink[500],
              '&:hover': { bgcolor: pink[50] }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Parkinsans',
              fontWeight: 'bold',
              flex: 1,
              textAlign: 'center'
            }}
          >
            Post
          </Typography>
          
          <Tooltip title={copied ? "Copied!" : "Share post"} arrow>
            <IconButton 
              onClick={handleSharePost}
              sx={{ 
                color: copied ? pink[700] : pink[500],
                '&:hover': { bgcolor: pink[50] }
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Info Section */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Link to={`/${user?.username}`}>
                <Avatar 
                  src={user?.profilePic} 
                  sx={{ 
                    width: { xs: 50, sm: 60 }, 
                    height: { xs: 50, sm: 60 },
                    border: `3px solid ${pink[200]}`,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }} 
                />
              </Link>
              
              <Box>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Link 
                    to={`/${user?.username}`}
                    style={{ 
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontFamily: 'Parkinsans',
                        '&:hover': {
                          color: pink[500]
                        }
                      }}
                    >
                      {user?.username}
                    </Typography>
                  </Link>
                  <VerifiedIcon 
                    sx={{ 
                      color: pink[500],
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <span className="sm:hidden">{formattedDate}</span>
                  <span className="hidden sm:inline">
                    {currentPost.createdAt && formatDistanceToNow(new Date(currentPost.createdAt))} ago
                  </span>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUser?._id === user?._id && (
                deleting ? (
                  <CircularProgress size={24} sx={{ color: pink[500] }} />
                ) : (
                  <Tooltip title="Delete post" arrow>
                    <IconButton 
                      onClick={handleDeletePost}
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )
              )}
              <IconButton 
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <MoreHorizIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Caption */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 'medium',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: 'text.primary',
              fontFamily: 'Parkinsans',
            }}
          >
            {currentPost?.caption}
          </Typography>
        </Box>

        {/* Image */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            bgcolor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={currentPost?.image}
            alt="post"
            style={{
              width: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Actions */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Actions post={currentPost} />
        </Box>

        {/* Login Prompt */}
        {!currentUser && (
          <Box 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: pink[50],
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Typography 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: { xs: 'center', sm: 'left' },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: 'Parkinsans',
                }}
              >
                👋 Login to like, post and comment on posts.
              </Typography>
              <Link to="/auth" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained"
                  sx={{ 
                    bgcolor: pink[500],
                    color: 'white',
                    fontWeight: 'bold',
                    fontFamily: 'Parkinsans',
                    '&:hover': {
                      bgcolor: pink[600],
                    },
                    px: { xs: 3, sm: 4 },
                    py: { xs: 0.5, sm: 1 },
                    borderRadius: '20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                      bgcolor: pink[700],
                    }
                  }}
                >
                  Login
                </Button>
              </Link>
            </Box>
          </Box>
        )}

        {/* Comments Section */}
        <Box 
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            p: { xs: 1, sm: 2 },
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Parkinsans',
              fontWeight: 'bold',
              mb: 2,
              px: 2,
              color: 'text.primary'
            }}
          >
            Comments ({currentPost.comments.length})
          </Typography>
          
          {currentPost.comments.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary',
                fontFamily: 'Parkinsans',
              }}
            >
              <Typography variant="body1">
                No comments yet. Be the first to comment!
              </Typography>
            </Box>
          ) : (
            [...currentPost.comments].reverse().map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                lastReply={comment._id === currentPost?.comments[0]._id} 
                currentUser={currentUser}
                postId={currentPost._id}
                handleDeleteComment={handleDeleteComment}
              />
            ))
          )}
        </Box>
      </Card>

      {/* Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)} 
        message={snackbarMessage} 
        severity={snackbarSeverity}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        TransitionComponent={Fade}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: snackbarSeverity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
            fontWeight: 'medium',
            fontFamily: 'Parkinsans',
            borderRadius: 2,
            boxShadow: 3,
          }
        }}
      />
    </Box>
  );
};

export default PostPage;