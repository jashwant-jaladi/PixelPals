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
      
      // Update unread count if message is not from current user
      // and not from the currently selected conversation
      if (message.sender !== currentUser._id && 
          (!selectedConversation || selectedConversation._id !== message.conversationId)) {
        setUnreadCount((prev) => prev + 1);
      }
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
    >
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-[30%] flex flex-col md:pr-5 mb-4 md:mb-0">
          <div>
            <h3 className="font-bold text-xl">Recent Chats</h3>
          </div>
          <form onSubmit={handleConversationSearch} className="mt-5 flex items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="p-2 border rounded bg-inherit border-pink-500 w-full"
            />
            <SearchIcon sx={{ color: 'pink', cursor: 'pointer' }} onClick={handleConversationSearch} />
          </form>
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
            <div className="pt-5 max-h-[70vh] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No conversations yet. Search for a user to start chatting!
                </div>
              ) : (
                conversations.map((message) => {
                  const participant = message.participants[0] || {}; // Default empty object if user is deleted
                  const isDeleted = !participant._id; // If no ID, assume deleted
                  
                  return (
                    <Conversation
                      key={message._id}
                      conversation={{
                        ...message,
                        participants: [
                          {
                            _id: participant._id || "deleted",
                            username: participant.username || "Deleted User",
                            profilePic: participant.profilePic || "/default-profile.png", // Use a stock profile pic
                          },
                        ],
                      }}
                      isOnline={isDeleted ? false : onlineUsers.includes(participant._id)}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="w-full md:w-[70%]">
          {selectedConversation && selectedConversation._id ? (
            <MessageContainer isDeleted={selectedConversation?.userId === "deleted"} />
          ) : (
            <div className="h-[70vh] flex flex-col items-center justify-center">
              <div className="flex justify-center w-full max-w-[300px]">
                <img src="/7050128.webp" alt="Select chat illustration" className="w-full h-auto" />
              </div>
              <div className="flex justify-center font-bold text-xl md:text-3xl text-center">
                <p>Select a chat to start messaging</p>
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