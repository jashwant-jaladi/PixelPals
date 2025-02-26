import express from 'express';
import { followandUnfollowUser, getFollowersAndFollowing, requestFollow, acceptFollow, rejectFollow, cancelFollowRequest } from '../controllers/followController.js';
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.post("/follow/:id", protectRoute, followandUnfollowUser) 

Router.get("/follow-unfollow/:userId", protectRoute, getFollowersAndFollowing);
Router.post("/follow/:id/request", protectRoute, requestFollow);  // `:id` is the requested user's ID
Router.put("/follow/:id/accept", protectRoute, acceptFollow);     // `:id` is the sender's ID
Router.post("/follow/:id/reject", protectRoute, rejectFollow);  // `:id` is the sender's ID
Router.post("/cancel-request", cancelFollowRequest);

export default Router;