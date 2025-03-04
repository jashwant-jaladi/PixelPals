// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeToggleProvider } from './ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { SocketProvider } from './context/socketContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <RecoilRoot>
  <ThemeToggleProvider>
    <BrowserRouter>
    <SocketProvider>
        <App/>
      </SocketProvider>
    </BrowserRouter>
  </ThemeToggleProvider>
  </RecoilRoot>
);
