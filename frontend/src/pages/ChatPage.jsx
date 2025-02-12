import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Conversation from '../components/Conversation';
import MessageContainer from '../components/MessageContainer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { conversationAtom, messageAtom } from '../Atom/messageAtom';
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
  const currentUser = useRecoilValue(getUser);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    const fetchConversationsData = async () => {
      try {
        const data = await fetchConversations();
        setMessages(data);
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
    setSearchingUser(true);
    try {
      const searchedUser = await searchUser(searchText);

      if (searchedUser._id === currentUser._id) {
        showToast('Error', 'You cannot message yourself', 'error');
        return;
      }

      const existingConversation = conversations.find(
        (conv) => conv.participants[0]._id === searchedUser._id
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
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
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
        position: 'absolute',
        width: '1000px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '16px',
      }}
    >
      <div className="flex">
        <div className="w-[30%] flex flex-col pr-5">
          <div>
            <h3 className="font-bold text-xl">Recent Chats</h3>
          </div>
          <form onSubmit={handleConversationSearch} className="mt-5 flex items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="p-2 border rounded bg-inherit border-pink-500"
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
            <div className="pt-5">
             {messages.map((message) => {
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
})}

            </div>
          )}
        </div>

        <div className="w-[70%]">
          {selectedConversation && selectedConversation._id ? (
            <MessageContainer isDeleted={selectedConversation?.userId === "deleted"} />
          ) : (
            <div>
              <div className="flex justify-center">
                <img src="/7050128.webp" alt="Select chat illustration" />
              </div>
              <div className="flex justify-center font-bold text-3xl">
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
