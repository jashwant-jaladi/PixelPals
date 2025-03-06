import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import userAuthState from '../Atom/authAtom';
import { Snackbar, Alert } from '@mui/material';
import { registerUser } from '../apis/userApi';

const Register = () => {
  const setUserAuth = useSetRecoilState(userAuthState);
  const navigate = useNavigate(); // Initialize useNavigate
  const [input, setInput] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const { name, username, email, password, confirmpassword } = input;
  
    if (!name || !username || !email || !password || !confirmpassword) {
      return showSnackbar('Please fill all fields', 'error');
    }
  
    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      return showSnackbar('Invalid email format', 'error');
    }
  
    if (password !== confirmpassword) {
      return showSnackbar('Passwords do not match', 'error');
    }
  
    try {
      const response = await registerUser(input);
  
      if (response.error) {
        return showSnackbar(response.error, 'error'); // Show backend error
      }
  
      // Show success snackbar
      showSnackbar(response.message, 'success');
  
      // Reset form
      setInput({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmpassword: '',
      });
  
      // Redirect to login after 1 second
      setTimeout(() => {
        setUserAuth('login'); 
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Something went wrong. Please try again.', 'error');
    }
  };
  
  

  return (
    <>
      <div className="min-h-screen bg-inherit flex items-center justify-center p-4 font-parkinsans text-black">
        <div className="flex flex-col-reverse lg:flex-row w-full max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-purple-900">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 bg-gradient-to-r from-pink-600 to-purple-600 p-8 flex flex-col justify-center items-center text-white">
            <h3 className="text-4xl font-bold mb-8 text-center">Join the Community</h3>
            <ul className="text-center text-xl space-y-4 font-bold">
              <li>Connect with friends</li>
              <li>Share your moments</li>
              <li>Discover new experiences</li>
              <li>Be part of something bigger</li>
            </ul>
            <button
              onClick={() => setUserAuth('login')}
              className="mt-8 bg-transparent border border-white text-white font-bold px-6 py-2 rounded-lg hover:bg-white hover:text-pink-600 transition duration-300"
            >
              Already a member? Login
            </button>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 p-8 flex bg-black flex-col justify-center items-center">
            <img
              src="/pixelpals-high-resolution-logo-white-transparent.png"
              alt="App-logo"
              width="300"
              height="300"
              className="mb-8"
            />
            <h1 className="text-3xl font-bold text-center text-pink-700 mb-8 font-parkinsans">Create Your Account</h1>
            <form onSubmit={handleRegister} className="w-full max-w-md space-y-6">
              {[
                { label: 'Full Name', name: 'name', type: 'text' },
                { label: 'Username', name: 'username', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Password', name: 'password', type: 'password' },
                { label: 'Confirm Password', name: 'confirmpassword', type: 'password' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-pink-700 font-medium mb-2 font-parkinsans">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onChange={handleChange}
                    value={input[name]}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition duration-300"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Register;