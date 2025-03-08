import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
  Error,
  Header,
  Loading,
  Pagination,
  PostCard,
} from "../components/index.components";



function UserPosts() {
  const { username } = useParams();

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    const fetchProfile = async (page = 1) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profile/${username}`,
          {
            params: {
              page: page,
              limit: 5,
              username: username,
            },
          }
        );

        setPosts(response.data.blogs);

        setEmpty(response.data.blogs.length === 0);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching profile:", error);
     
        setError("No Posts are available");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return loading ? (
    <Loading />
  ) : empty ? (
    <Error errorMessage={error} profile={true}/>
  ) : (
    <div className="bg-gray-100 shadow-xl min-h-screen">
      <Header />
      <div className="md:w-3/4 w-full bg-gray-100 shadow-xl flex-grow md:py-10 mx-auto ">
        <div className=" w-full flex flex-col gap-5 py-2 px-4">
          {loading ? (
            <Loading />
          ) : empty ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <LuFileX className="w-16 h-16 pb-4" strokeWidth={1.5} />
                <p className="text-lg font-semibold">No posts found</p>
                <p className="text-sm">
                  Looks like there's nothing here yet. Start exploring or create
                  your first post!
                </p>
              </div>
            </div>
          ) : (
            posts.map((post) => {
              return <PostCard data={post} key={post.id} />;
            })
          )}
          {!empty && (
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
export default UserPosts;
