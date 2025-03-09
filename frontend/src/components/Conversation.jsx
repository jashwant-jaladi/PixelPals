import React from 'react';
import { 
  Avatar, 
  Badge, 
  Box, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckIcon from '@mui/icons-material/Check';
import { useRecoilState, useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { conversationAtom } from '../Atom/messageAtom';
import { pink } from '@mui/material/colors';

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;
  const currentUser = useRecoilValue(getUser);
  const [selectedConversation, setSelectedConversation] = useRecoilState(conversationAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  
  // Determine if the last message is from the current user
  const isOwnMessage = currentUser?._id === lastMessage.sender;
  
  // Truncate message text for preview
  const truncateText = (text) => {
    if (!text) return '';
    return text.length > 25 ? `${text.slice(0, 22)}...` : text;
  };

  return (
    <Paper
      elevation={0}
      onClick={handleConversationClick}
      sx={{
        mb: 1,
        mx: 1,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: isSelected ? pink[50] : 'background.paper',
        border: `1px solid ${isSelected ? pink[200] : 'transparent'}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isSelected ? pink[100] : pink[50],
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
        }}
      >
        {/* Avatar with Online Status */}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: isOnline ? '#44b700' : '#bdbdbd',
              color: isOnline ? '#44b700' : '#bdbdbd',
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              width: 12,
              height: 12,
              borderRadius: '50%',
            },
          }}
        >
          <Avatar
            src={user.profilePic}
            alt={user.username}
            sx={{
              width: { xs: 50, sm: 55 },
              height: { xs: 50, sm: 55 },
              border: `2px solid ${isSelected ? pink[300] : pink[100]}`,
              transition: 'all 0.2s ease',
            }}
          />
        </Badge>

        {/* User Info and Last Message */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Username and Verified Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Parkinsans',
                color: isSelected ? pink[700] : 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.username}
            </Typography>
            <VerifiedIcon
              sx={{
                fontSize: { xs: 16, sm: 18 },
                color: pink[500],
              }}
            />
          </Box>

          {/* Last Message Preview */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {isOwnMessage && lastMessage.seen && (
              <CheckIcon
                sx={{
                  fontSize: 14,
                  color: '#4caf50',
                }}
              />
            )}
            
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontFamily: 'Parkinsans',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: isOwnMessage ? 'normal' : 'medium',
              }}
            >
              {lastMessage.img ? (
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: pink[700],
                  }}
                >
                  📷 Photo
                </Box>
              ) : (
                truncateText(lastMessage.text) || 'Start a conversation'
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default Conversation;
