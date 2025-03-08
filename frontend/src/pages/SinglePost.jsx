import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import parse from "html-react-parser";
import axios from "axios";
import {
  Header,
  Like,
  Comments,
  Bookmark,
  Loading,
  Share,
} from "../components/index.components";
import { useSelector } from "react-redux";

import { LuMessageSquare } from "react-icons/lu";


function SinglePost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { status, userData } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);

  useEffect(() => {


    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/posts/${slug}`,
          {
            params: {
              user_id: userData?.user.id,
            },
          }
        );
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Post can't be fetched");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, post]);

  return loading ? (
    <Loading />
  ) : error ? (
    <Error errorMessage={error} profile={false} />
  ) : (
    <div className="bg-[#F0F0FA] min-h-screen ">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow montserrat  flex-col container mx-auto px-4 py-8 md:w-3/4 lg:w-4/5 post">
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          {/* Featured Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-72 object-cover"
            />
          )}

          <div className="p-8">
            {/* Post Title */}
            <h1 className="md:text-6xl text-2xl capitalize  font-bold mb-3">
              {post.title}
            </h1>

            {/* Author & Meta Info */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <Link to={`/profile/${post?.username}`}>
                <div className="flex items-center space-x-3">
                  <img
                    src={post?.avatar}
                    alt={post.name}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://cloud.appwrite.io/v1/storage/buckets/67c5d88a001fafdc813d/files/67c72085000fee052488/view?project=67c5d4a400153ab3eeef&mode=admin";
                    }}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div>
                    <h2 className="md:text-2xl text-lg">{post.name}</h2>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
              {/* Action buttons */}
              <div className="flex gap-4 relative">
                <Like
                  blogId={post.id}
                  initialLikes={post.likeCount}
                  initialLiked={post.userLiked}
                  isLogedin={status}
                  className="flex items-center"
                />
                <a
                  href="#comments"
                  className="md:flex hidden  items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LuMessageSquare />
                  <span>{post.commentCount}</span>
                </a>

                <Bookmark
                  blogId={post.id}
                  initialSaved={post.userSaved}
                  isLogedin={status}
                   className="flex items-center "
                />

                <Share postTitle={post.title} postUrl={`/posts/${post.slug}`} className="flex items-center"/>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-lg/loose leading-7 text-gray-800">
              {parse(post.content || "")}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div
          id="comments"
          className="bg-white rounded-lg shadow-md p-8 mt-8 w-full"
        >
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          {post.commentCount > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-gray-500 text-sm">
                    — {comment.user_name} |{" "}
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePost;
