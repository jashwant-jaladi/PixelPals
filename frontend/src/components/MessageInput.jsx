import React from 'react';
import {
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Modal,
  Button,
  Menu,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MoodIcon from '@mui/icons-material/Mood';

import { pink } from '@mui/material/colors';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { conversationAtom, messageAtom } from '../Atom/messageAtom';
import { useSocket } from '../context/socketContext.jsx';
import { analyzeMood, sendMessage } from '../apis/messageApi.js';

const MessageInput = ({ setMessages }) => {
  const [message, setMessage] = React.useState('');
  const [filePreview, setFilePreview] = React.useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedMood, setSelectedMood] = React.useState(null);
  const [suggestion, setSuggestion] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const selectedConversation = useRecoilValue(conversationAtom);
  const setConversations = useSetRecoilState(messageAtom);
  const currentUser = useRecoilValue(getUser);
  const { socket } = useSocket();

  const moods = [
    { id: 1, name: 'Optimistic', emoji: '😊', color: '#4CAF50' },
    { id: 2, name: 'Excited', emoji: '🤩', color: '#2196F3' },
    { id: 3, name: 'Sarcastic', emoji: '💁', color: '#F44336' },
    { id: 4, name: 'Formal', emoji: '😐', color: '#9E9E9E' },
  ];

  const handleTyping = () => {
    socket.emit("typing", {
      conversationId: selectedConversation._id,
      userId: currentUser._id,
    });
  };

  const handleMoodClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoodClose = () => {
    setAnchorEl(null);
  };
  
  const handleMoodSelection = async (mood) => {
    setSelectedMood(mood);
    setAnchorEl(null);

    if (!message) {
      alert('Please enter a message before selecting a mood.');
      return;
    }
    setLoading(true);

    try {
      const data = await analyzeMood(mood.name, message); // Call API function
      setSuggestion(data.suggestion);
      setSuggestionModalOpen(true);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceSuggestion = () => {
    setMessage(suggestion);
    setSuggestion('');
    setSuggestionModalOpen(false);
    setSelectedMood(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;

    const imgData = selectedFile ? await convertToBase64(selectedFile) : null;

    // Create optimistic message
    const optimisticMessage = {
      _id: Date.now().toString(), 
      text: message,
      sender: currentUser._id,
      img: imgData,
      createdAt: new Date().toISOString(),
      seen: false,
    };

    // Add to message list
    setMessages((prev) => [...prev, optimisticMessage]);

    // Check if this is a new conversation
    const isNewConversation = selectedConversation.mock;

    // Update conversations in sidebar for both existing and new conversations
    setConversations((prev) => {
      // Find if conversation already exists in the list
      const existingConversationIndex = prev.findIndex(
        (conversation) => conversation._id === selectedConversation._id
      );

      if (existingConversationIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...prev];
        updatedConversations[existingConversationIndex] = {
          ...updatedConversations[existingConversationIndex],
          lastMessage: {
            text: message,
            sender: currentUser._id,
            seen: false,
          },
        };
        return updatedConversations;
      } else {
        // It's a new conversation, add it to the list
        return [
          ...prev,
          {
            _id: selectedConversation._id,
            participants: [
              {
                _id: selectedConversation.userId,
                username: selectedConversation.username,
                profilePic: selectedConversation.userProfilePic,
              },
            ],
            lastMessage: {
              text: message,
              sender: currentUser._id,
              seen: false,
            },
            createdAt: new Date().toISOString(),
          },
        ];
      }
    });

    setMessage('');
    setFilePreview(null);
    setSelectedFile(null);

    try {
      // Send message to server
      const data = await sendMessage(message, selectedConversation.userId, imgData);

      // Update the message with the real server data
      setMessages((prev) => prev.map((msg) => (msg._id === optimisticMessage._id ? data : msg)));

      // Socket will handle updating other clients
    } catch (error) {
      // If error, remove the optimistic message
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticMessage._id));

      // And remove from conversations if it was a new one
      if (isNewConversation) {
        setConversations((prev) => 
          prev.filter((conv) => conv._id !== selectedConversation._id)
        );
      }

      console.error(error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendFile = () => {
    // Close modal and initiate sending
    handleSendMessage({ preventDefault: () => {} });
    setOpenModal(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
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
          <IconButton onClick={() => document.getElementById('file-input').click()}>
            <CameraAltIcon sx={{ color: pink[500] }} />
          </IconButton>

          <IconButton
            onClick={handleMoodClick}
            sx={{
              color: pink[500],
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: pink[500] }} /> : <MoodIcon />}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMoodClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            {moods.map((mood) => (
              <MenuItem
                key={mood.id}
                onClick={() => handleMoodSelection(mood)}
                sx={{
                  color: mood.color,
                  '&:hover': { backgroundColor: `${mood.color}22` },
                }}
              >
                {mood.emoji} {mood.name}
              </MenuItem>
            ))}
          </Menu>

          <TextField
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping(); // Emit typing event when user types
            }}
            value={message}
            variant="outlined"
            placeholder="Type a message..."
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <SendIcon sx={{ color: pink[500] }} />
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: 50 },
            }}
          />

          <input
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedFile(file);
                setFilePreview(URL.createObjectURL(file));
                setOpenModal(true);
              }
            }}
          />
        </Box>
      </form>

      <Modal
        open={suggestionModalOpen}
        onClose={() => setSuggestionModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'black', fontWeight: 'bold' }}>Suggested Alternative:</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 2, color: 'black', fontWeight: 'bold' }}>
            {suggestion}
          </Typography>
          <Button
            onClick={handleReplaceSuggestion}
            variant="contained"
            sx={{
              backgroundColor: pink[500],
              '&:hover': { backgroundColor: pink[700] },
            }}
          >
            Replace Message
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
        {filePreview && (
            <Box>
              <img
                src={filePreview}
                alt="Selected preview"
                style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
              />
            </Box>
          )}
          <Button
            onClick={handleSendFile}
            variant="contained"
            color="primary"
            sx={{
              marginTop: '15px',
              backgroundColor: pink[500],
              '&:hover': {
                backgroundColor: pink[700],
              },
            }}
          >
            Send
          </Button>
         
        </Box>
      </Modal>
    </Box>
  );
};

export default MessageInput;