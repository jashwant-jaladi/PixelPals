import React, { useEffect, useState } from 'react';
import { Avatar, Button } from '@mui/material';
import { pink } from '@mui/material/colors';
import Comment from '../components/Comment';
import Actions from '../components/Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useParams } from 'react-router-dom';
import {Snackbar} from '@mui/material';
import { formatDistanceToNow } from 'date-fns'; 
import {Link} from 'react-router-dom'
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';


const PostPage = () => {
  const currentUser = useRecoilValue(getUser);
  const {user, loading: loadingUser} = useGetUserProfile();
  const {id}=useParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [post, setPost] = useState(null);
  useEffect(() => {
    const getPosts = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.error) {
          setSnackbarMessage(data.error);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        setPost(data);
        console.log(data)
      } catch (err) {
        setSnackbarMessage(err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    getPosts();

  }, [id]);

  return (
    <div className='flex'>

      <div className='mt-6'>
        <Avatar src={user?.profilePic} sx={{ width: 60, height: 60 }} />
      </div>
      <div className='pl-5'>
        <div className='flex justify-between w-[100%] mt-10 font-bold'>
          <div className='flex gap-2'>
            <div>{user?.name}</div>
            <VerifiedIcon color='primary' />
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500'>{post?.createdAt && formatDistanceToNow(new Date(post.createdAt))} ago</div>
            <MoreHorizIcon />
          </div>
        </div>
        <p className='mt-7 font-bold '>{post?.caption}</p>
        <div className='flex justify-start'>
          <img src={post?.image} alt="post" className='mt-8' />
        </div>
        <Actions post={post} />
        {!currentUser && 
        <div>
        <hr className='my-3' />
        <div className='flex justify-between items-center'>
          <p className='font-bold'>  👋 Login to like, post and comment on posts.</p>
          <Link to={'/auth'}>
          <Button sx={{ bgcolor: pink[500], fontWeight: 'bold', color: 'white', }} variant='contained'>Login</Button>
          </Link>
        </div>
        </div>}
        <hr className='my-3' />
        <Comment />
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
}

export default PostPage;
