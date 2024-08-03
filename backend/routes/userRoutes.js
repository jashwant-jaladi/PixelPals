import express from "express";
import { signupUser, loginUser, logoutUser, followandUnfollowUser, updateProfile, getUserProfile } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.get("/profile/:username", getUserProfile)
Router.post("/signup", signupUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser)
Router.post("/follow/:id", protectRoute, followandUnfollowUser)
Router.put("/update/:id", protectRoute, updateProfile)
export default Router