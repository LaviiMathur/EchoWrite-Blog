import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ConfirmationModal, Loading } from "../index.components";
import toastPresets from "../../utils/toastify";
import axios from "axios";
import { MdDeleteForever } from "react-icons/md";

function Comments({ comments, blog_id }) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { status, userData } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentList, setCommentList] = useState([...(comments || "")]);
  const [selectedComment, setSelectedComment] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/add-comment`,
        {
          content: newComment,
          user_id: userData.user.id,
          blog_id: blog_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      setCommentList([response.data.comment, ...commentList]);
      toastPresets.success("Comment added!");
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toastPresets.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId, blogId) => {
    try {
      setLoading(true);

      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/delete-comment`,
        {
          data: { comment_id: commentId, blog_id: blogId },
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      setCommentList(commentList.filter((c) => c.id !== commentId));
      toastPresets.success("Comment deleted!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toastPresets.error("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8 w-full" id="comments">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({commentList?.length || 0})
      </h2>
      {status && (
        <div className="mb-8 border-b pb-6">
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="flex flex-col"
          >
            <div className="flex items-start mb-3">
              {userData.user.avatar && (
                <img
                  src={userData.user.avatar}
                  alt={userData.user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <textarea
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6855E0]"
                placeholder="Add a comment..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="self-end bg-[#7260ea] hover:bg-[#6855E0] cursor-pointer text-white font-medium shadow-lg py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>
      )}
      {/* Comments list */}
      {commentList?.length > 0 ? (
        <div className="space-y-6">
          {commentList.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start">
                <img
                  src={comment.avatar}
                  alt={comment.name}
                  className="w-10 h-10 rounded-full mr-3"
                />

                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="font-bold text-gray-800">{comment.name}</p>
                    <p className="text-gray-400 text-xs ">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  <p className="text-gray-500">{comment.content}</p>
                  {comment?.user_id === userData?.user.id && (
                    <button
                      onClick={() => {
                        setSelectedComment(comment.id);
                        setIsModalOpen(true);
                      }}
                      className="text-[#8573E6] mt-2 flex items-center hover:text-[#6855E0] transition-colors"
                      aria-label="Delete comment"
                    >
                      <MdDeleteForever className="text-2xl mr-1" />
                      <span className="text-sm">Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Confirmation Modal */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}{" "}
      {isModalOpen && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={() => handleDelete(selectedComment, blog_id)}
          message="Do you really want to delete this comment?"
        />
      )}
    </div>
  );
}

export default Comments;
