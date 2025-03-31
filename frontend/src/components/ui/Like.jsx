import React, { useState, useEffect } from "react";
import axios from "axios";
import { LuHeart } from "react-icons/lu";
import { useSelector } from "react-redux";
import toastPresets from "../../utils/toastify";

const Like = ({ blogId, initialLikes = 0, initialLiked = false, className = "", isLogedin }) => {
  const { userData } = useSelector((state) => state.auth);
  
  // Use state with useEffect to properly handle prop changes
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  
  // Update state when props change
  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikes);
  }, [initialLiked, initialLikes]);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLogedin) {
      toastPresets.warning("Login to like");
      return;
    }

    try {
      // Optimistic UI update
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
      
      const response = await axios.post(
        `${API_URL}/posts/like`,
        {
          user_id: userData.user.id,
          blog_id: blogId,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      if ([200, 201].includes(response.status)) {
        // Update with actual server response
        setLiked(response.data.liked);
        setLikesCount(response.data.likeCount);
      }
    } catch (error) {
      // Revert optimistic update if request fails
      setLiked(initialLiked);
      setLikesCount(initialLikes);
      
      console.error(
        "Like toggle error:",
        error.response?.data || error.message
      );
      toastPresets.error(
        error.response?.data?.message || "Failed to toggle like"
      );
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      className={` ${className} ${
        liked ? "text-red-500" : "text-gray-500"
      } hover:text-red-500 transition-colors duration-300`}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      <LuHeart className={liked ? "fill-current" : ""} />
      <span className="ml-1">{likesCount}</span>
    </button>
  );
};

export default Like;