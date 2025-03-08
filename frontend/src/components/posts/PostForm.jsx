import React, { useState, useEffect } from "react";
import { Button, Input, Loading, ImageUpload } from "../index.components";
import RTE from "./RTE";
import { useForm } from "react-hook-form";

import toastPresets from "../../utils/toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function PostForm({ post: existingPost }) {
  const navigate = useNavigate();
  const { status, userData } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: existingPost?.title || "",
      content: existingPost?.content || "",
      isPublic: existingPost?.isPublic ? "Public" : "Private" || "Public",
      image_url: existingPost?.image_url || "",
      user_id: userData?.id
    }
  });

  // Watch for form values
  const content = watch("content");

  useEffect(() => {
    if (!status) {
      toastPresets.info("Not Authorized");
      navigate("/");
    }
  }, [status, navigate]);

  // Handle content change from RTE
  const handleContent = (content) => {
    setValue("content", content);
  };

  // Handle image upload from ImageUpload component
  const handleImageUpload = (data) => {
    // Based on your ImageUpload component, it returns an object with avatar property
    setValue("image_url", data.avatar);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setValue("image_url", "");
  };

  const onSubmit = async (data) => {
    if (data.content.trim() === "") {
      return toastPresets.error("Content can't be empty.");
    }

    if (data.title.trim() === "") {
      return toastPresets.error("Title can't be empty.");
    }

    try {
      setLoading(true);
      const token = userData.token;
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      
      // Convert isPublic from select value to boolean
      const formData = {
        ...data,
        isPublic: data.isPublic === "Public",
        // Ensure image_url is empty string if not provided
        image_url: data.image_url || ""
      };

      await axios.post(`${API_URL}/posts/create-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
      toastPresets.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      return toastPresets.error("Post creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      {/* Image Upload */}
      <ImageUpload
        initialImageUrl={watch("image_url") || ""}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
        label="Feature Image"
        isProfile={false}
      />

      {/* Title Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-lg font-medium">
          Title
        </label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Enter post title"
          className="border-2 border-[#6855E0] rounded-2xl"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      {/* Rich Text Editor */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium">Content</label>
        <RTE value={content} onChange={handleContent} />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        {/* Post Status */}
        <div className="flex flex-col max-w-fit max-h-fit">
          <label className="text-lg font-medium">Status</label>
          <select
            {...register("isPublic")}
            className="px-4 py-2 border-2 border-[#6855E0] rounded-lg focus:outline-0 focus:ring-2 focus:ring-[#6855E0]"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          textColor="white"
          type="submit"
          bgColor="#6855E0"
          className="h-[50px]"
          width="200px"
        >
          {existingPost ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}

export default PostForm;