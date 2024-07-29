import express from "express";
import { signupUser, loginUser, logoutUser, followandUnfollowUser } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const Router=express.Router();

Router.post("/signup", signupUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser)
Router.post("/follow/:id",protectRoute, followandUnfollowUser)
export default Router