import React from 'react';
import { Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, currentUser, postId, handleDeleteComment }) => {
  return (
    <div className='p-4 border-b border-gray-700'>
      <div className='flex items-center'>
        <div className='pr-4'>
          <Avatar src={comment.profilePic} sx={{ width: 30, height: 30 }} />
        </div>
        <div className='flex justify-between w-[100%]'>
          <div>
            <p className='font-bold text-sm text-pink-700'>{comment.username}</p>
          </div>
          <div className='flex gap-3 items-center'>
            <div className='text-sm text-gray-500 font-bold'>
              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </div>
            {comment.userId.includes(currentUser?._id) && ( 
              <DeleteIcon 
                className="text-red-500 cursor-pointer"
                onClick={() => handleDeleteComment(postId, comment._id)}
              />
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-col pl-12 pt-3'>
        <div className='text-sm text-white font-bold'>{comment.text}</div>
      </div>
    </div>
  );
};

export default Comment;
