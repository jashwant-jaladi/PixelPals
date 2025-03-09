import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Avatar, 
  Skeleton, 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Divider,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Message from './Message';
import MessageInput from './MessageInput';
import { useRecoilValue } from 'recoil';
import { messageAtom } from '../Atom/messageAtom';
import { conversationAtom } from '../Atom/messageAtom';
import getUser from '../Atom/getUser';
import { useSocket } from '../context/socketContext.jsx';
import { fetchMessages } from '../apis/messageApi.js';
import { useSetRecoilState } from 'recoil';
import { pink } from '@mui/material/colors';

const MessageContainer = ({ isDeleted }) => {
  const selectedConversation = useRecoilValue(conversationAtom);
  const currentUser = useRecoilValue(getUser);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(messageAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const messagesContainerRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, []);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px buffer
      setIsScrolledToBottom(atBottom);
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change, but only if previously at bottom
    if (messages.length > 0 && isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom, scrollToBottom]);

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

  useEffect(() => {
    if (!socket) return;
    
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
    if (!socket) return;
    
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
    const getMessages = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages(selectedConversation.userId);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation.userId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: `1px solid ${pink[100]}`,
          bgcolor: pink[50],
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={selectedConversation.userProfilePic || "/default-profile.png"}
          alt={selectedConversation.username || "Deleted User"}
          sx={{
            width: { xs: 40, sm: 50 },
            height: { xs: 40, sm: 50 },
            border: `2px solid ${pink[200]}`,
          }}
        />
        
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Parkinsans',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: pink[700],
              }}
            >
              {selectedConversation.username || "Deleted User"}
            </Typography>
            
            <VerifiedIcon
              sx={{
                color: pink[500],
                fontSize: { xs: 16, sm: 20 },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.default',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {loading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3,
                  justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                }}
              >
                {index % 2 !== 0 && (
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    animation="wave"
                    sx={{ bgcolor: pink[50] }}
                  />
                )}
                
                <Box
                  sx={{
                    maxWidth: '70%',
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={100}
                    height={20}
                    animation="wave"
                    sx={{ bgcolor: pink[50], mb: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={200}
                    height={40}
                    animation="wave"
                    sx={{ bgcolor: pink[50], borderRadius: 2 }}
                  />
                </Box>
                
                {index % 2 === 0 && (
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    animation="wave"
                    sx={{ bgcolor: pink[50] }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <>
            {messages.length === 0 ? (
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
                  No messages yet. Start a conversation!
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Message
                  key={message._id}
                  message={message}
                  ownMessage={message.sender === currentUser._id}
                />
              ))
            )}
          </>
        )}
        
        {/* Scroll to bottom button */}
        {!isScrolledToBottom && (
          <Tooltip title="Scroll to latest" arrow>
            <Fade in={!isScrolledToBottom}>
              <IconButton
                onClick={scrollToBottom}
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  bgcolor: pink[500],
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: pink[700],
                  },
                  zIndex: 10,
                }}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Fade>
          </Tooltip>
        )}
      </Box>

      {/* Typing Indicator */}
      {isTyping && !isDeleted && (
        <Box
          sx={{
            p: 1,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderTop: `1px solid ${pink[50]}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: pink[500],
              fontFamily: 'Parkinsans',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: pink[500],
                  animation: 'pulse 1s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.4 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.4 },
                  },
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: pink[500],
                  animation: 'pulse 1s infinite 0.2s',
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: pink[500],
                  animation: 'pulse 1s infinite 0.4s',
                }}
              />
            </Box>
            User is typing...
          </Typography>
        </Box>
      )}

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${pink[100]}`,
        }}
      >
        {isDeleted ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: pink[50],
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'error.main',
                fontWeight: 'medium',
                fontFamily: 'Parkinsans',
              }}
            >
              User deleted, can't send messages.
            </Typography>
          </Paper>
        ) : (
          <MessageInput setMessages={setMessages} />
        )}
      </Box>
    </Box>
  );
};

export default MessageContainer;


