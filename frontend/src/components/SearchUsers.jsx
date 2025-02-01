// src/components/SearchUsers.js
import React, { useState } from 'react';
import { TextField, Button, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { searchUser } from '../apis/userApi'; // Import the searchUser function from api.js

const SearchUsers = ({ onSearchResult }) => {
  const [searchText, setSearchText] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const currentUser = useRecoilValue(getUser);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const searchedUser = await searchUser(searchText); // Use the searchUser function

      if (searchedUser.error) {
        console.log(searchedUser.error);
        return;
      }

      if (searchedUser._id === currentUser._id) {
        console.log('You cannot message yourself');
        return;
      }

      // Pass the search result to the parent component (Homepage)
      onSearchResult(searchedUser);
    } catch (error) {
      console.log(error);
    } finally {
      setSearchingUser(false);
      setSearchText('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-inherit rounded-lg shadow-sm font-parkinsans">
      {/* Title */}
      <Typography variant="h5">Search User</Typography>

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
        }}
        onClick={handleSearch}
        startIcon={<SearchIcon />}
        className="text-white px-6 py-2 rounded-lg"
      >
        Search
      </Button>
    </div>
  );
};

export default SearchUsers;
