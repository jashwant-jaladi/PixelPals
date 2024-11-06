import React from 'react';
import { Avatar } from '@mui/material';

const Message = ({ ownMessage }) => {
  return (
    <div className={`flex mb-4 p-3 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
      {!ownMessage && <Avatar sx={{ width: 45, height: 45, mr: 2 }} />}
      
      <div
        className={`max-w-xs p-3 rounded-lg shadow-md ${
          ownMessage
            ? 'bg-pink-700 text-white font-bold rounded-tr-none'
            : 'bg-gray-100 text-gray-800 font-bold rounded-tl-none'
        }`}
      >
        <p className="font-bold mb-1">Jashwant Jaladi</p>
        <p>
          {ownMessage
            ? "Hello! Here's my message from the right."
            : "Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
        </p>
      </div>
      
      {ownMessage && <Avatar sx={{ width: 45, height: 45, ml: 2 }} />}
    </div>
  );
};

export default Message;
