import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { pink } from '@mui/material/colors';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';

const Actions = ({ post}) => {
  const user = useRecoilValue(getUser);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  

  useEffect(() => {
    if (post && post.likes) {
      setLikesCount(post.likes.length);
      if (user && post.likes.includes(user._id)) {
        setLiked(true);
      }
    }
  }, [user, post]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleLikeOrUnlike = async () => {
    if (!user) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Please login or register to like');
      setSnackbarOpen(true);
      return;
    }

    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prevCount => prevCount + (newLikedState ? 1 : -1));
    setSnackbarSeverity('success');
    setSnackbarMessage(newLikedState ? 'Post liked successfully!' : 'Post unliked');
    setSnackbarOpen(true);

    try {
      const response = await fetch(`/api/posts/like/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.error) {
        setLiked(!newLikedState);
        setLikesCount(prevCount => prevCount + (newLikedState ? -1 : 1));
        setSnackbarSeverity('error');
        setSnackbarMessage(data.error);
        setSnackbarOpen(true);
        return;
      }

      if (data.likes) {
        setLikesCount(data.likes.length);
      }

    } catch (error) {
      setLiked(!newLikedState);
      setLikesCount(prevCount => prevCount + (newLikedState ? -1 : 1));
      setSnackbarSeverity('error');
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setComment(''); // Reset comment field on cancel or close
  };

  const handleCommentSubmit = async() => {
    if (!user) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Please login or register to comment');
      setSnackbarOpen(true);
      return;
    }
    try{
      const response = await fetch(`/api/posts/comment/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text:comment,
        })
      });

      const data = await response.json();
     
      if(data.error){
        setSnackbarSeverity('error');
        setSnackbarMessage(data.error);
        setSnackbarOpen(true);
        return;
      }
    
      setSnackbarSeverity('success');
      setSnackbarMessage('Comment added successfully!');
      setSnackbarOpen(true);
      setComment('');
      setDialogOpen(false);
    }
    catch(error){
      setSnackbarSeverity('error');
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }

  };

  if (!post) return null;

  return (
    <>
      <div className='flex flex-col'>
        <div className='my-3 flex gap-3'>
          <Button sx={{ color: pink[500], border: '1px solid pink' }} onClick={handleLikeOrUnlike}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }} onClick={handleOpenDialog}><CommentIcon /></Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }}><ShareIcon /></Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }}><RepeatIcon /></Button>
        </div>
        <div className='flex gap-3 font-bold text-gray-500 items-center'>
          <p>{post.comments?.length || 0} replies</p>
          <p className='pb-2 text-xl'>.</p>
          <p>{likesCount} likes</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment"
            type="text"
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleCommentSubmit} color="primary" disabled={!comment.trim()}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Actions;
