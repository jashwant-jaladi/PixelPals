import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Conversation from '../components/Conversation';
import MessageContainer from '../components/MessageContainer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, messageAtom, unreadMessagesAtom } from '../Atom/messageAtom';
import getUser from '../Atom/getUser';
import { useSocket } from '../context/socketContext';
import { fetchConversations } from '../apis/messageApi';
import { searchUser } from '../apis/userApi';

const ChatPage = () => {
  const [searchText, setSearchText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useRecoilState(messageAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(conversationAtom);
  const setUnreadCount = useSetRecoilState(unreadMessagesAtom);
  const currentUser = useRecoilValue(getUser);
  const { socket, onlineUsers } = useSocket();

  // Function to update conversation list with new message
  const updateConversationWithMessage = (message) => {
    setMessages((prev) => {
      // Check if conversation exists
      const conversationExists = prev.find(
        (conv) => conv._id === message.conversationId
      );

      if (conversationExists) {
        // Move this conversation to the top and update last message
        const filteredConversations = prev.filter(
          (conv) => conv._id !== message.conversationId
        );
        
        const updatedConversation = {
          ...conversationExists,
          lastMessage: {
            text: message.text,
            sender: message.sender,
            seen: message.sender === currentUser._id, // Only mark as seen if current user sent it
          },
        };
        
        // Put updated conversation at the beginning
        return [updatedConversation, ...filteredConversations];
      } else {
        // For new conversations, we'll update when we receive sender info
        const newConversation = {
          _id: message.conversationId,
          participants: [
            {
              _id: message.sender !== currentUser._id ? message.sender : message.recipient,
              username: "Loading...", // Placeholder until we get real data
              profilePic: "/default-profile.png" // Default pic
            }
          ],
          lastMessage: {
            text: message.text,
            sender: message.sender,
            seen: message.sender === currentUser._id
          }
        };
        
        return [newConversation, ...prev];
      }
    });
  };

  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    // Listen for new messages
    socket.on("newMessage", (message) => {
      // Update the conversation list
      updateConversationWithMessage(message);
    });
    // Listen for seen messages
    socket.on("messagesSeen", ({ conversationId }) => {
      setMessages((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                seen: true,
              },
            };
          }
          return conv;
        })
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
    };
  }, [socket, currentUser?._id, selectedConversation, setMessages, setUnreadCount]);

  useEffect(() => {
    const fetchConversationsData = async () => {
      try {
        const data = await fetchConversations();
        setMessages(data);
        setConversations(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConversationsData();

    const savedConversation = localStorage.getItem('selectedConversation');
    if (savedConversation) {
      setSelectedConversation(JSON.parse(savedConversation));
    }
  }, []);

  // Keep conversations in sync with messages recoil state
  useEffect(() => {
    setConversations(messages);
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem('selectedConversation', JSON.stringify(selectedConversation));
    } else {
      localStorage.removeItem('selectedConversation');
    }
  }, [selectedConversation]);

  const showToast = (title, message, severity) => {
    setSnackbarMessage(`${title}: ${message}`);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    
    setSearchingUser(true);
    try {
      const searchedUser = await searchUser(searchText);

      if (searchedUser._id === currentUser._id) {
        showToast('Error', 'You cannot message yourself', 'error');
        return;
      }

      const existingConversation = messages.find(
        (conv) => conv.participants[0]?._id === searchedUser._id
      );

      if (existingConversation) {
        setSelectedConversation({
          _id: existingConversation._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: { text: '', sender: '' },
        _id: Date.now().toString(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      
      // Add to both local state and recoil state
      setConversations((prevConvs) => [mockConversation, ...prevConvs]);
      setMessages((prevMsgs) => [mockConversation, ...prevMsgs]);
      
      setSelectedConversation({
        _id: mockConversation._id,
        userId: searchedUser._id,
        username: searchedUser.username,
        userProfilePic: searchedUser.profilePic,
      });
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setSearchingUser(false);
      setSearchText('');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: { xs: '8px', sm: '16px' },
      }}
      className="relative w-full max-w-[1000px] mx-auto px-2 sm:px-4"
    >
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-5">
        {/* Conversations Column */}
        <div className="w-full md:w-[40%] flex flex-col md:pr-5 max-h-[70vh] overflow-y-auto ">
          <div>
            <h3 className="font-bold text-xl mb-4">Recent Chats</h3>
          </div>
          
          {/* Search Input */}
          <form 
            onSubmit={handleConversationSearch} 
            className="flex items-center space-x-3 mb-4"
          >
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="flex-grow p-2 border rounded bg-inherit border-pink-500"
            />
            <SearchIcon 
              sx={{ color: 'pink', cursor: 'pointer' }} 
              onClick={handleConversationSearch} 
            />
          </form>

          {/* Conversations List */}
          <div className="flex-grow overflow-y-auto">
            {loading || searchingUser ? (
              [0, 1, 2, 3, 4].map((i) => (
                <div className="pt-5 flex gap-3" key={i}>
                  <Skeleton variant="circular" width={60} height={60} animation="wave" />
                  <div>
                    <Skeleton variant="text" width={150} height={30} />
                    <Skeleton variant="text" width={200} height={30} />
                  </div>
                </div>
              ))
            ) : (
              <>
                {conversations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No conversations yet. Search for a user to start chatting!
                  </div>
                ) : (
                  conversations.map((message) => {
                    const participant = message.participants[0] || {};
                    const isDeleted = !participant._id;
                    
                    return (
                      <Conversation
                        key={message._id}
                        conversation={{
                          ...message,
                          participants: [
                            {
                              _id: participant._id || "deleted",
                              username: participant.username || "Deleted User",
                              profilePic: participant.profilePic || "/default-profile.png",
                            },
                          ],
                        }}
                        isOnline={isDeleted ? false : onlineUsers.includes(participant._id)}
                      />
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* Messages Column */}
        <div className="w-full md:w-[60%] h-full">
          {selectedConversation && selectedConversation._id ? (
            <MessageContainer isDeleted={selectedConversation?.userId === "deleted"} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-full max-w-[300px]">
                <img 
                  src="/7050128.webp" 
                  alt="Select chat illustration" 
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-xl md:text-3xl">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
};


export default ChatPage;