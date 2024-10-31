import express from "express";
import { createPost, getPost, deletePost, likeAndUnlikePost, commentPost, getFeedPosts, getUserPosts } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const PostRouter = express.Router();

PostRouter.get("/feed",protectRoute, getFeedPosts);
PostRouter.post("/create",protectRoute, createPost);
PostRouter.get("/:id", getPost);
PostRouter.get("/user/:username", getUserPosts);
PostRouter.delete("/:id",protectRoute, deletePost);
PostRouter.put("/like/:id", protectRoute, likeAndUnlikePost);
PostRouter.put("/comment/:id", protectRoute, commentPost);

export default PostRouter;
