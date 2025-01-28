import React from 'react';
import { TextField, Button, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';

const SearchUsers = () => {
  const handleSearch = () => {
    console.log('Search button clicked!');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-inherit rounded-lg shadow-sm font-parkinsans ">
      {/* Title */}
      <Typography variant="h5" >
        Search User
      </Typography>

      {/* Search Input Field */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users..."
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
