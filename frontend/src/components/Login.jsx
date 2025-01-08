import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import userAuthState from '../Atom/authAtom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import getUser from '../Atom/getUser';
import { Link } from 'react-router-dom';
import InviteLink from './Invitelink';
const Login = () => {
  const setUserAtom = useSetRecoilState(getUser);
  const setUserAuth = useSetRecoilState(userAuthState);
  const [input, setInput] = useState({
    email: '',
    password: ''
  });
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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password
        })
      });

      const data = await response.json();
      localStorage.setItem('PixelPalsUser', JSON.stringify(data.user));
      setUserAtom(data.user);


      if (response.ok) {
        setUserAuth('home');
      } else {
        setSnackbarMessage(data.message || 'Login failed. Please check your credentials.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('An unexpected error occurred. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className='bg-[url("public/pink-7761356_960_720.webp")] h-[100vh] bg-cover flex justify-center'>
        <div className='flex w-[100%] justify-center'>
          <div className='flex flex-col justify-center glasseffect w-[30%] h-[80vh] relative top-[10%] rounded-l-lg'>
            <div className='flex flex-col justify-center items-center font-bold text-xl'>
              <img src="/pixelpals-high-resolution-logo-black-transparent.png" alt="App-logo" width="350px" height="350px" className='relative bottom-[10%]' />
              <h1 className='text-3xl font-bold text-center text-pink-700 pb-10'>Good to See You!</h1>
              <form className='flex flex-col text-pink-700'>
                <label htmlFor="email" className='pb-2'>Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className='mb-5 gradient-border-1'
                  onChange={(e) => setInput({ ...input, email: e.target.value })}
                  value={input.email}
                />
                <label htmlFor="password" className='pb-2'>Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className='mb-5 gradient-border-1'
                  onChange={(e) => setInput({ ...input, password: e.target.value })}
                  value={input.password}
                />
                <div className='flex justify-center w-[100%] h-[100%]'>
                  <button type="submit" onClick={handleLogin} className='mt-3 p-3 pl-7 pr-7 border-2 border-pink-700 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Login</button>
                  <button type="reset" className='mt-3 p-3 border-2 mx-6 border-pink-700 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Guest User</button>
                </div>
              </form>
              <p className='text-center text-pink-700 mt-14'>Don't have an account? <a className='underline text-pink-500 hover:text-pink-900' onClick={() => setUserAuth('register')}>register</a></p>
              <p className='text-center text-pink-700 mt-2'>Forgot password? <a className='underline text-pink-500 hover:text-pink-900' href="/reset-password">reset password</a></p>
            </div>
          </div>

          <div className='relative flex flex-col justify-center items-center top-[10%] bg-[url("/ai-generated-8123097_640.webp")] h-[80vh] w-[35%] bg-cover bg-center bg-opacity-20 rounded-r-lg'>
            <div className='absolute inset-0 bg-black opacity-60 rounded-r-lg'></div>
            <div className='relative z-10 text-white text-center font-bold'>
              <h3 className='text-4xl relative bottom-[30%]'>The new way to connect</h3>
              <div className='text-left text-2xl leading-10 relative bottom-[20%] pl-12'>
                Discover new people
                <br />
                Bond over new experiences
                <br />
                Share memories
                <br />
                Rediscover yourself
              </div>
              <p></p>
              <div className='text-pink-700 pr-20'>
                <button className='font-bold px-2 py-2 m-2 rounded-md glasseffect gradient-border text-pink-700 hover:bg-pink-700 hover:text-white transition duration-300'> <Link to="/learn-more">Learn more</Link></button>
                <button
                  onClick={() => setShowInviteDialog(true)}
                  className='text-pink-700 font-bold px-2 py-2 m-2 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'
                >
                  Invite others
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showInviteDialog && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="relative p-6 bg-black rounded-lg shadow-lg">
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
