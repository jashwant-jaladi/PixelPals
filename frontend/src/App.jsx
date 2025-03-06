import React from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import { Container, Button, Box } from '@mui/material';
import Header from './components/Header';
import { useRecoilValue } from 'recoil';
import getUser from './Atom/getUser';
import Logout from './components/Logout';
import UpdateProfilePage from './pages/UpdateProfilePage';
import CreatePost from './components/CreatePost';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CottageIcon from '@mui/icons-material/Cottage';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';
import NotFoundPage from './pages/NotFoundPage';
import LearnMore from './pages/LearnMore';
import ResetPasswordRequest from './pages/ResetPasswordRequest';
import ResetPasswordAction from './pages/ResetPasswordAction';
import ChatButton from './components/ChatIcon';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useRecoilValue(getUser);
  
  const isAuthPage = location.pathname === '/auth';
  const isHomePage = location.pathname === '/';
  const containerMaxWidth = isAuthPage ? false : isHomePage ? 'lg' : 'md';

  return (
    <>
      {location.pathname !== '/auth' && <Header />}
      <Box sx={{ position: 'relative', px: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth={containerMaxWidth} disableGutters>
          {user && (
            <div className="flex p-2 sm:p-4 justify-between gap-2 sm:gap-4">
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: 'rgba(176, 73, 174, 0.1)',
                  color: 'inherit',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: '1px solid rgba(176, 73, 174, 0.69)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  ':hover': {
                    backgroundColor: 'rgba(176, 73, 174, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                  },
                  minWidth: '36px',
                  height: '36px',
                }}
                onClick={() => navigate(`/${user.username}`)}
              >
                <AccountCircleIcon fontSize="small" />
              </Button>

              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: 'rgba(176, 73, 174, 0.1)',
                  color: 'inherit',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: '1px solid rgba(176, 73, 174, 0.69)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  ':hover': {
                    backgroundColor: 'rgba(176, 73, 174, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                  },
                  minWidth: '36px',
                  height: '36px',
                }}
                onClick={() => navigate('/')}
              >
                <CottageIcon fontSize="small" />
              </Button>

              <ChatButton />

              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: 'rgba(176, 73, 174, 0.1)',
                  color: 'inherit',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: '1px solid rgba(176, 73, 174, 0.69)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  ':hover': {
                    backgroundColor: 'rgba(176, 73, 174, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                  },
                  minWidth: '36px',
                  height: '36px',
                }}
                onClick={() => navigate('/settings')}
              >
                <SettingsIcon fontSize="small" />
              </Button>

              <Logout />
              </div>
            )}
  
            <Routes>
              <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
              <Route path="/" element={user ? <Homepage /> : <Navigate to="/auth" />} />
              <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
              <Route path="/:username" element={user ? <><UserPage /></> : <NotFoundPage />} />
              <Route path="/:username/:id" element={<PostPage />} />
              <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/auth" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
              <Route path='*' element={<NotFoundPage />} />
              <Route path="/reset-password" element={<ResetPasswordRequest />} />  
              <Route path="/reset-password/:token" element={<ResetPasswordAction />} />
              <Route path="/learn-more" element={<LearnMore />} />
            </Routes>
          </Container>
        </Box>
      </>
    );
  };
  
  export default App;
