import React from 'react';
import { InputAdornment, IconButton, TextField, Box, Modal, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt'; // Import Camera Icon
import { pink } from '@mui/material/colors';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { conversationAtom, messageAtom } from '../Atom/messageAtom';
import { useSocket } from '../context/socketContext.jsx'; // Import useSocket for socket access

const MessageInput = ({ setMessages }) => {
  const [message, setMessage] = React.useState('');
  const [filePreview, setFilePreview] = React.useState(null); // To store the file preview
  const [openModal, setOpenModal] = React.useState(false); // To control the modal visibility
  const [selectedFile, setSelectedFile] = React.useState(null); // To store the selected file
  const selectedConversation = useRecoilValue(conversationAtom);
  const setConversations = useSetRecoilState(messageAtom);
  const currentUser = useRecoilValue(getUser);
  const { socket } = useSocket(); // Get socket from context

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;
   
    const imgData = selectedFile ? await convertToBase64(selectedFile) : null;
    
    // Create optimistic message
    const optimisticMessage = {
      _id: Date.now().toString(), // Temporary ID
      text: message,
      sender: currentUser._id, // Add currentUser to props or get from context
      img: imgData,
      createdAt: new Date().toISOString(),
      seen: false
    };
  
    // Update UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setMessage('');
    setFilePreview(null);
  
    try {
      const res = await fetch('/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          recipientId: selectedConversation.userId,
          img: imgData,
        }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
  
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg._id === optimisticMessage._id ? data : msg
      ));
  
      setConversations(prevConvs => 
        prevConvs.map(conversation => 
          conversation._id === selectedConversation._id
            ? {
                ...conversation,
                lastMessage: {
                  text: message,
                  sender: data.sender,
                  img: imgData,
                },
              }
            : conversation
        )
      );
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      console.error(error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Base64 data URI
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCameraClick = () => {
    document.getElementById('file-input').click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Store the selected file
      setFilePreview(URL.createObjectURL(file)); // Create a preview URL
      setOpenModal(true); // Open the modal
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
    setFilePreview(null); // Clear the file preview
    setSelectedFile(null); // Reset the selected file
  };

  const handleSendFile = () => {
    // Close modal and initiate sending
    handleSendMessage({ preventDefault: () => {} });
    setOpenModal(false);
  };

  // Emit typing event
  const handleTyping = () => {
    if (message.trim()) {
      socket.emit('typing', { conversationId: selectedConversation._id, userId: currentUser._id });
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
          overflow: 'hidden',
        }}
      >
        <IconButton onClick={handleCameraClick} sx={{ color: pink[500], marginRight: 1 }}>
          <CameraAltIcon />
        </IconButton>
        
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
        />
        
        <input
          type="file"
          id="file-input"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </Box>

      {/* Modal for displaying image preview and send button */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '400px',
            textAlign: 'center',
            position: 'relative',
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
    </form>
  );
};

export default MessageInput;
