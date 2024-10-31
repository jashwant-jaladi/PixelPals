import React, { useState } from 'react';
import { Avatar } from '@mui/material';
import Actions from './Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const UserPost = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  return (
    <div className='flex'>
      <div className='mt-6 flex flex-col'>
        <Link to={`/${post.postedBy.username}`}>
          <Avatar src={post.postedBy.profilePic} sx={{ width: 60, height: 60 }} />
        </Link>
        <div className='border-l-2 mt-2 flex-1 border-gray-500 m-auto flex justify-center'></div>
        <div className='flex flex-col mt-2 mx-auto'>
          <div className='flex'>
            {post.comments.length === 0 && (
              <span role="img" aria-label="boring" style={{ fontSize: 25 }}>
                🥱
              </span>
            )}
            {post.comments[0] && (
              <Avatar sx={{ width: 25, height: 25 }} src={post.comments[0].profilePic} onClick={() => navigate(`/${post.comments[0].username}`)} // Assuming userId is available in comment
              style={{ cursor: 'pointer' }} // Adds pointer cursor to indicate it's clickable />
              />
            )}
            {post.comments[1] && (
              <Avatar sx={{ width: 25, height: 25 }} src={post.comments[1].profilePic} onClick={() => navigate(`/${post.comments[1].username}`)} style={{ cursor: 'pointer' }} />
            )}
          </div>
          {post.comments[2] && (
            <Avatar sx={{ width: 25, height: 25, marginLeft: 1.5 }} src={post.comments[2].profilePic} onClick={() => navigate(`/${post.comments[2].username}`)} style={{ cursor: 'pointer' }} />
          )}
        </div>
      </div>
      <div className='pl-5'>
        <div className='flex justify-between w-[100%] mt-10 font-bold'>
          <div className='flex gap-2'>
            <Link to={`/${post.postedBy.username}`} className='flex items-center'>
              <div>{post.postedBy.name}</div>
              <VerifiedIcon color='primary' />
            </Link>
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500'>{formatDistanceToNow(new Date(post.createdAt))} ago</div>
            <MoreHorizIcon />
          </div>
        </div>
        <p className='mt-5 font-bold'>{post.caption}</p>
        <div className='flex justify-start'>
          <img src={post.image} alt="post" width={600} height={500} className='mt-8' />
        </div>
        <Actions liked={liked} setLiked={setLiked} />
        <div className='flex gap-3 font-bold text-gray-500 items-center'>
          <p>{post.comments.length} replies</p>
          <p className='pb-2 text-xl'>.</p>
          <p>{post.likes.length + (liked ? 1 : 0)} likes</p>
        </div>
      </div>
    </div>
  );
};

export default UserPost;
