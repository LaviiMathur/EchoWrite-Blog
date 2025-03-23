import { useState } from "react";
import { MdOutlineEditNote, MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Loading } from "../index.components";
import { useSelector } from "react-redux";
import axios from "axios";
import toastPresets from "../../utils/toastify";
import {ConfirmationModal} from "../index.components";

const PostActions = ({ postId, slug }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit-post/${slug}`);
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      const token = userData.token;
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      await axios.delete(`${API_URL}/posts/delete-post`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { postId, user_id: userData.user.id },
      });

      navigate("/");
      toastPresets.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toastPresets.error("Post deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="absolute top-0 right-0 p-8 flex gap-3 text-2xl">
      <MdOutlineEditNote
        className="cursor-pointer hover:text-blue-500"
        onClick={handleEdit}
      />
      <MdDeleteOutline
        className="cursor-pointer hover:text-red-300"
        onClick={() => setIsModalOpen(true)}
      />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => deletePost(postId)}
        message="Are you sure you want to delete this post?"
      />
    </div>
  );
};

export default PostActions;
