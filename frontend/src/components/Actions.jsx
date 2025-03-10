import React, { useState } from "react";
import {
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
  Tooltip,
  Fade,
  Zoom,
  Paper,
  Divider,
  Chip
} from "@mui/material";
import { pink } from "@mui/material/colors";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useRecoilValue, useRecoilState } from "recoil";
import getUser from "../Atom/getUser";
import postAtom from "../Atom/postAtom";
import { likeOrUnlikePost, commentOnPost } from "../apis/postApi";

// Add this CSS for Parkinsans font
const parkinsansFont = {
  fontFamily: "Parkinsans, sans-serif",
};

const Actions = ({ post }) => {
  const user = useRecoilValue(getUser);
  const [posts, setPosts] = useRecoilState(postAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLikeOrUnlike = async () => {
    if (!user) return handleSnackbar("Please login or register to like", "error");
    if (isLiking) return;

    setIsLiking(true);
    const data = await likeOrUnlikePost(post._id);

    if (data.error) return handleSnackbar(data.error, "error");

    const updatedPosts = posts.map((p) =>
      p._id === post._id
        ? { ...p, likes: liked ? p.likes.filter((id) => id !== user._id) : [...p.likes, user._id] }
        : p
    );

    setPosts(updatedPosts);
    setLiked(!liked);
    setIsLiking(false);
  };

  const handleCommentSubmit = async () => {
    if (!user) return handleSnackbar("Please login or register to comment", "error");
    if (isReplying || !comment.trim()) return;

    setIsReplying(true);
    const data = await commentOnPost(post._id, comment);

    if (data.error) return handleSnackbar(data.error, "error");

    setPosts(posts.map((p) => (p._id === post._id ? { ...p, comments: [...p.comments, data] } : p)));
    setComment("");
    setCommentDialogOpen(false);
    handleSnackbar("Comment added successfully!");
    setIsReplying(false);
  };

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    const postLink = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postLink).then(() => {
      setCopied(true);
      handleSnackbar("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {/* Action Buttons */}
        <Stack 
          direction="row" 
          spacing={{ xs: 2, sm: 3 }} 
          sx={{ 
            my: 2,
            justifyContent: 'flex-start'
          }}
        >
          <Tooltip title={liked ? "Unlike" : "Like"} arrow>
            <IconButton 
              onClick={handleLikeOrUnlike}
              sx={{
                color: liked ? 'white' : 'text.secondary',
                bgcolor: liked ? pink[500] : 'transparent',
                border: `1px solid ${liked ? pink[500] : pink[200]}`,
                borderRadius: '12px',
                p: { xs: '6px 10px', sm: '8px 12px' },
                transition: 'all 0.3s ease',
                '&:hover': { 
                  backgroundColor: liked ? pink[600] : pink[50],
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
              size={isMobile ? "small" : "medium"}
              disabled={isLiking}
            >
              {liked ? (
                <FavoriteIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    animation: liked ? 'pulse 0.5s' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }} 
                />
              ) : (
                <FavoriteBorderIcon fontSize={isMobile ? "small" : "medium"} />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Comment" arrow>
            <IconButton 
              onClick={() => setCommentDialogOpen(true)}
              sx={{
                color: 'text.secondary',
                border: `1px solid ${pink[200]}`,
                borderRadius: '12px',
                p: { xs: '6px 10px', sm: '8px 12px' },
                transition: 'all 0.3s ease',
                '&:hover': { 
                  backgroundColor: pink[50],
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
              size={isMobile ? "small" : "medium"}
            >
              <CommentIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share" arrow>
            <IconButton 
              onClick={handleShareClick}
              sx={{
                color: 'text.secondary',
                border: `1px solid ${pink[200]}`,
                borderRadius: '12px',
                p: { xs: '6px 10px', sm: '8px 12px' },
                transition: 'all 0.3s ease',
                '&:hover': { 
                  backgroundColor: pink[50],
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
              size={isMobile ? "small" : "medium"}
            >
              <ShareIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
        </Stack>
        
        {/* Stats */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            mb: 1
          }}
        >
          <Chip
            label={`${post.likes?.length || 0} likes`}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: pink[50],
              color: pink[700],
              fontFamily: 'Parkinsans',
              fontWeight: 'bold',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
            variant="filled"
          />
          
          <Chip
            label={`${post.comments?.length || 0} comments`}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.secondary',
              fontFamily: 'Parkinsans',
              fontWeight: 'bold',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Comment Dialog */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)} 
        fullWidth 
        maxWidth="sm"
        fullScreen={isMobile}
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{
            fontFamily: 'Parkinsans',
            fontWeight: 'bold',
            bgcolor: pink[500],
            color: "inherit",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: 2, sm: 3 }
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'inherit', fontWeight: 'inherit' }}>
            Add a Comment
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={() => setCommentDialogOpen(false)}
            aria-label="close"
            sx={{ color: pink[700] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 3, sm: 4 } }}>
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment"
            type="text"
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            InputProps={{ 
              sx: { 
                fontFamily: 'Parkinsans',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: pink[200]
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: pink[300]
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: pink[500]
                }
              }
            }}
            InputLabelProps={{ 
              sx: { 
                fontFamily: 'Parkinsans',
                color: pink[700]
              }
            }}
            multiline
            rows={isMobile ? 4 : 3}
            placeholder="Share your thoughts..."
          />
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button
            onClick={() => setCommentDialogOpen(false)}
            sx={{ 
              color: 'text.secondary', 
              fontFamily: 'Parkinsans',
              fontWeight: 'medium',
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommentSubmit}
            sx={{ 
              color: 'inherit', 
              bgcolor: pink[500],
              fontFamily: 'Parkinsans',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 3,
              py: 1,
              borderRadius: 6,
              '&:hover': { 
                bgcolor: pink[700],
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              },
              '&.Mui-disabled': {
                bgcolor: pink[200],
                color: 'white'
              }
            }}
            disabled={!comment.trim() || isReplying}
            variant="contained"
            endIcon={<SendIcon />}
          >
            {isReplying ? 'Posting...' : 'Post Comment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)} 
        fullWidth 
        maxWidth="sm"
        fullScreen={isMobile}
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{
            fontFamily: 'Parkinsans',
            fontWeight: 'bold',
            bgcolor: pink[50],
            color: pink[700],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: 2, sm: 3 }
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'inherit', fontWeight: 'inherit' }}>
            Share Post
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={() => setShareDialogOpen(false)}
            aria-label="close"
            sx={{ color: pink[700] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 3, sm: 4 } }}>
          <TextField
            fullWidth
            value={`${window.location.origin}/post/${post._id}`}
            variant="outlined"
            InputProps={{
              sx: { 
                fontFamily: 'Parkinsans',
                borderRadius: 2,
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: pink[200]
                }
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? "Copied!" : "Copy link"} arrow>
                    <IconButton 
                      onClick={handleCopyLink} 
                      sx={{ 
                        color: copied ? pink[700] : pink[500],
                        '&:hover': { bgcolor: pink[50] }
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              readOnly: true
            }}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontFamily: 'Parkinsans',
                mb: 2,
                textAlign: 'center'
              }}
            >
              Share this post with your friends
            </Typography>
            
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#1877F2', // Facebook blue
                  color: 'white',
                  fontFamily: 'Parkinsans',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 6,
                  px: 3,
                  '&:hover': { bgcolor: '#0d6efd' }
                }}
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/post/${post._id}`, '_blank')}
              >
                Facebook
              </Button>
              
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#1DA1F2', // Twitter blue
                  color: 'white',
                  fontFamily: 'Parkinsans',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 6,
                  px: 3,
                  '&:hover': { bgcolor: '#0c8de4' }
                }}
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/post/${post._id}`, '_blank')}
              >
                Twitter
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button
            onClick={() => setShareDialogOpen(false)}
            sx={{ 
              color: 'text.secondary', 
              fontFamily: 'Parkinsans',
              fontWeight: 'medium',
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            fontFamily: 'Parkinsans',
            fontWeight: 'medium',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Actions;