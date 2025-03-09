import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  InputAdornment, 
  Typography, 
  Snackbar, 
  Alert, 
  Box, 
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { searchUser } from '../apis/userApi';

const SearchUsers = ({ onSearchResult }) => {
  const [searchText, setSearchText] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const currentUser = useRecoilValue(getUser);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchText.trim()) {
      setSnackbarMessage('Please enter a username to search');
      setOpenSnackbar(true);
      return;
    }
    
    setSearchingUser(true);

    try {
      const searchedUser = await searchUser(searchText);

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
    <Box 
      component="form" 
      onSubmit={handleSearch}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      {/* Title */}
      <Typography 
        variant="h6" 
        fontFamily={'Parkinsans'} 
        fontWeight="bold"
        sx={{ 
          textAlign: 'center',
          color: pink[700],
          mb: 1
        }}
      >
        Search Users
      </Typography>

      {/* Search Input and Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          width: '100%',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by username..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size={isMobile ? "small" : "medium"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: pink[500] }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '20px',
              fontFamily: 'Parkinsans',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: pink[200],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: pink[300],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: pink[500],
              },
              bgcolor: 'background.paper',
            },
          }}
        />

        <Button
          variant="contained"
          type="submit"
          disabled={searchingUser}
          sx={{
            bgcolor: pink[500],
            color: 'black',
            fontWeight: 'bold',
            fontFamily: 'Parkinsans',
            textTransform: 'none',
            borderRadius: '20px',
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.2 },
            minWidth: { xs: '100%', sm: '120px' },
            '&:hover': {
              bgcolor: pink[700],
            },
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {searchingUser ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <>
              <SearchIcon fontSize="small" />
              <span>Search</span>
            </>
          )}
        </Button>
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="error" 
          variant="filled"
          sx={{
            fontFamily: 'Parkinsans',
            fontWeight: 'medium',
            borderRadius: 2,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchUsers;
