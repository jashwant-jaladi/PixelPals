import React, { useState } from 'react';
import { Avatar, Snackbar, Alert, CircularProgress } from '@mui/material';
import Actions from './Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import getUser from '../Atom/getUser';
import DeleteIcon from '@mui/icons-material/Delete';
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
    <div className='flex font-parkinsans justify-center'>
      <div className='mt-6 flex flex-col'>
        <Link to={`/${post.postedBy.username}`} className='hidden sm:block'>
          <Avatar
            src={post.postedBy.profilePic}
            alt={`${post.postedBy.username}'s profile picture`}
            sx={{ width: 60, height: 60 }}
          />
        </Link>
        <div className='border-l-2 mt-2 flex-1 border-gray-500 m-auto hidden sm:flex'></div>
        <div className='flex flex-col mt-2 mx-auto hidden sm:flex'>
          {post.comments.length > 0 && (
            <div className='flex flex-col items-center'>
              {post.comments[0]?.username && (
                <Avatar
                  sx={{ width: 25, height: 25, marginBottom: 1 }}
                  src={post.comments[0]?.profilePic}
                  alt={`${post.comments[0].username}'s profile picture`}
                  onClick={() => navigate(`/${post.comments[0].username}`)}
                  style={{ cursor: 'pointer' }}
                />
              )}
              <div className='flex gap-2'>
                {post.comments[1]?.username && (
                  <Avatar
                    sx={{ width: 25, height: 25 }}
                    src={post.comments[1]?.profilePic}
                    alt={`${post.comments[1].username}'s profile picture`}
                    onClick={() => navigate(`/${post.comments[1].username}`)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {post.comments[2]?.username && (
                  <Avatar
                    sx={{ width: 25, height: 25 }}
                    src={post.comments[2]?.profilePic}
                    alt={`${post.comments[2].username}'s profile picture`}
                    onClick={() => navigate(`/${post.comments[2].username}`)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='pl-5'>
        <div className='flex justify-between w-[100%] mt-10 font-bold'>
          <div className='flex gap-2'>
            <Link to={`/${post.postedBy.username}`} className='flex items-center'>
              <div>{post.postedBy.username}</div>
              <VerifiedIcon color='primary' sx={{ fontSize: 15 }} style={{ marginLeft: 5 }} />
            </Link>
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500'>
              {window.innerWidth < 640
                ? format(new Date(post.createdAt), 'MMM d')
                : formatDistanceToNow(new Date(post.createdAt)) + ' ago'}
            </div>
            <MoreHorizIcon />
            {currentUser?._id === post.postedBy._id && (
              isDeleting ? (
                <CircularProgress size={20} sx={{ color: 'red' }} />
              ) : (
                <DeleteIcon sx={{ color: 'red', cursor: 'pointer' }} onClick={handleDeletePost} />
              )
            )}
          </div>
        </div>
        <Link to={`/${post.postedBy.username}/${post._id}`}>
          <p className='mt-5 font-bold'>{post.caption}</p>
          <div className='flex justify-start'>
            <img
              src={post.image}
              alt='post content'
              width={600}
              height={500}
              className='mt-8'
            />
          </div>
        </Link>
        <Actions post={post} />
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Post;
