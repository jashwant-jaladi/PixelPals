import React, { useEffect, useState } from 'react';
import { Avatar, Button, CircularProgress, Snackbar } from '@mui/material';
import { pink } from '@mui/material/colors';
import Comment from '../components/Comment';
import Actions from '../components/Actions';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import DeleteIcon from '@mui/icons-material/Delete';
import postAtom from '../Atom/postAtom';
import { fetchPost, deletePost, deleteComment } from '../apis/postApi';

const PostPage = () => {
  const { user, loading: loadingUser } = useGetUserProfile();
  const [post, setPost] = useRecoilState(postAtom);
  const { id } = useParams();
  const currentUser = useRecoilValue(getUser);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [deleting, setDeleting] = useState(false);

  const currentPost = post[0];

  useEffect(() => {
    const getPosts = async () => {
      setPost([]);
      try {
        if (id && id.length > 40) {
          console.warn('Invalid post format');
          navigate('/');
        }
        const fetchedPost = await fetchPost(id);
        setPost([fetchedPost]);
      } catch (err) {
        setSnackbarMessage(err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    getPosts();
  }, [id, setPost]);

  const handleDeletePost = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeleting(true);
    try {
      await deletePost(currentPost._id);
      setSnackbarMessage('Post deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      navigate('/');
    } catch (error) {
      setSnackbarMessage('Failed to delete post');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
  
    try {
      await deleteComment(postId, commentId);
  
      setPost((prevPosts) => {
        return prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment._id !== commentId) }
            : post
        );
      });
  
      setSnackbarMessage('Comment deleted successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Failed to delete comment');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };
  

  if (!currentPost) return null;

  return (
    <div className="font-parkinsans">
      <div className="max-w-4xl mx-auto px-4">
        <div className="pl-5">
          <div className="flex justify-between w-full mt-10 font-bold">
            <div className="flex items-center gap-2">
              <Avatar src={user?.profilePic} sx={{ width: 60, height: 60, marginRight: 2 }} />
              <div className="flex items-center gap-2">
                <div>{user?.username}</div>
                <VerifiedIcon color="primary" />
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="text-sm text-gray-500">
                {currentPost.createdAt && formatDistanceToNow(new Date(currentPost.createdAt))} ago
              </div>
              <MoreHorizIcon />
              {currentUser?._id === user?._id && (
                deleting ? (
                  <CircularProgress size={24} color="error" />
                ) : (
                  <DeleteIcon sx={{ color: 'red', cursor: 'pointer' }} onClick={handleDeletePost} />
                )
              )}
            </div>
          </div>
          
          <p className="mt-7 pl-5 font-bold">{currentPost?.caption}</p>
          
          <div className="w-full">
            <img
              src={currentPost?.image}
              alt="post"
              className="w-full h-auto object-contain my-8 pl-5"
            />
          </div>

          <div className='flex justify-center'> 
            <Actions post={currentPost} />
          </div>

          {!currentUser && (
            <div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <p className="font-bold">👋 Login to like, post and comment on posts.</p>
                <Link to="/auth">
                  <Button 
                    sx={{ bgcolor: pink[500], fontWeight: 'bold', color: 'white' }} 
                    variant="contained"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <hr className="my-3" />

          {[...currentPost.comments].reverse().map((comment) => (
            <Comment 
              key={comment._id} 
              comment={comment} 
              lastReply={comment._id === currentPost?.comments[0]._id} 
              currentUser={currentUser}
              postId={currentPost._id}
              handleDeleteComment={handleDeleteComment}
            />
          ))}

          <div className="mt-10"></div>
        </div>
        
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={() => setSnackbarOpen(false)} 
          message={snackbarMessage} 
          severity={snackbarSeverity} 
        />
      </div>
    </div>
  );
};

export default PostPage;
