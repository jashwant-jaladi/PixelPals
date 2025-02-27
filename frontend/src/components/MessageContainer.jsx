import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Skeleton } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import Message from './Message';
import MessageInput from './MessageInput';
import { useRecoilValue } from 'recoil';
import { messageAtom } from '../Atom/messageAtom';
import { conversationAtom } from '../Atom/messageAtom';
import getUser from '../Atom/getUser';
import { useSocket } from '../context/socketContext.jsx';
import { fetchMessages } from '../apis/messageApi.js';
import { useSetRecoilState } from 'recoil';

const MessageContainer = ({ isDeleted }) => {
  const selectedConversation = useRecoilValue(conversationAtom);
  const currentUser = useRecoilValue(getUser);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(messageAtom);
  const messageEndRef = useRef(null);

  useEffect(() => {
		socket.on("newMessage", (message) => {
			if (selectedConversation._id === message.conversationId) {
				setMessages((prev) => [...prev, message]);
			}

	

			setConversations((prev) => {
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
	}, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data) => {
        if (selectedConversation._id === data.conversationId && data.userId !== currentUser._id) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000); // Hide after 2s
        }
    };

    const handleStopTyping = ({ conversationId }) => {
        if (selectedConversation._id === conversationId) {
            setIsTyping(false);
        }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
        socket.off("typing", handleTyping);
        socket.off("stopTyping", handleStopTyping);
    };
}, [socket, selectedConversation, currentUser._id]);

  useEffect(() => {
		const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id;
		if (lastMessageIsFromOtherUser) {
			socket.emit("markMessagesAsSeen", {
				conversationId: selectedConversation._id,
				userId: selectedConversation.userId,
			});
		}

		socket.on("messagesSeen", ({ conversationId }) => {
			if (selectedConversation._id === conversationId) {
				setMessages((prev) => {
					const updatedMessages = prev.map((message) => {
						if (!message.seen) {
							return {
								...message,
								seen: true,
							};
						}
						return message;
					});
					return updatedMessages;
				});
			}
		});
	}, [socket, currentUser._id, messages, selectedConversation]);

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      const data = await fetchMessages(selectedConversation.userId);
      setMessages(data);
      setLoading(false);
    };

    getMessages();
  }, [selectedConversation.userId]);

  return (
    <div className="w-[100%] h-[100vh] flex flex-col border-2 border-pink-500 glass rounded-lg overflow-hidden">
      <div className="flex flex-col p-5">
        <div className="flex gap-5">
          <Avatar
            sx={{ width: 50, height: 50 }}
            src={selectedConversation.userProfilePic || "/default-profile.png"} // Show default if deleted
          />
          <div className="flex items-center">
            <h3 className="font-bold pr-3 text-lg">
              {selectedConversation.username || "Deleted User"}
            </h3>
            <VerifiedIcon color="primary" />
          </div>
        </div>
        <hr className="mt-3 border-pink-500" />
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`flex items-center gap-3 mb-4 p-5 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              {index % 2 !== 0 && <Avatar sx={{ width: 50, height: 50 }} />}
              <div className="flex flex-col">
                <Skeleton variant="text" width={100} height={30} />
                <Skeleton variant="rectangular" width={200} height={20} />
              </div>
              {index % 2 === 0 && <Avatar sx={{ width: 50, height: 50 }} />}
            </div>
          ))
        ) : (
          messages.map((message) => (
            <div ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null} className="flex flex-col" key={message._id}>
              <Message message={message} ownMessage={message.sender === currentUser._id} />
            </div>
          ))
        )}
      </div>

      {isTyping && !isDeleted && (
        <div className="flex justify-center p-2 text-gray-500">
          <span className="ml-2 text-pink-500">User is typing...</span>
        </div>
      )}

      <div className="p-4 text-center">
        {isDeleted ? (
          <p className="text-red-500 font-semibold">User deleted, can't send messages.</p>
        ) : (
          <MessageInput setMessages={setMessages} />
        )}
      </div>
    </div>
  );
};

export default MessageContainer;


