import React from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import { Container, Button } from '@mui/material';
import Header from './components/Header';
import { useRecoilValue } from 'recoil';
import getUser from './Atom/getUser';
import Logout from './components/Logout';
import UpdateProfilePage from './pages/UpdateProfilePage';
import CreatePost from './components/CreatePost';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CottageIcon from '@mui/icons-material/Cottage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useRecoilValue(getUser);

  
  const isAuthPage = location.pathname === '/auth';
  const containerMaxWidth = isAuthPage ? 'false' : 'md'; // Full screen for AuthPage, 'md' for others

  return (
    <>
      {location.pathname !== '/auth' && <Header />}
      
      <Container maxWidth={containerMaxWidth} disableGutters>
        {user && (
          <div className="flex p-4 justify-between">
            
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'rgba(176, 73, 174, 0.1)',
                color: '#ffffff',
                fontWeight: 'bold',
                borderRadius: '12px', 
                border: '1px solid rgba(176, 73, 174, 0.69)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                ":hover": {
                  backgroundColor: 'rgba(176, 73, 174, 0.2)',
                  boxShadow: '0 6px 35px rgba(0, 0, 0, 0.15)',
                },
              }}
              onClick={() => navigate(`/${user.username}`)}
            >
              <AccountCircleIcon />
            </Button>

            
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'rgba(176, 73, 174, 0.1)',
                color: '#ffffff',
                fontWeight: 'bold',
                borderRadius: '12px', 
                border: '1px solid rgba(176, 73, 174, 0.69)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                ":hover": {
                  backgroundColor: 'rgba(176, 73, 174, 0.2)',
                  boxShadow: '0 6px 35px rgba(0, 0, 0, 0.15)',
                },
              }}
              onClick={() => navigate('/')}
            >
              <CottageIcon />
            </Button>

            <Logout />
          </div>
        )}
        
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Homepage /> : <Navigate to="/auth" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/:username/:id" element={<PostPage />} />
        </Routes>
        
        {user && <CreatePost />} 
      </Container>
    </>
  );
};

export default App;
