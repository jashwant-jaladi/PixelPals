import React, { useState } from 'react';
import { TextField, Button, InputAdornment, Typography, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { searchUser } from '../apis/userApi'; // Import the searchUser function from api.js

const SearchUsers = ({ onSearchResult }) => {
  const [searchText, setSearchText] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const currentUser = useRecoilValue(getUser);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);

    try {
      const searchedUser = await searchUser(searchText); // Use the searchUser function

      if (!searchedUser || searchedUser.error) {
        setSnackbarMessage('Account does not exist');
        setOpenSnackbar(true);
        return;
      }

      if (searchedUser._id === currentUser._id) {
        setSnackbarMessage('You cannot search yourself');
        setOpenSnackbar(true);
        return;
      }

      // Pass the search result to the parent component (Homepage)
      onSearchResult(searchedUser);
    } catch (error) {
      setSnackbarMessage('Account does not exist');
      setOpenSnackbar(true);
    } finally {
      setSearchingUser(false);
      setSearchText('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-inherit rounded-lg shadow-sm font-parkinsans">
      {/* Title */}
      <Typography variant="h5" fontFamily={'Parkinsans'}>Search User</Typography>

      {/* Search Input Field */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="text-pink-700" />
            </InputAdornment>
          ),
          style: {
            border: '1px solid #ccc',
            borderColor: pink[500],
            fontFamily: 'Parkinsans',
          },
        }}
        className="border-pink-700"
        
      />

      {/* Search Button */}
      <Button
        variant="contained"
        color="primary"
        style={{
          backgroundColor: pink[500],
          borderColor: pink[500],
          color: 'white',
          textTransform: 'none',
          fontFamily: 'Parkinsans',
        }}
        onClick={handleSearch}
        startIcon={<SearchIcon />}
        className="text-white px-6 py-2 rounded-lg"
      >
        Search
      </Button>

      {/* Snackbar for alerts */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SearchUsers;
