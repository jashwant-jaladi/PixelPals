import React from 'react';
import { InputAdornment, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { pink } from '@mui/material/colors';
const MessageInput = () => {
  return (
    <div className="flex p-2">
      <TextField
        variant="outlined"
        placeholder="Type a message..."
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton sx={{ color: pink[500] }}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
          style: {
            borderRadius: 25,
            paddingRight: 8,
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: '#E0E0E0',
            },
            "&:hover fieldset": {
              borderColor: '#FF69B4',
            },
            "&.Mui-focused fieldset": {
              borderColor: '#FF1493',
            },
          },
        }}
      />
    </div>
  );
};

export default MessageInput;
