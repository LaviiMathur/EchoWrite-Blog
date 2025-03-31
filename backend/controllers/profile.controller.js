import db from "../conf/database.js";
import {
  getBookmarkCounts,
  getCommentCounts,
  getLikeCounts,
} from "./helperFuntions.js";

// Get Bookmarked Posts
export const getBookmarkedPost = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    // Find user_id from username
    const user = await db("users").select("id").where({ username }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get total bookmarked posts
    const totalItems = await db("bookmarks")
      .where("bookmarks.user_id", user.id)
      .count("blog_id as total")
      .first();

    if (!totalItems.total) {
      return res.status(200).json({
        blogs: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: parseInt(page),
        },
      });
    }

    // Fetch bookmarked blogs
    const blogs = await db("blog")
      .join("bookmarks", "blog.id", "=", "bookmarks.blog_id")
      .join("users", "blog.user_id", "=", "users.id")
      .select("blog.*", "users.username", "users.name", "users.avatar")
      .where("bookmarks.user_id", user.id)
      .orderBy("blog.created_at", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const blogIds = blogs.map((blog) => blog.id);
    if (!blogIds.length) {
      return res.status(200).json({
        blogs: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: parseInt(page),
        },
      });
    }

    // Fetch counts
    const [likeCounts, commentCounts, bookmarkCounts] = await Promise.all([
      getLikeCounts(blogIds),
      getCommentCounts(blogIds),
      getBookmarkCounts(blogIds),
    ]);

    // Transform response
    const transformedBlogs = blogs.map((blog) => ({
      ...blog,
      likeCount: likeCounts[blog.id] || 0,
      commentCount: commentCounts[blog.id] || 0,
      savedCount: bookmarkCounts[blog.id] || 0,
      userLiked: true, // Since it's bookmarked, assume user liked it
      userSaved: true,
    }));

    res.status(200).json({
      blogs: transformedBlogs,
      pagination: {
        totalItems: parseInt(totalItems.total),
        totalPages: Math.ceil(totalItems.total / parseInt(limit)),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
// User Profile
export const userProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 10, offset = 0, user_id } = req.query;

    // Fetch user details
    const user = await db("users")
      .select(
        "id",
        "name",
        "email",
        "username",
        "bio",
        "avatar",
        "followers_count",
        "following_count"
      )
      .where({ username })
      .first();

    if (!user) {
      console.error(`User not found for username: ${username}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the total number of blog posts
    const blogCount = await db("blog")
      .where({ user_id: user.id })
      .count("id as total")
      .first();

    // Fetch user posts with pagination
    const blogs = await db("blog")
      .select("blog.*", "users.username", "users.name", "users.avatar")
      .leftJoin("users", "blog.user_id", "users.id")
      .where({ "blog.user_id": user.id })
      .orderBy("blog.created_at", "desc")
      .limit(parseInt(limit, 10))
      .offset(parseInt(offset, 10));

    // Check if the authenticated user follows this profile user
    let isFollowed = false;
    if (user_id) {
      const followRecord = await db("followers")
        .where({
          follower_id: user_id,
          following_id: user.id,
        })
        .first();

      isFollowed = followRecord ? true : false;
    }

    res.status(200).json({
      ...user,
      totalBlogs: blogCount?.total || 0,
      blogs,
      isFollowed,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
export const toggleFollow = async (req, res) => {
  try {
    const { user_id, target_id } = req.body;

    if (!target_id || !user_id) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const tableName = "followers";
    const userColumn = "follower_id";
    const targetColumn = "following_id";

    const existing = await db(tableName)
      .where({ [targetColumn]: target_id, [userColumn]: user_id })
      .first();

    let isActive, actionId;
    if (existing) {
      // Unfollow (delete the record)
      await db(tableName)
        .where({ [targetColumn]: target_id, [userColumn]: user_id })
        .delete();

      // Decrement follower & following counts
      await db("users").where({ id: user_id }).decrement("following_count", 1);
      await db("users")
        .where({ id: target_id })
        .decrement("followers_count", 1);

      isActive = false;
    } else {
      // Follow (insert a new record)
      const result = await db(tableName)
        .insert({ [targetColumn]: target_id, [userColumn]: user_id })
        .returning("id");

      actionId = result[0];

      // Increment follower & following counts
      await db("users").where({ id: user_id }).increment("following_count", 1);
      await db("users")
        .where({ id: target_id })
        .increment("followers_count", 1);

      isActive = true;
    }

    // Get updated follower count
    const countResult = await db(tableName)
      .where({ [targetColumn]: target_id })
      .count({ count: "*" })
      .first();

    return res.status(200).json({
      error: false,
      followed: isActive,
      followId: actionId,
      followerCount: parseInt(countResult.count, 10),
      message: isActive ? "Followed" : "Unfollowed",
    });
  } catch (error) {
    console.error("Follow toggle error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
};
