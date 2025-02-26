import express from 'express';
import { followandUnfollowUser, getFollowersAndFollowing, requestFollow, acceptFollow, rejectFollow, cancelFollowRequest } from '../controllers/followController.js';
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.post("/follow/:id", protectRoute, followandUnfollowUser) 

Router.get("/follow-unfollow/:userId", protectRoute, getFollowersAndFollowing);
Router.post("/follow/:id/request", protectRoute, requestFollow);  
Router.put("/follow/:id/accept", protectRoute, acceptFollow);     
Router.post("/follow/:id/reject", protectRoute, rejectFollow);  
Router.post("/cancel-request", cancelFollowRequest);

export default Router;