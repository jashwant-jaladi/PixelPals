import React from 'react';
import { Avatar } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Skeleton } from '@mui/material';
import Message from './Message';
import MessageInput from './MessageInput';

const MessageContainer = () => {
  const skeletons = Array.from({ length: 1 });

  return (
    <div className="w-[100%] h-[100vh] flex flex-col border-2 border-pink-500 glass rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col p-5">
        <div className="flex gap-5">
          <Avatar sx={{ width: 50, height: 50 }} />
          <div className="flex items-center">
            <h3 className="font-bold pr-3 text-lg">Jashwant Jaladi</h3>
            <VerifiedIcon color="primary" />
          </div>
        </div>
        <hr className="mt-3 border-pink-500" />
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {false &&
          skeletons.map((_, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 mb-4 p-5 ${
                index % 2 === 0 ? 'justify-end' : 'justify-start'
              }`}
            >
              {index % 2 !== 0 && <Avatar sx={{ width: 50, height: 50 }} />}
              <div className="flex flex-col">
                <Skeleton variant="text" width={100} height={30} />
                <Skeleton variant="rectangular" width={200} height={20} />
              </div>
              {index % 2 === 0 && <Avatar sx={{ width: 50, height: 50 }} />}
            </div>
          ))}

        <Message ownMessage={true} />
        <Message ownMessage={true} />
        <Message ownMessage={false} />
        <Message ownMessage={true} />
      </div>

      {/* Message Input Section */}
      <div >
        <MessageInput />
      </div>
    </div>
  );
};

export default MessageContainer;
