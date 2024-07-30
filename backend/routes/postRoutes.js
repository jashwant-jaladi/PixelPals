import express from "express";
import { createPost, getPost, deletePost, likeAndUnlikePost, commentPost, getFeedPosts } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const PostRouter = express.Router();

PostRouter.get("/feed/",protectRoute, getFeedPosts);
PostRouter.post("/create",protectRoute, createPost);
PostRouter.get("/:id", getPost);
PostRouter.delete("/:id",protectRoute, deletePost);
PostRouter.post("/like/:id", protectRoute, likeAndUnlikePost);
PostRouter.post("/comment/:id", protectRoute, commentPost);

export default PostRouter;
