import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Skeleton } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import Message from './Message';
import MessageInput from './MessageInput';
import { useRecoilState, useRecoilValue } from 'recoil';
import { conversationAtom } from '../Atom/messageAtom';
import getUser from '../Atom/getUser';
import { useSocket } from '../context/socketContext.jsx';


const MessageContainer = () => {
  const [selectedConversation, setSelectedConversation] = useRecoilState(conversationAtom);
  const currentUser = useRecoilValue(getUser);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const skeletonCount = 5; // Number of skeletons to display for loading
  const {socket} = useSocket();
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    if (!socket) return;
		socket.on("newMessage", (message) => {
			if (selectedConversation._id === message.conversationId) {
				setMessages((prev) => [...prev, message]);
			}
      setMessages((prev) => {
				const updatedConversations = prev.map((conversation) => {
					if (conversation._id === message.conversationId) {
						return {
							...conversation,
							lastMessage: {
								text: message.text,
								sender: message.sender,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
		});
    return () => socket.off("newMessage");
	}, [selectedConversation, socket]);

  useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior:"smooth"  });
	}, [messages]);
  useEffect(() => {
    setLoading(true);
    const getMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();

        // Check if the fetched data is an array; if not, set messages to an empty array
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error("Unexpected response data:", data);
          setMessages([]); // Fallback in case data is not an array
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]); // Fallback in case of an error
      } finally {
        setLoading(false);
      }
    };
    getMessages();
  }, [selectedConversation.userId]);

  return (
    <div className="w-[100%] h-[100vh] flex flex-col border-2 border-pink-500 glass rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col p-5">
        <div className="flex gap-5">
          <Avatar sx={{ width: 50, height: 50 }} src={selectedConversation.userProfilePic} />
          <div className="flex items-center">
            <h3 className="font-bold pr-3 text-lg">{selectedConversation.username}</h3>
            <VerifiedIcon color="primary" />
          </div>
        </div>
        <hr className="mt-3 border-pink-500" />
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, index) => (
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
          ))
        ) : (
          // Check if messages is an array before mapping
          Array.isArray(messages) && messages.map((message) => (
            <div ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null} className='flex flex-col'   key={message._id}>
              <Message
              message={message}
              ownMessage={message.sender === currentUser._id}
            />
            </div>
          ))
        )}
      </div>

      {/* Message Input Section */}
      <div>
        <MessageInput setMessages={setMessages} />
      </div>
    </div>
  );
};

export default MessageContainer;
