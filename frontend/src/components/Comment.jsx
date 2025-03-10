import React from 'react';
import { 
  Avatar, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { pink } from '@mui/material/colors';

const Comment = ({ comment, currentUser, postId, handleDeleteComment }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Format date
  const fullDate = comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : '';
  const shortDate = comment.createdAt ? format(new Date(comment.createdAt), 'MMM d') : ''; // Example: "Mar 4"

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'lightgrey',
        },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Avatar */}
        <Link to={`/${comment.username}`}>
          <Avatar 
            src={comment.profilePic} 
            alt={comment.username}
            sx={{ 
              width: { xs: 32, sm: 36 }, 
              height: { xs: 32, sm: 36 },
              border: `2px solid ${pink[200]}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }} 
          />
        </Link>
        
        {/* Comment Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 0.5
          }}>
            {/* Username */}
            <Link 
              to={`/${comment.username}`}
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: pink[700],
                  fontFamily: 'Parkinsans',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {comment.username}
              </Typography>
            </Link>
            
            {/* Date and Delete */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: 'Parkinsans',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                }}
              >
                <span className="sm:hidden">{shortDate}</span>
                <span className="hidden sm:inline">{fullDate}</span>
              </Typography>
              
              {comment.userId.includes(currentUser?._id) && (
                <Tooltip title="Delete comment" arrow>
                  <IconButton
                    onClick={() => handleDeleteComment(postId, comment._id)}
                    size="small"
                    sx={{ 
                      color: 'error.main',
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          
          {/* Comment Text */}
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Parkinsans',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'text.primary',
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {comment.text}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Comment;
