// src/components/Register.js
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import userAuthState from '../Atom/authAtom';
import { Snackbar, Alert } from '@mui/material';
import { registerUser } from '../apis/userApi'; // Import the register function from api.js

const Register = () => {
  const setUserAuth = useSetRecoilState(userAuthState);
  const [input, setInput] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmpassword: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!input.name || !input.username || !input.email || !input.password || !input.confirmpassword) {
      setSnackbarMessage('Please fill all the fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (input.password !== input.confirmpassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const data = await registerUser(input); // Use the registerUser function

      if (data.error) {
        setSnackbarMessage(data.error);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('Registration successful! Please log in to continue.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => {
          setUserAuth('login'); // Navigate to login screen
        }, 2000);
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('An error occurred during registration.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-parkinsans text-black">
        <div className="flex flex-col-reverse lg:flex-row w-full max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-purple-900">
          {/* Left Side - App Features */}
          <div className="w-full lg:w-1/2 bg-gradient-to-r from-pink-600 to-purple-600 p-8 flex flex-col justify-center items-center text-white relative">
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-8">Join the Community</h3>
              <ul className="text-left text-xl space-y-4 font-bold">
                <li>Connect with friends</li>
                <li>Share your moments</li>
                <li>Discover new experiences</li>
                <li>Be part of something bigger</li>
              </ul>
            </div>
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => setUserAuth('login')}
                className="bg-transparent border border-white text-white font-bold px-6 py-2 rounded-lg hover:bg-white hover:text-pink-600 transition duration-300"
              >
                Already a member? Login
              </button>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 p-8 flex bg-black flex-col justify-center items-center">
            <img
              src="/pixelpals-high-resolution-logo-white-transparent.png"
              alt="App-logo"
              width="300px"
              height="300px"
              className="mb-8"
            />
            <h1 className="text-3xl font-bold text-center text-pink-700 mb-8">Create Your Account</h1>
            <form onSubmit={handleRegister} className="w-full max-w-md">
              <div className="mb-6">
                <label htmlFor="name" className="block text-pink-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onChange={(e) => setInput({ ...input, name: e.target.value })}
                  value={input.name}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="username" className="block text-pink-700 font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onChange={(e) => setInput({ ...input, username: e.target.value })}
                  value={input.username}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-pink-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onChange={(e) => setInput({ ...input, email: e.target.value })}
                  value={input.email}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-pink-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onChange={(e) => setInput({ ...input, password: e.target.value })}
                  value={input.password}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-pink-700 font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onChange={(e) => setInput({ ...input, confirmpassword: e.target.value })}
                  value={input.confirmpassword}
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition duration-300"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Register;
