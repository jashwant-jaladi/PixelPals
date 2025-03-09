import React, { useState } from 'react';
import { Avatar, Snackbar, Alert, CircularProgress, Box, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import Actions from './Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import getUser from '../Atom/getUser';
import postAtom from '../Atom/postAtom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deletePost } from '../apis/postApi';

const Post = ({ post }) => {
  const navigate = useNavigate();
  const currentUser = useRecoilValue(getUser);
  const [posts, setPosts] = useRecoilState(postAtom);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm('Are you sure you want to delete this post?')) return;
      setIsDeleting(true);
      await deletePost(post._id);
      setSnackbarMessage('Post deleted successfully');
      setPosts(posts.filter((p) => p._id !== post._id));
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to delete post');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsDeleting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (!post) return null;

  return (
    <Card 
      sx={{ 
        maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '700px' }, 
        width: '100%',
        mb: 4, 
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'visible'
      }}
      className="font-parkinsans"
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Post Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Link to={`/${post.postedBy.username}`}>
              <Avatar
                src={post.postedBy.profilePic}
                alt={`${post.postedBy.username}'s profile picture`}
                sx={{ width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 } }}
              />
            </Link>
            <Box>
              <Link to={`/${post.postedBy.username}`} className="flex items-center">
                <Box sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {post.postedBy.username}
                </Box>
                <VerifiedIcon color="primary" sx={{ fontSize: { xs: 14, sm: 16 }, ml: 0.5 }} />
              </Link>
              <Box sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary' }}>
                {window.innerWidth < 640
                  ? format(new Date(post.createdAt), 'MMM d')
                  : formatDistanceToNow(new Date(post.createdAt)) + ' ago'}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentUser?._id === post.postedBy._id && (
              isDeleting ? (
                <CircularProgress size={20} sx={{ color: 'red' }} />
              ) : (
                <IconButton 
                  size="small" 
                  sx={{ color: 'red' }} 
                  onClick={handleDeletePost}
                >
                  <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              )
            )}
            <IconButton size="small">
              <MoreHorizIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>
        </Box>

        {/* Post Caption */}
        <Link to={`/${post.postedBy.username}/${post._id}`}>
          <Box sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            fontSize: { xs: '0.9rem', sm: '1rem' },
            wordBreak: 'break-word'
          }}>
            {post.caption}
          </Box>
        </Link>

        {/* Post Image */}
        <Link to={`/${post.postedBy.username}/${post._id}`}>
          <CardMedia
            component="img"
            image={post.image}
            alt="Post content"
            sx={{ 
              borderRadius: 1,
              maxHeight: { xs: '300px', sm: '400px', md: '500px' },
              objectFit: 'contain',
              width: '100%',
              bgcolor: 'black'
            }}
          />
        </Link>

        {/* Post Actions */}
        <Box sx={{ mt: 2 }}>
          <Actions post={post} />
        </Box>

        {/* Comment Preview */}
        {post.comments.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mt: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {post.comments.slice(0, 3).map((comment, index) => (
                <Avatar
                  key={index}
                  sx={{ 
                    width: { xs: 20, sm: 24 }, 
                    height: { xs: 20, sm: 24 },
                    cursor: 'pointer'
                  }}
                  src={comment.profilePic}
                  alt={`${comment.username}'s profile picture`}
                  onClick={() => navigate(`/${comment.username}`)}
                />
              ))}
            </Box>
            <Box sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem' }, 
              color: 'text.secondary',
              flex: 1
            }}>
              {post.comments.length === 1 
                ? '1 comment' 
                : `${post.comments.length} comments`}
            </Box>
          </Box>
        )}
      </CardContent>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default Post;
