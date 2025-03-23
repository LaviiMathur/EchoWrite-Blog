import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Header, PostForm,Loading } from "../components/index.components";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditPost() {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(null);
  const { status, userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { slug } = useParams();

  // Redirect if not logged in
  useEffect(() => {
    if (!status) {
      navigate("/");
    }
  }, [status, navigate]);

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      if (!userData) return; // Prevent API call if userData is null

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/posts/${slug}`,
          {
            params: {
              user_id: userData?.user?.id, // Ensure safe access
            },
          }
        );
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to fetch post!");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, userData]);



  return loading ? (
    <Loading />
  ) : (
    <>
      <Header />
      <div className="min-h-full md:w-5/6 mx-auto md:py-8">
        <div className="px-4 sm:px-6 bg-gray-100 shadow-lg rounded-lg">
          <h2 className="text-2xl py-5 font-bold text-center border-b text-gray-800">
            Edit Post
          </h2>
          <div className="p-6">
            {post && <PostForm post={post} loading={loading} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default EditPost;
