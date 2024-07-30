import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import { Container } from '@mui/material';
import Header from './components/Header';

const App = () => {
  const location = useLocation();

  const showHeader = location.pathname !== '/' && location.pathname !== '/auth';
  const useContainer = location.pathname !== '/' && location.pathname !== '/auth';

  return (
    <>
      {showHeader && <Header />}
      {useContainer ? (
        <Container maxWidth="md" sx={{ mt: 8 }}> 
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<AuthPage />} />
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
