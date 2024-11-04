import React from 'react';
import { Avatar } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, lastReply }) => {
  return (
    <div>
      <div className='flex items-center'>
        <div className='pr-4'>
          <Avatar src={comment.profilePic} sx={{ width: 30, height: 30 }} />
        </div>
        <div className='flex justify-between w-[100%]'>
          <div>
            <p className='font-bold'>{comment.username}</p>
          </div>
          <div className='flex gap-3'>
            <div className='text-sm text-gray-500 font-bold'>
              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </div>
            <MoreHorizIcon />
          </div>
        </div>
      </div>
      <div className='flex flex-col pl-12 pt-3 font-bold text-md'>
        <div>{comment.text}</div>
      </div>
      {lastReply ? <div className='pl-12 pt-3 font-bold text-md'>hi</div> : null}
    </div>
  );
};

export default Comment;
