import db from "../conf/database.js";

// slug
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

//count like,save,comments
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

export {
    generateSlug, getBookmarkCounts,getCommentCounts,getLikeCounts,toggleUserAction
}