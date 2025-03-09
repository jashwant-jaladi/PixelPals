import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Snackbar, 
  Skeleton, 
  Typography, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  Divider, 
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Conversation from '../components/Conversation';
import MessageContainer from '../components/MessageContainer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, messageAtom, unreadMessagesAtom } from '../Atom/messageAtom';
import getUser from '../Atom/getUser';
import { useSocket } from '../context/socketContext';
import { fetchConversations } from '../apis/messageApi';
import { searchUser } from '../apis/userApi';
import { pink } from '@mui/material/colors';

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
  const [mobileView, setMobileView] = useState('conversations');
  const setUnreadCount = useSetRecoilState(unreadMessagesAtom);
  const currentUser = useRecoilValue(getUser);
  const { socket, onlineUsers } = useSocket();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      
      // If on mobile and receiving a message in the selected conversation, switch to message view
      if (isMobile && selectedConversation && selectedConversation._id === message.conversationId) {
        setMobileView('messages');
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
  }, [socket, currentUser?._id, selectedConversation, setMessages, setUnreadCount, isMobile]);

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
      if (isMobile) {
        setMobileView('messages');
      }
    }
  }, []);

  // Keep conversations in sync with messages recoil state
  useEffect(() => {
    setConversations(messages);
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem('selectedConversation', JSON.stringify(selectedConversation));
      if (isMobile) {
        setMobileView('messages');
      }
    } else {
      localStorage.removeItem('selectedConversation');
      if (isMobile) {
        setMobileView('conversations');
      }
    }
  }, [selectedConversation, isMobile]);

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

  const handleBackToConversations = () => {
    setMobileView('conversations');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        pt: { xs: 2, md: 4 },
        pb: { xs: 0, md: 4 },
        px: { xs: 0, md: 4 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          height: { xs: '100%', md: 'calc(100vh - 64px)' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 3 },
          border: { xs: 'none', md: `1px solid ${pink[100]}` },
        }}
      >
        {/* Conversations Column */}
        {(!isMobile || (isMobile && mobileView === 'conversations')) && (
          <Box
            sx={{
              width: { xs: '100%', md: '350px' },
              height: { xs: '100%', md: '100%' },
              borderRight: { xs: 'none', md: `1px solid ${pink[100]}` },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${pink[100]}`,
                bgcolor: pink[50],
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  fontFamily: 'Parkinsans',
                  color: pink[700],
                  mb: 2,
                }}
              >
                Messages
              </Typography>

              {/* Search Form */}
              <form onSubmit={handleConversationSearch}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: pink[300] }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchingUser && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} sx={{ color: pink[500] }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 6,
                      bgcolor: 'background.paper',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: pink[200],
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: pink[300],
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: pink[500],
                      },
                      fontFamily: 'Parkinsans',
                    },
                  }}
                />
              </form>
            </Box>

            {/* Conversations List */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                bgcolor: 'background.paper',
              }}
            >
              {loading || searchingUser ? (
                <Box sx={{ p: 2 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={50}
                        height={50}
                        animation="wave"
                        sx={{ bgcolor: pink[50] }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={24}
                          animation="wave"
                          sx={{ bgcolor: pink[50] }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          animation="wave"
                          sx={{ bgcolor: pink[50] }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <>
                  {conversations.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'Parkinsans',
                          mb: 2,
                        }}
                      >
                        No conversations yet. Search for a user to start chatting!
                      </Typography>
                      <img
                        src="/7050128.webp"
                        alt="No conversations"
                        style={{
                          width: '60%',
                          maxWidth: '200px',
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ p: 1 }}>
                      {conversations.map((message) => {
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
                      })}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Messages Column */}
        {(!isMobile || (isMobile && mobileView === 'messages')) && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {isMobile && selectedConversation && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 10,
                }}
              >
                <IconButton
                  onClick={handleBackToConversations}
                  sx={{
                    bgcolor: pink[50],
                    color: pink[700],
                    '&:hover': {
                      bgcolor: pink[100],
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
            )}

            {selectedConversation && selectedConversation._id ? (
              <MessageContainer isDeleted={selectedConversation?.userId === "deleted"} />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '300px',
                    mb: 4,
                  }}
                >
                  <img
                    src="/7050128.webp"
                    alt="Select chat illustration"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontFamily: 'Parkinsans',
                    color: pink[700],
                    mb: 2,
                  }}
                >
                  Select a chat to start messaging
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontFamily: 'Parkinsans',
                    maxWidth: '400px',
                  }}
                >
                  Choose an existing conversation or search for a user to start a new chat
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
        TransitionComponent={Fade}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{
            fontFamily: 'Parkinsans',
            fontWeight: 'medium',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatPage;