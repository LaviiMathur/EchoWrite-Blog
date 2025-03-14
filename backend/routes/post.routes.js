import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPublicPosts,
  toggleLike,
  toggleBookmark,

} from "../controllers/blog.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const postRoute = express.Router();

// createpost Route
postRoute.post("/create-post", authMiddleware, createPost);
//updatepost Route
postRoute.put("/:slug", authMiddleware, updatePost);
//deletepost Route
postRoute.delete("/:slug", authMiddleware, deletePost);
//getposts public Route
postRoute.get("/all-posts", getPublicPosts);
//getpost Route
postRoute.get("/:slug", getPost);
//toggle likes
postRoute.post("/like", toggleLike);
//toggle bookmark
postRoute.post("/toggleBookmark",authMiddleware, toggleBookmark);


export default postRoute;
