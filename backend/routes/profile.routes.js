import express from "express";
import {
  getBookmarkedPost,
  toggleFollow,
  userProfile,
} from "../controllers/profile.controller.js";
import { updateUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const profileRoute = express.Router();
// userProfile
profileRoute.get("/:username", userProfile);
//update profile
profileRoute.patch("/:useranme/update-profile", authMiddleware, updateUser);
//fetch bookmark
profileRoute.get("/:username/saved", authMiddleware, getBookmarkedPost);
// Toggle follow
profileRoute.patch("/follow", authMiddleware, toggleFollow);

export default profileRoute;
