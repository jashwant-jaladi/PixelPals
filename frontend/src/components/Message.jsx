import React from 'react';
import { Avatar } from '@mui/material';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { conversationAtom } from '../Atom/messageAtom';
import CheckIcon from '@mui/icons-material/Check';

const Message = ({ ownMessage, message }) => {
  const currentUser = useRecoilValue(getUser);
  const selectedConversation = useRecoilValue(conversationAtom);

  return (
    <div className={`flex mb-4 p-3 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for the other user */}
      {!ownMessage && (
        <Avatar sx={{ width: 45, height: 45, mr: 2 }} src={selectedConversation.userProfilePic} />
      )}

      <div
        className={`max-w-xs p-3 rounded-lg shadow-md ${
          ownMessage
            ? 'bg-pink-700 text-white font-bold rounded-tr-none overflow-hidden break-words'
            : 'bg-gray-100 text-gray-800 font-bold rounded-tl-none overflow-auto'
        }`}
      >
        <p className="font-bold mb-1 text-pink-950">{ownMessage ? 'You' : selectedConversation.username}</p>
        {message.text && <p>{message.text}</p>}
        {message.img && <img src={message.img} alt="message" className="w-[500px] h-auto" />}
        
        
        {ownMessage && (
          <span className="inline-block mt-1">
            {message.seen ? (
              <CheckIcon color="success" fontSize="small" />
            ) : (
              <CheckIcon color="disabled" fontSize="small" />
            )}
          </span>
        )}
      </div>

      {ownMessage && (
        <Avatar sx={{ width: 45, height: 45, ml: 2 }} src={currentUser.profilePic} />
      )}
    </div>
  );
};

export default Message;
