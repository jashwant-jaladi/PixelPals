import express from 'express';
import { followandUnfollowUser, followUnfollowDialog, getFollowersAndFollowing, requestFollow, acceptFollow, rejectFollow } from '../controllers/followController.js';
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.post("/follow/:id", protectRoute, followandUnfollowUser) 
Router.post("/followUnfollowDialog", protectRoute, followUnfollowDialog)
Router.get("/follow-unfollow/:userId", protectRoute, getFollowersAndFollowing);
Router.post("/request-follow", protectRoute, requestFollow)
Router.put("/accept-follow", protectRoute, acceptFollow)
Router.delete("/reject-follow", protectRoute, rejectFollow)

export default Router;