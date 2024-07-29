import express from "express";
import { createPost, getPost, deletePost } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const PostRouter = express.Router();

PostRouter.post("/create",protectRoute, createPost);
PostRouter.get("/:id", getPost);
PostRouter.delete("/:id",protectRoute, deletePost);

export default PostRouter;
