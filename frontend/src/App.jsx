import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import { Container } from '@mui/material';
import Header from './components/Header';
import { useRecoilValue } from 'recoil';
import getUser from './Atom/getUser';
import Logout from './components/Logout';
import UpdateProfilePage from './pages/UpdateProfilePage';

const App = () => {
  const location = useLocation();
  const user = useRecoilValue(getUser);

  // Determine if the container should be full width or medium width
  const isAuthPage = location.pathname === '/auth';
  const containerMaxWidth = isAuthPage ? 'false' : 'md'; // Full screen for AuthPage, 'md' for others

  return (
    <>
      {location.pathname !== '/auth' && <Header />}
      
      <Container maxWidth={containerMaxWidth} disableGutters >
        {user && <Logout />}
        <Routes>
          {/* AuthPage should not redirect but use container with full width */}
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          {/* All other routes */}
          <Route path="/" element={user ? <Homepage /> : <Navigate to="/auth" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/:username" element={<UserPage />} />
          
          <Route path="/:username/:id" element={<PostPage />} />
        </Routes>
      </Container>
    </>
  );
};

export default App;
