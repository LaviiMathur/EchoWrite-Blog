import React, { useState, useEffect } from "react";
import axios from "axios";
import { LuBookmark } from "react-icons/lu";
import { useSelector } from "react-redux";
import toastPresets from "../../utils/toastify";

const Bookmark = ({
  blogId,

  initialSaved = false,
  className = "",
  isLogedin,
}) => {
  const { userData } = useSelector((state) => state.auth);

  const [saved, setSaved] = useState(initialSaved);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLogedin) {
      toastPresets.warning("Login to add bookmark");
      return;
    }

    try {
      setSaved(!saved);

      const response = await axios.post(
        `${API_URL}/posts/toggleBookmark`,
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
        setSaved(response.data.bookmarked);
      }
    } catch (error) {
      // Revert optimistic update if request fails
      setSaved(initialSaved);

      console.error(
        "Bookmark toggle error:",
        error.response?.data || error.message
      );
      toastPresets.error(
        error.response?.data?.message || "Failed to toggle bookmark"
      );
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={` ${className} ${
        saved ? "text-indigo-600" : "text-gray-500"
      } hover:text-indigo-600 transition-colors duration-300`}
      aria-label={saved ? "Remove bookmark" : "Add bookmark"}
    >
      <LuBookmark className={saved ? "fill-current" : ""} />
    </button>
  );
};

export default Bookmark;
