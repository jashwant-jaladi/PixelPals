import React from 'react'
import { Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import {Skeleton} from '@mui/material';
import Conversation from '../components/Conversation';
import MessageContainer from '../components/MessageContainer';
const ChatPage = () => {
  return (
   
        <Box
          sx={{
            position: 'absolute',
            width: '1000px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px', 
          }}
        >
            <div className='flex'>
                <div className='w-[30%] flex flex-col'>
                    <div>
                    <h3 className='font-bold text-xl'>Recent Chats</h3>
                    </div>
                    <div className='mt-5 flex   items-center gap-3'>
                        <input type="text" placeholder="Search" className='p-2 border border-gray-300 rounded bg-inherit border-pink-500' />
                        <SearchIcon sx={{ color: 'pink' }} />
                    </div>
                    {false && ( [0,1,2,3,4] ).map((i) =>
                        <div className='pt-5 flex gap-3'>
                            <div>
                            <Skeleton variant="circular" width={60} height={60} animation="wave"  />
                            </div>
                            <div>
                            <Skeleton variant="text" width={150} height={30} />
                            <Skeleton variant="text" width={200} height={30} />
                            </div>
                        </div>
                    )}
                    <div className='pt-5'>
                    <Conversation />
                    <Conversation />
                    <Conversation />
                    </div>
                </div>

                {false &&<div className='w-[70%]'>
                    <div className='flex justify-center'>
                    <img src="../public/7050128.webp" />
                    </div>
                    <div className='flex justify-center font-bold text-3xl '>
                        <p>Select a chat to start messaging</p>
                    </div>
                </div>}
                <MessageContainer />
            </div>
         
        </Box>
    
  )
}

export default ChatPage