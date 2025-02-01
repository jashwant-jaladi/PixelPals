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
} from "@mui/material";
import { pink } from "@mui/material/colors";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRecoilValue, useRecoilState } from "recoil";
import getUser from "../Atom/getUser";
import postAtom from "../Atom/postAtom";
import { likeOrUnlikePost, commentOnPost } from "../apis/postApi";

const Actions = ({ post }) => {
  const user = useRecoilValue(getUser);
  const [posts, setPosts] = useRecoilState(postAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
    setDialogOpen(false);
    handleSnackbar("Comment added successfully!");
    setIsReplying(false);
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="my-3 flex gap-3">
          <Button sx={{ color: pink[500], border: "1px solid pink" }} onClick={handleLikeOrUnlike}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </Button>
          <Button sx={{ color: pink[500], border: "1px solid pink" }} onClick={() => setDialogOpen(true)}>
            <CommentIcon />
          </Button>
          <Button sx={{ color: pink[500], border: "1px solid pink" }}>
            <ShareIcon />
          </Button>
        </div>
        <div className="flex gap-3 font-bold text-gray-500 items-center">
          <p>{post.comments?.length || 0} replies</p>
          <p className="pb-2 text-xl">.</p>
          <p>{post.likes?.length || 0} likes</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment"
            type="text"
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCommentSubmit} color="primary" disabled={!comment.trim()}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Actions;
