import React from 'react';
import { Avatar, Badge } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useRecoilState, useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import CheckIcon from '@mui/icons-material/Check';
import { conversationAtom } from '../Atom/messageAtom';

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;
  const currentUser = useRecoilValue(getUser);
  const [selectedConversation, setSelectedConversation] = useRecoilState(conversationAtom);

  // Handle onClick event to toggle the selected conversation
  const handleConversationClick = () => {
    if (selectedConversation?._id === conversation._id) {
      setSelectedConversation(null);
    } else {
      setSelectedConversation({
        _id: conversation._id,
        userId: user._id,
        username: user.username,
        userProfilePic: user.profilePic,
      });
    }
  };

  // Check if the current conversation is selected
  const isSelected = selectedConversation?._id === conversation._id;

  return (
    <div>
      <div
        className={`p-2 flex gap-3 items-center cursor-pointer ${isSelected ? 'bg-pink-600' : ''}`} 
        onClick={handleConversationClick}
      >
        <div>
          <Badge color={isOnline ? "success" : "error"} variant="dot" overlap="circular">
            <Avatar sx={{ width: 60, height: 60 }} src={user.profilePic} />
          </Badge>
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <div className="font-bold">{user.username}</div>
            <VerifiedIcon color="primary" />
          </div>
          <div className="flex gap-1">
            {currentUser._id === lastMessage.sender && lastMessage.seen ? (
              <CheckIcon color="success" fontSize="small" />
            ) : null}

            <p className="text-sm text-gray-500">
              {/* Check if the last message is an image */}
              {lastMessage.img ? (
                <img
                  src={lastMessage.img} 
                  alt="Sent image"
                  style={{
                    width: '100px', // Adjust size as needed
                    height: 'auto',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                // Show text message if no image
                lastMessage.text.length > 20 ? `${lastMessage.text.slice(0, 15)}...` : lastMessage.text || 'Image File'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
