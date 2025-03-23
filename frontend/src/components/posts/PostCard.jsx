import React from "react";
import { LuMessageSquare, LuShare2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";

import { Bookmark, Like, Share } from "../index.components";
import { useSelector } from "react-redux";
function PostCard({ data }) {
  const { status } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  // Truncate content
  const truncatedText =
    data.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 250) + "...";

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      "https://cloud.appwrite.io/v1/storage/buckets/67c5d88a001fafdc813d/files/67c73d76001a136c06f7/view?project=67c5d4a400153ab3eeef&mode=admin";
  };

  return (
    <div
      onClick={() => navigate(`/posts/${data.slug}`)}
      className="border-2  border-gray-200 group bg-white rounded-xl overflow-hidden  flex flex-col md:flex-row shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      {data.image_url && (
        <div className="relative w-full md:w-2/5 overflow-hidden h-64 md:h-auto">
          <img
            className="h-48 w-full md:h-64 object-contain"
            src={data.image_url}
            alt="Blog post cover"
            onError={handleImageError}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col justify-between w-full">
        <div>
          {/* Author Info */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full mr-3 overflow-hidden bg-gray-100">
              <img
                src={data.avatar}
                alt={`${data.name}'s avatar`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{data.name}</p>
              <p className="text-gray-500 text-sm">
                {new Date(data.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-bold text-2xl md:text-3xl capitalize text-gray-900 mb-3 cursor-pointer">
            {data.title}
          </h2>

          {/* Content Preview */}
          <div className="text-gray-600 mb-4 line-clamp-3 pr-40 post">
            {parse(truncatedText)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex  items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-4" onClick={(e) => e.stopPropagation()}>
            <Like
              blogId={data.id}
              initialLikes={data.likeCount}
              initialLiked={data.userLiked}
              isLogedin={status}
               className="flex items-center "
            />
            <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
              <LuMessageSquare />
              <span>{data.commentCount}</span>
            </div>
          </div>

          <div className="flex space-x-3 relative">
            <Bookmark
              blogId={data.id}
             className="flex items-center "
              initialSaved={data.userSaved}
              isLogedin={status}
            />
            <Share postUrl={`/posts/${data.slug}`} postTitle={data.title}  className="-bottom-6 right-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
