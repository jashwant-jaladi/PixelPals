import React from 'react';
import { InputAdornment, IconButton, TextField, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { pink } from '@mui/material/colors';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, messageAtom } from '../Atom/messageAtom';

const MessageInput = ({ setMessages }) => {
  const [message, setMessage] = React.useState('');
  const selectedConversation = useRecoilValue(conversationAtom);
  const setConversations = useSetRecoilState(messageAtom); // Use Recoil setter for conversation updates

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Avoid sending empty messages

    try {
      const res = await fetch('/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, recipientId: selectedConversation.userId }),
      });
      
      const data = await res.json();
      if (data.error) {
        console.log(data.error);
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
        setConversations((prevConvs) => {
          const updatedConversations = prevConvs.map((conversation) => {
            if (conversation._id === selectedConversation._id) {
              return {
                ...conversation,
                lastMessage: {
                  text: message,
                  sender: data.sender,
                },
              };
            }
            return conversation;
          });
          return updatedConversations;
        });
      }
      setMessage('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '50px',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          variant="outlined"
          placeholder="Type a message..."
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  sx={{ color: pink[500] }}
                  onClick={handleSendMessage}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              borderRadius: 50,
              paddingRight: 8,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: '#E0E0E0',
              },
              "&:hover fieldset": {
                borderColor: '#FF69B4',
              },
              "&.Mui-focused fieldset": {
                borderColor: '#FF1493',
              },
            },
          }}
        />
      </Box>
    </form>
  );
};

export default MessageInput;
