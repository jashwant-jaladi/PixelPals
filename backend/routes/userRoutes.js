import express from "express";
import { signupUser, loginUser, logoutUser, updateProfile, privateAccount, getUserProfile, getSuggestedUsers, deleteUser, resetLink, resetPassword, guestLogin, fetchUserById } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const Router = express.Router();

Router.get("/profile/:username", getUserProfile);
Router.get("/suggested", protectRoute, getSuggestedUsers); // Move this BEFORE the /:id route
Router.get("/:id", protectRoute, fetchUserById);
Router.post("/signup", signupUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser);
Router.put("/update/:id", protectRoute, updateProfile);
Router.delete("/deleteUser", protectRoute, deleteUser);
Router.post("/reset-link", resetLink);
Router.post("/reset-password/:token", resetPassword);
Router.put("/private", protectRoute, privateAccount);
Router.post("/guest-login", guestLogin);

export default Router;