import React, { useRef } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRecoilValue } from 'recoil';
import getUser from '../Atom/getUser';
import { pink } from '@mui/material/colors';
import postAtom from '../Atom/postAtom';
import { useRecoilState } from 'recoil';
import { createPost } from '../apis/postApi';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
  '& .MuiPaper-root': {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
  },
}));

const MaxCHAR = 500;

const CreatePost = () => {
  const [open, setOpen] = React.useState(false);
  const [postText, setText] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState(null);
  const [remainingchars, setRemainingchars] = React.useState(MaxCHAR);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  const [post, setPost] = useRecoilState(postAtom);
  const user = useRecoilValue(getUser);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    const postText = e.target.value;
    if (postText.length > MaxCHAR) {
      setText(postText.substring(0, MaxCHAR));
      setRemainingchars(0);
    } else {
      setText(postText);
      setRemainingchars(MaxCHAR - postText.length);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCreatePost = async () => {
    const reader = new FileReader();
    if (fileInputRef.current.files[0]) {
      reader.readAsDataURL(fileInputRef.current.files[0]);

      reader.onload = async () => {
        const base64Image = reader.result;
        const { success, post, error } = await createPost(user._id, postText, base64Image);

        if (success) {
          setSnackbarMessage("Post created successfully!");
          setPost([post, ...post]);
          setSnackbarSeverity("success");
          setText("");
          setImagePreview(null);
          setOpen(false);
          window.location.reload();
        } else {
          setSnackbarMessage(error);
          setSnackbarSeverity("error");
        }

        setSnackbarOpen(true);
      };
    } else {
      const { success, post, error } = await createPost(user._id, postText, null);

      if (success) {
        setSnackbarMessage("Post created successfully!");
        setSnackbarSeverity("success");
        setText("");
        setImagePreview(null);
        setOpen(false);
        window.location.reload();
      } else {
        setSnackbarMessage(error);
        setSnackbarSeverity("error");
      }

      setSnackbarOpen(true);
    }
  };

  return (
    <>
      {/* Fixed position button */}
      <div className="fixed bottom-10 right-32 font-parkinsans">
        <button
          className="flex items-center gap-2 bg-pink-700 text-white p-2 rounded-md glasseffect hover:bg-pink-600"
          onClick={handleClickOpen}
        >
          <AddCircleOutlineIcon />
          <p className="font-bold">Create Post</p>
        </button>
      </div>
      
      <React.Fragment>
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
          sx={{
            '& .MuiDialog-paper': {
              width: '600px',
              height: '500px',
              maxWidth: '100%',
            },
          }}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Create a Post
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            <textarea
              className="w-full h-[100px] border rounded-md p-2"
              placeholder="What do you want to share?"
              onChange={handleTextChange}
              value={postText}
              style={{ color: 'black', fontWeight: 'bold' }}
            ></textarea>
            <p className="text-sm text-gray-500 font-bold text-right m-1">
              {remainingchars}/500
            </p>
            <div className="flex items-center gap-2 mt-2">
              <PhotoCamera sx={{ color: pink[500] }} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="file-input"
                style={{
                  border: '1px solid pink',
                  padding: '8px',
                  borderRadius: '8px',
                  width: '100%',
                  maxWidth: '400px',
                  color: 'black',
                  fontWeight: 'bold',
                }}
              />
            </div>
            {imagePreview && (
              <div className="relative mt-4">
                <IconButton
                  aria-label="remove image"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '4px',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-md" />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={handleCreatePost}
              disabled={!postText.trim()}
              sx={{ color: pink[500], border: '1px solid pink', fontWeight: 'bold' }}
            >
              Post
            </Button>
          </DialogActions>
        </BootstrapDialog>
      </React.Fragment>
      
      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
}  

export default CreatePost;
