import React from 'react';
import { useState } from 'react';
import { Avatar, Button } from '@mui/material';
import { pink } from '@mui/material/colors';
import Comment from '../components/Comment';
import Actions from '../components/Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';



const PostPage = () => {
  const [liked,setLiked] = useState(false)
  return (
    <div className='flex'>
      
      <div className='mt-6'>
        <Avatar src="https://i.pravatar.cc/300?u=theShamraj" sx={{ width: 60, height: 60 }} />
      </div>
      <div className='pl-5'>
        <div className='flex justify-between w-[100%] mt-10 font-bold'>
          <div className='flex gap-2'>
            <div>Winston Shamraj</div>
            <VerifiedIcon color='primary' />
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500'>1 hour ago</div>
            <MoreHorizIcon />
          </div>
        </div>
        <p className='mt-7 font-bold '>Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. 🌟</p>
        <div className='flex justify-start'>
          <img src="/boxing-4383119_1280.jpg" alt="post" className='mt-8' />
        </div>
          <Actions liked={liked} setLiked={setLiked}/>
          <div className='flex gap-3 font-bold text-gray-500 items-center'>
          <p>238 replies</p>
          <p className='pb-2 text-xl'>.</p>
          <p>{202 + (liked ? 1 : 0)} likes</p>
        </div>
        <hr className='my-3' />
        <div className='flex justify-between items-center'>
        <p className='font-bold'>  👋 Login to like, post and comment on posts.</p>
        <Button sx={{ bgcolor: pink[500], fontWeight: 'bold', color: 'white', }} variant='contained'>Login</Button>
        </div>
        <hr className='my-3' />
        <Comment/>
      </div>
    </div>
  );
}

export default PostPage;
