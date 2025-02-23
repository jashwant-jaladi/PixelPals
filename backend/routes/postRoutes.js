import express from "express";
import { createPost, getPost, deletePost, likeAndUnlikePost, commentPost,deleteComment, getFeedPosts, getUserPosts, markNotificationAsRead, getNotifications } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const PostRouter = express.Router();

PostRouter.get("/feed",protectRoute, getFeedPosts);
PostRouter.post("/create",protectRoute, createPost);
PostRouter.get("/user/:username", getUserPosts);
PostRouter.delete("/:id",protectRoute, deletePost);
PostRouter.put("/like/:id", protectRoute, likeAndUnlikePost);
PostRouter.put("/comment/:id", protectRoute, commentPost);
PostRouter.delete("/comment/:postId/:commentId",protectRoute, deleteComment);
PostRouter.get("/notifications",protectRoute, getNotifications);
PostRouter.get("/:id", getPost);
PostRouter.put("/mark-notification-as-read/:notificationId",protectRoute, markNotificationAsRead);

export default PostRouter;
