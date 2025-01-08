import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import userAuthState from '../Atom/authAtom';
import { Snackbar, Alert } from '@mui/material';


const Register = () => {
  const setUserAuth = useSetRecoilState(userAuthState);
  const [input, setInput] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmpassword: ''
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
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: input.name,
          username: input.username,
          email: input.email,
          password: input.password
        })
      });

      const data = await response.json();
    

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
      console.log(error);
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
      <div className='bg-[url("/pink-7761356_960_720.webp")] h-[100vh] bg-cover flex justify-center'>
        <div className='flex w-[100%] justify-center '>
          <div className='relative flex flex-col justify-center items-center top-[10%] bg-[url("/ai-generated-8123097_640.webp")] bg-cover bg-center bg-no-repeat h-[80vh] w-[35%]  bg-opacity-20 rounded-l-lg'>
            <div className='absolute inset-0 bg-black opacity-60 rounded-l-lg '></div>
            <div className='relative z-10'></div>
          </div>
          <div className='flex flex-col justify-center glasseffect w-[30%] h-[80vh] relative top-[10%] rounded-r-lg'>
            <div className='flex flex-col justify-center items-center font-bold text-xl'>
              <img src="/pixelpals-high-resolution-logo-black-transparent.png" alt="App-logo" width="300px" height="300px" className='pb-8' />
              <h1 className='text-2xl font-bold text-center text-pink-700 pb-5'>Create your account here!</h1>
              <form onSubmit={handleRegister} className='flex flex-col text-pink-700 pt-3'>

                <label htmlFor="name">Full Name</label>
                <input type="text" name="name" id="name" className='gradient-border-1 mb-4' onChange={(e) => setInput({ ...input, name: e.target.value })} value={input.name} />

                <label htmlFor="username">Username</label>
                <input type="text" name="username" id="username" value={input.username} onChange={(e) => setInput({ ...input, username: e.target.value })} className='gradient-border-1 mb-4' />

                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" value={input.email} onChange={(e) => setInput({ ...input, email: e.target.value })} className='gradient-border-1 mb-4' />

                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" value={input.password} onChange={(e) => setInput({ ...input, password: e.target.value })} className='gradient-border-1 mb-4' />

                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" name="confirm-password" id="confirm-password" value={input.confirmpassword} onChange={(e) => setInput({ ...input, confirmpassword: e.target.value })} className='gradient-border-1 mb-4' />

                <div className='flex justify-center'>
                  <button type="submit" className='mt-3 p-3 pl-7 pr-7 border-2 w-[50%] border-pink-700 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Register</button>
                </div>
              </form>
              <p className='text-center text-pink-700 mt-5'>Already have an account? <a className='underline text-pink-500 hover:text-pink-900' onClick={() => setUserAuth('login')}>login</a></p>
            </div>
          </div>
        </div>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Register;
