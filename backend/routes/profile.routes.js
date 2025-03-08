import express from "express";
import { getBookmarkedPost, userProfile } from "../controllers/blog.controller.js";
import { updateUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const profileRoute = express.Router();
// userProfile
profileRoute.get("/:username", userProfile);
//update profile
profileRoute.put("/:useranme/update-profile",authMiddleware, updateUser);
//fetch bookmark
profileRoute.get("/:username/saved",authMiddleware, getBookmarkedPost);

export default profileRoute;
