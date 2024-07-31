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

const App = () => {
  const location = useLocation();

  const showHeader =  location.pathname !== '/auth';
  const useContainer = location.pathname !== '/auth';
  const user=useRecoilValue(getUser);
  return (
    <>
      {showHeader && <Header />}
      
      {useContainer ? (
        <Container maxWidth="md" sx={{ mt: 8 }}> 
        {user&&<Logout/>}
          <Routes>
            <Route path="/" element={user?<Homepage />:<Navigate to="/auth" />} /> 
            <Route path="/auth" element={!user?<AuthPage />:<Navigate to="/" />} />
            <Route path="/:username" element={<UserPage />} />
            <Route path="/:username/:id" element={<PostPage />} />
          </Routes>
        </Container>
      ) : (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/:username/:id" element={<PostPage />} />
        </Routes>
      )}
      
    </>
  );
};

export default App;
