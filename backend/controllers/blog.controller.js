import db from "../conf/database.js";
import slugify from "slugify";

const generateSlug = async (title) => {
  let slug = slugify(title, { lower: true, strict: true });

  const baseSlug = slug;

  const count = await db("blog")
    .where("slug", "like", `${baseSlug}%`)
    .count("id as count")
    .first();

  if (count.count > 0) {
    slug = `${baseSlug}-${count.count + 1}`;
  }

  return slug;
};

// Create Post
export const createPost = async (req, res) => {
  try {
    const { title, content, is_public, image_url } = req.body;
    const user_id = req.user.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const slug = await generateSlug(title);
    const [postId] = await db("blog")
      .insert({
        title,
        content,
        slug,
        is_public: is_public ?? true,
        user_id,
        image_url,
      })
      .returning("id");

    res.status(201).json({ id: postId, message: "Post created successfully" });
  } catch (error) {
    console.error("Blog creation error: ", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const user_id = req.user.id;
    const { title, content, is_public, image_url } = req.body;

    const blog = await db("blog").where({ slug }).first();
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.user_id !== user_id)
      return res.status(403).json({ message: "Unauthorized" });

    const newSlug =
      title !== blog.title ? await generateSlug(title) : blog.slug;
    await db("blog").where({ slug }).update({
      title,
      slug: newSlug,
      content,
      is_public,
      image_url,
    });

    res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error("Update error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const { postId, user_id } = req.body;
    // console.log("postid:", postId, "userid", user_id);

    if (!postId || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the blog exists
    const blog = await db("blog").where({ id: postId }).first();
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Check ownership
    if (blog.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the owner of this post" });
    }

    // Delete the blog post
    await db("blog").where({ id: postId }).del();

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Blog deletion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions for counts
const getCounts = async (tableName, blogIds) => {
  if (!blogIds || !blogIds.length) return {};

  const countField =
    tableName === "likes" || tableName === "comments" ? "id" : "*";

  const counts = await db(tableName)
    .whereIn("blog_id", blogIds)
    .select("blog_id")
    .count(`${countField} as count`)
    .groupBy("blog_id");

  return counts.reduce((acc, item) => {
    acc[item.blog_id] = parseInt(item.count);
    return acc;
  }, {});
};

// Consolidated count functions
const getLikeCounts = (blogIds) => getCounts("likes", blogIds);
const getCommentCounts = (blogIds) => getCounts("comments", blogIds);
const getBookmarkCounts = (blogIds) => getCounts("bookmarks", blogIds);

// Toggle functions
const toggleUserAction = async (tableName, blog_id, user_id) => {
  // Check if record exists
  const existing = await db(tableName).where({ blog_id, user_id }).first();

  let isActive, actionId;
  if (existing) {
    // If exists, delete it
    await db(tableName).where({ blog_id, user_id }).delete();
    isActive = false;
  } else {
    // If doesn't exist, insert it
    const result = await db(tableName)
      .insert({ blog_id, user_id })
      .returning("id");
    actionId = result[0];
    isActive = true;
  }

  // Get updated count
  const countField =
    tableName === "likes" || tableName === "comments" ? "id" : "*";
  const countResult = await db(tableName)
    .where({ blog_id })
    .count(`${countField} as count`)
    .first();

  return {
    isActive,
    actionId,
    count: parseInt(countResult.count),
  };
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const { blog_id, user_id } = req.body;

    if (!blog_id || !user_id) {
      return res.status(400).json({
        error: true,
        message: "Blog ID and User ID are required",
      });
    }

    const { isActive, actionId, count } = await toggleUserAction(
      "likes",
      blog_id,
      user_id
    );

    return res.status(200).json({
      error: false,
      liked: isActive,
      likeId: actionId,
      likeCount: count,
      message: isActive ? "Post liked" : "Like removed",
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
};

// Toggle Bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const { blog_id, user_id } = req.body;

    if (!blog_id || !user_id) {
      return res.status(400).json({
        error: true,
        message: "Blog ID and User ID are required",
      });
    }

    const { isActive, count } = await toggleUserAction(
      "bookmarks",
      blog_id,
      user_id
    );

    return res.status(200).json({
      error: false,
      bookmarked: isActive,
      bookmarkCount: count,
      message: isActive ? "Bookmark added" : "Bookmark removed",
    });
  } catch (error) {
    console.error("Bookmark toggle error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
};

// Add comments
export const addComments = async (req, res) => {
  try {
    const { blog_id, content, user_id } = req.body;

    if (!blog_id || !content || !user_id) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    const [newComment] = await db("comments")
      .insert({ content, blog_id, user_id })
      .returning("*");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteComments = async (req, res) => {
  try {
    const { comment_id, blog_id } = req.body;
    const user_id = req.user.id; 

    if (!comment_id || !blog_id) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }
    
  
    const commentExists = await db("comments")
      .where({ 
        id: comment_id, 
        blog_id,
        user_id
      })
      .first();

    if (!commentExists) {
      return res.status(404).json({
        error: true,
        message: "Comment not found or you don't have permission to delete it",
      });
    }

    await db("comments").where({ id: comment_id }).del();
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
};

// Get Single Post
export const getPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const user_id = req.query.user_id ? String(req.query.user_id) : undefined;

    // Fetch blog post with author information
    const blog = await db("blog")
      .leftJoin("users", "blog.user_id", "users.id")
      .select("blog.*", "users.username", "users.name", "users.avatar")
      .where({ "blog.slug": slug })
      .first();

    if (!blog) return res.status(404).json({ message: "Post not found" });

    // Fetch counts and user interactions in parallel
    const [likeCounts, commentData, bookmarkCounts, userInteractions] =
      await Promise.all([
        // Get like count
        db("likes").where("blog_id", blog.id).count("id as count").first(),

        // Get comments with user details
        db("comments")
          .join("users", "comments.user_id", "users.id")
          .where("comments.blog_id", blog.id)
          .select(
            "comments.id",
            "comments.user_id",
            "comments.content",
            "comments.blog_id",
            db.raw(
              "comments.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_at"
            ),
            "users.name",
            "users.avatar"
          )
          .orderBy("comments.created_at", "desc"),

        // Get bookmark count
        db("bookmarks").where("blog_id", blog.id).count("* as count").first(),

        // If user_id provided, check if user has liked/bookmarked
        user_id
          ? Promise.all([
              db("likes").where({ blog_id: blog.id, user_id }).first(),
              db("bookmarks").where({ blog_id: blog.id, user_id }).first(),
            ])
          : [null, null],
      ]);

    // Combine all data
    res.status(200).json({
      ...blog,
      likeCount: parseInt(likeCounts.count),
      commentCount: commentData.length,
      savedCount: parseInt(bookmarkCounts.count),
      comments: commentData,
      userLiked: !!userInteractions[0],
      userSaved: !!userInteractions[1],
    });
  } catch (error) {
    console.error("Blog fetch error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Public Posts
export const getPublicPosts = async (req, res) => {
  try {
    const { page = 1, limit = 5, user_id } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const totalItems = await db("blog")
      .where({ is_public: true })
      .count("id as total")
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

    // Fetch blogs
    const blogs = await db("blog")
      .leftJoin("users", "blog.user_id", "users.id")
      .select("blog.*", "users.username", "users.name", "users.avatar")
      .where({ is_public: true })
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

    // Fetch user interactions if user_id is provided
    const userLikes = user_id
      ? await db("likes")
          .whereIn("blog_id", blogIds)
          .where("user_id", user_id)
          .select("blog_id")
      : [];
    const userBookmarks = user_id
      ? await db("bookmarks")
          .whereIn("blog_id", blogIds)
          .where("user_id", user_id)
          .select("blog_id")
      : [];

    const userLikedSet = new Set(userLikes.map((like) => like.blog_id));
    const userBookmarkedSet = new Set(
      userBookmarks.map((bookmark) => bookmark.blog_id)
    );

    // Transform response
    const transformedBlogs = blogs.map((blog) => ({
      ...blog,
      likeCount: likeCounts[blog.id] || 0,
      commentCount: commentCounts[blog.id] || 0,
      savedCount: bookmarkCounts[blog.id] || 0,
      userLiked: userLikedSet.has(blog.id),
      userSaved: userBookmarkedSet.has(blog.id),
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
    console.error("Error fetching public posts:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

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
    const { limit = 10, offset = 0 } = req.query;

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
      .leftJoin("users", "blog.user_id", "users.id") // Join users table
      .where({ "blog.user_id": user.id })
      .orderBy("blog.created_at", "desc")
      .limit(parseInt(limit, 10))
      .offset(parseInt(offset, 10));

    res.status(200).json({
      ...user,
      totalBlogs: blogCount?.total || 0,
      blogs,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
