import express from "express";
import { signupUser } from "../controllers/userController.js";

const Router=express.Router();

Router.post("/signup", signupUser);

export default Router