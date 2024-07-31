import React from 'react';
import { Button } from '@mui/material';
import { pink } from '@mui/material/colors';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import getUser from '../Atom/getUser';

const Logout = () => {
  const setUserAtom = useSetRecoilState(getUser);

  const logout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      localStorage.removeItem('PixelPalsUser');
      setUserAtom(null); // Update the atom with null
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-end p-4">
      <Button
        onClick={logout}
        variant="contained"
        sx={{
          backgroundColor: pink[500], // Main pink color
          color: '#ffffff', // Text color
          fontWeight: 'bold',
          borderRadius: '12px', // Slightly rounded corners
          boxShadow: `0 4px 6px ${pink[300]}`, // Shadow effect
          ":hover": {
            backgroundColor: pink[600], // Darker pink on hover
            boxShadow: `0 6px 8px ${pink[400]}`, // Enhanced shadow on hover
          },
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Logout;
