import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPublicPosts,
  toggleLike,
  toggleBookmark,
  addComments,
  deleteComments,
} from "../controllers/blog.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const postRoute = express.Router();

// createpost Route
postRoute.post("/create-post", authMiddleware, createPost);
//updatepost Route
postRoute.patch("/:slug", authMiddleware, updatePost);
//deletepost Route
postRoute.delete("/delete-post", authMiddleware, deletePost);
//getposts public Route
postRoute.get("/all-posts", getPublicPosts);
//getpost Route
postRoute.get("/:slug", getPost);
//toggle likes
postRoute.post("/like", toggleLike);
//toggle bookmark
postRoute.post("/toggleBookmark", authMiddleware, toggleBookmark);
//add comments
postRoute.post("/add-comment", authMiddleware, addComments);
//delete comments
postRoute.delete("/delete-comment", authMiddleware, deleteComments);

export default postRoute;
