import React, { useEffect } from "react";
import { 
  Avatar, 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery 
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { conversationAtom } from "../Atom/messageAtom";
import { markMessageAsSeen } from "../apis/messageApi";
import { pink } from "@mui/material/colors";
import { format } from "date-fns";

const Message = ({ ownMessage, message }) => {
  const currentUser = useRecoilValue(getUser);
  const selectedConversation = useRecoilValue(conversationAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!ownMessage && !message.seen) {
      markMessageAsSeen(message._id);
    }
  }, [message._id, message.seen, ownMessage]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: ownMessage ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {/* Avatar for other user's messages */}
      {!ownMessage && (
        <Avatar
          src={selectedConversation.userProfilePic}
          alt={selectedConversation.username}
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            mb: 0.5,
            border: `2px solid ${pink[200]}`,
          }}
        />
      )}

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: { xs: '75%', sm: '70%', md: '65%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: ownMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Sender Name */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Parkinsans',
            fontWeight: 'medium',
            color: ownMessage ? pink[700] : 'text.secondary',
            mb: 0.5,
            ml: ownMessage ? 0 : 1,
            mr: ownMessage ? 1 : 0,
          }}
        >
          {ownMessage ? "You" : selectedConversation.username}
        </Typography>

        {/* Message Bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: ownMessage ? pink[500] : 'background.paper',
            color: 'text.primary',
            border: `1px solid ${ownMessage ? pink[200] : theme.palette.divider}`,
            borderTopRightRadius: ownMessage ? 0 : 2,
            borderTopLeftRadius: ownMessage ? 2 : 0,
            position: 'relative',
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          {/* Text Message */}
          {message.text && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Parkinsans',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.text}
            </Typography>
          )}

          {/* Image Message */}
          {message.img && (
            <Box
              sx={{
                mt: message.text ? 1 : 0,
                borderRadius: 1,
                overflow: 'hidden',
                maxWidth: '100%',
              }}
            >
              <img
                src={message.img}
                alt="message"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          )}

          {/* Timestamp and Read Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                opacity: 0.8,
              }}
            >
              {formatTime(message.createdAt)}
            </Typography>
            
            {ownMessage && (
              message.seen ? (
                <DoneAllIcon
                  sx={{
                    fontSize: 20,
                    color: 'green',
                  }}
                />
              ) : (
                <CheckIcon
                  sx={{
                    fontSize: 14,
                    color: 'text.disabled',
                  }}
                />
              )
            )}
          </Box>
        </Paper>
      </Box>

      {/* Avatar for own messages */}
      {ownMessage && (
        <Avatar
          src={currentUser.profilePic}
          alt="You"
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            mb: 0.5,
            border: `2px solid ${pink[200]}`,
          }}
        />
      )}
    </Box>
  );
};

export default Message;
