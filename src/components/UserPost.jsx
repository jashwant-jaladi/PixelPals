import React from 'react';
import { Avatar, Button } from '@mui/material';
import { pink } from '@mui/material/colors';

import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShareIcon from '@mui/icons-material/Share';


const UserPost = () => {
  return (
    <div className='flex'>
      <div className='mt-6 flex flex-col'>
        <Avatar src="https://i.pravatar.cc/300?u=theShamraj" sx={{ width: 60, height: 60 }} />
        <div className='border-l-2 mt-2 flex-1 border-gray-500 m-auto flex justify-center'></div> 
        <div className='flex flex-col mt-2 mx-auto'>
          <div className='flex'>
            <Avatar sx={{ width: 25, height: 25 }}/>
            <Avatar sx={{ width: 25, height: 25 }} />
          </div>
          <Avatar sx={{ width: 25, height: 25, marginLeft: 1.5 }} />
        </div>
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
        <p className='mt-5'>Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. 🌟</p>
        <div className='flex justify-start'>
          <img src="public/boxing-4383119_1280.jpg" alt="post" width={600} height={500} className='mt-8' />
        </div>
        <div className='my-3'>
          <Button sx={{ color: pink[500] }}><FavoriteBorderIcon /></Button>
          <Button sx={{ color: pink[500] }}><CommentIcon /></Button>
          <Button sx={{ color: pink[500] }}><ShareIcon /></Button>
          <Button sx={{ color: pink[500] }}><RepeatIcon /></Button>
        </div>
      </div>
    </div>
  );
}

export default UserPost;
