import React from 'react'
import { useState } from 'react';
import { Avatar } from '@mui/material'
import Actions from './Actions';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const Comment = () => {
  const [liked,setLiked] = useState(false)
  return (
    <>
    <div>
        
        <div className='flex items-center'>
            <div className='pr-4'>
                <Avatar src="https://i.pravatar.cc/300?u=theShamraj" sx={{ width: 30, height: 30 }} />
            </div>
            <div className='flex justify-between w-[100%]'>
                <div>
                    <p className='font-bold'>Rajesh koothrapalli</p>
                </div>
                <div className='flex gap-3'>
                    <div className='text-sm text-gray-500 font-bold'>1 hour ago</div>
                    <MoreHorizIcon />
                </div>
            </div>
        </div>
        <div className='flex flex-col pl-12 pt-3 font-bold text-md'>
        <div className=''>Hipsters are probably jealous of how cool you are!!</div>
        <Actions liked={liked} setLiked={setLiked} />
        <div className='flex gap-3 font-bold text-gray-500 items-center'>
          <p> 100 replies</p>
          <p className='pb-2 text-xl'>.</p>
          <p> {321+ (liked ? 1 : 0)} likes</p>
        </div>
        </div>
        <hr className='my-3'/>
    </div>
    </>
  )
}

export default Comment