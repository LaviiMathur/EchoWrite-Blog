import React, { useEffect, useState } from "react";
import {
  Error,
  Header,
  Loading,
  Pagination,
  PostCard,
} from "../components/index.components";
import axios from "axios";
import { useSelector } from "react-redux";

function Home() {
  const { status, userData } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const user_id = status ? userData?.user?.id : "";

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(false);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/posts/all-posts`,
        {
          params: {
            page: page,
            limit: 5,
            user_id: user_id,
          },
        }
      );

      setEmpty(response.data.blogs.length === 0);
      setPosts(response.data.blogs);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("No Posts are available");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return loading ? (
    <Loading />
  ) : empty ? (
    <Error errorMessage={error} profile={false} />
  ) : (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="md:w-3/4 w-full bg-gray-100 shadow-xl flex-grow md:py-10 mx-auto">
        <div className="w-full flex flex-col gap-5 py-2 px-4">
          {posts.map((post) => (
            <PostCard data={post} key={post.id} />
          ))}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
