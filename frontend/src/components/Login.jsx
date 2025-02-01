// src/components/Login.js
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import userAuthState from '../Atom/authAtom';
import getUser from '../Atom/getUser';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import InviteLink from './Invitelink';
import { loginUser } from '../apis/userApi'; // Import the login function from api.js

const Login = () => {
  const setUserAtom = useSetRecoilState(getUser);
  const setUserAuth = useSetRecoilState(userAuthState);
  const [input, setInput] = useState({ email: '', password: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password) {
      setSnackbarMessage('Both email and password are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const data = await loginUser(input.email, input.password); // Use the loginUser function

      if (data) {
        localStorage.setItem('PixelPalsUser', JSON.stringify(data.user));
        setUserAtom(data.user);
        setUserAuth('home');
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage(error.message || 'An unexpected error occurred. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className='min-h-screen bg-black flex items-center justify-center p-4 font-parkinsans'>
        <div className='flex flex-col lg:flex-row w-full max-w-6xl bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-purple-900'>
          {/* Left Side - Login Form */}
          <div className='w-full lg:w-1/2 p-8 flex flex-col justify-center items-center'>
            <img
              src="/pixelpals-high-resolution-logo-white-transparent.png"
              alt="App-logo"
              width="350px"
              height="350px"
              className='mb-8'
            />
            <h1 className='text-3xl font-bold text-center text-pink-700 mb-8'>Good to See You!</h1>
            <form className='w-full max-w-md'>
              <div className='mb-6'>
                <label htmlFor="email" className='block text-pink-700 font-medium mb-2'>Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className='w-full px-4 py-2 border text-black border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  onChange={(e) => setInput({ ...input, email: e.target.value })}
                  value={input.email}
                />
              </div>
              <div className='mb-6'>
                <label htmlFor="password" className='block text-pink-700 font-medium mb-2'>Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className='w-full px-4 py-2 border text-black border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  onChange={(e) => setInput({ ...input, password: e.target.value })}
                  value={input.password}
                />
              </div>
              <div className='flex flex-col space-y-4'>
                <button
                  type="submit"
                  onClick={handleLogin}
                  className='w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition duration-300'
                >
                  Login
                </button>
                <button
                  type="reset"
                  className='w-full bg-transparent border border-pink-600 text-pink-600 py-2 px-4 rounded-lg hover:bg-pink-600 hover:text-white transition duration-300'
                >
                  Guest User
                </button>
              </div>
            </form>
            <div className='mt-8 text-center'>
              <p className='text-pink-700'>
                Don't have an account?{' '}
                <button onClick={() => setUserAuth('register')} className='text-pink-500 hover:text-pink-900 underline'>
                  Register
                </button>
              </p>
              <p className='text-pink-700 mt-2'>
                Forgot password?{' '}
                <a href="/reset-password" className='text-pink-500 hover:text-pink-900 underline'>
                  Reset password
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - App Features */}
          <div className='w-full lg:w-1/2 bg-gradient-to-r from-pink-600 to-purple-600 p-8 flex flex-col justify-center items-center text-white relative'>
            <div className='text-center'>
              <h3 className='text-4xl font-bold mb-8'>The New Way to Connect</h3>
              <ul className='text-left text-xl space-y-4'>
                <li>Discover new people</li>
                <li>Bond over new experiences</li>
                <li>Share memories</li>
                <li>Rediscover yourself</li>
              </ul>
            </div>
            <div className='mt-8 flex space-x-4'>
              <Link
                to="/learn-more"
                className='bg-white text-pink-600 font-bold px-6 py-2 rounded-lg hover:bg-pink-100 transition duration-300'
              >
                Learn More
              </Link>
              <button
                onClick={() => setShowInviteDialog(true)}
                className='bg-transparent border border-white text-white font-bold px-6 py-2 rounded-lg hover:bg-white hover:text-pink-600 transition duration-300'
              >
                Invite Others
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="relative p-6 bg-black rounded-lg shadow-lg border-2 border-white">
            <button
              onClick={() => setShowInviteDialog(false)}
              className="absolute -top-10 right-0 text-white bg-red-500 px-3 py-1 rounded-full"
            >
              Close
            </button>
            <InviteLink />
          </div>
        </div>
      )}

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

export default Login;
