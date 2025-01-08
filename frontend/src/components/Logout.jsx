import React from 'react';
import { Button } from '@mui/material';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import userAuthState from '../Atom/authAtom';
import LogoutIcon from '@mui/icons-material/Logout';
import getUser from '../Atom/getUser';


const Logout = () => {
  const setUserAtom = useSetRecoilState(getUser);
  const setUserAuth = useSetRecoilState(userAuthState);
  const navigate = useNavigate(); // Initialize navigate function

  const logout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Clear user data
      localStorage.removeItem('PixelPalsUser');
      setUserAtom(null); // Update the atom with null
      setUserAuth('login');

      // Redirect to the login page
      navigate('/auth');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Button
        onClick={logout}
        variant="contained"
        sx={{
          backgroundColor: 'rgba(176, 73, 174, 0.1)', // Matches glasseffect
          color: '#ffffff', // Text color
          fontWeight: 'bold',
          borderRadius: '12px',
          border: '1px solid rgba(176, 73, 174, 0.69)', // Border from glasseffect
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Shadow from glasseffect
          ':hover': {
            backgroundColor: 'rgba(176, 73, 174, 0.2)', // Slightly darker for hover
            boxShadow: '0 6px 35px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <LogoutIcon />
      </Button>
    </div>
  );
};

export default Logout;
