import React, { useEffect, useState } from 'react';
import { Avatar, Button } from '@mui/material';
import { pink } from '@mui/material/colors';
import Comment from '../components/Comment'; // Import the updated Comment component
import Actions from '../components/Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useParams, useNavigate } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns'; 
import { Link } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import DeleteIcon from '@mui/icons-material/Delete';
import postAtom from '../Atom/postAtom';


const PostPage = () => {
 
  const { user, loading: loadingUser } = useGetUserProfile();
  const [post, setPost] = useRecoilState(postAtom)
  const { id } = useParams();
  const currentUser = useRecoilValue(getUser);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  
  
  const currentPost = post[0];
  useEffect(() => {
    const getPosts = async () => {
      setPost([]);
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.error) {
          setSnackbarMessage(data.error);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        setPost([data]);
        console.log(data)
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

    try {
      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        setSnackbarMessage(data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      } else {
        setSnackbarMessage('Post deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to delete post');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  
  if (!currentPost) return null;
	console.log("currentPost", currentPost);


  return (
    <div className='flex'>
      <div className='mt-6'>
        <Avatar src={user?.profilePic} sx={{ width: 60, height: 60 }} />
      </div>
      <div className='pl-5'>
        <div className='flex justify-between w-full mt-10 font-bold'>
          <div className='flex gap-2'>
            <div>{user?.username}</div>
            <VerifiedIcon color='primary' />
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500'>{currentPost.createdAt && formatDistanceToNow(new Date(currentPost.createdAt))} ago</div>
            <MoreHorizIcon />
            {currentUser?._id === user?._id && (
              <DeleteIcon sx={{ color: 'red', cursor: 'pointer' }} onClick={handleDeletePost} />
            )}
          </div>
        </div>
        <p className='mt-7 font-bold'>{currentPost?.caption}</p>
        <div className='flex justify-start'>
          <img src={currentPost?.image} alt="post" className='mt-8' />
        </div>
        <Actions post={currentPost} />
        {!currentUser && 
        <div>
          <hr className='my-3' />
          <div className='flex justify-between items-center'>
            <p className='font-bold'>👋 Login to like, post and comment on posts.</p>
            <Link to={'/auth'}>
              <Button sx={{ bgcolor: pink[500], fontWeight: 'bold', color: 'white' }} variant='contained'>Login</Button>
            </Link>
          </div>
        </div>}
        <hr className='my-3' />

  
        {currentPost.comments.map((comment) => (
				<Comment
					key={comment._id}
					comment={comment}
					lastReply={comment === currentPost?.comments[currentPost.comments.length - 1]._id}
				/>
			))}




      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </div>
  );
};

export default PostPage;
