import React from 'react';
import { Avatar } from '@mui/material';
import { useRecoilValue, useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { conversationAtom } from '../Atom/messageAtom';
const Message = ({ ownMessage, message }) => {
  const currentUser=useRecoilValue(getUser)
  const [selectedConversation, setSelectedConversation] = useRecoilState(conversationAtom);
  return (
    <div className={`flex mb-4 p-3 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
      {!ownMessage && <Avatar sx={{ width: 45, height: 45, mr: 2 }}  src={selectedConversation.userProfilePic}/>}
      
      <div
        className={`max-w-xs p-3 rounded-lg shadow-md ${
          ownMessage
            ? 'bg-pink-700 text-white font-bold rounded-tr-none'
            : 'bg-gray-100 text-gray-800 font-bold rounded-tl-none'
        }`}
      >
        <p className="font-bold mb-1 text-pink-950">{ownMessage ? "You" : selectedConversation.username}</p>
        <p>
          {ownMessage
            ? message.text
            : message.text}
        </p>
      </div>
      
      {ownMessage && <Avatar sx={{ width: 45, height: 45, ml: 2 }} src={currentUser.profilePic}  />}
    </div>
  );
};

export default Message;
