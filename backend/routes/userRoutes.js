import express from "express";
import { signupUser, loginUser, logoutUser, followandUnfollowUser, updateProfile, getUserProfile, getSuggestedUsers, freezeAccount, resetLink, resetPassword } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.get("/profile/:username", getUserProfile)
Router.post("/signup", signupUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser)
Router.post("/follow/:id", protectRoute, followandUnfollowUser)
Router.get("/suggested", protectRoute, getSuggestedUsers);
Router.put("/update/:id", protectRoute, updateProfile)
Router.put("/freeze", protectRoute, freezeAccount)
Router.post("/reset-link", resetLink)
Router.post("/reset-password/:id", resetPassword)
export default Router
