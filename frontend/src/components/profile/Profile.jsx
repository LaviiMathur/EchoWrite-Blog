import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LuUser,
  LuUsers,
  LuBookOpen,
  LuUserPlus,
  LuMapPin,
  LuLink,
  LuUserMinus,
} from "react-icons/lu";
import { LiaUserEditSolid } from "react-icons/lia";
import {
  Error,
  Header,
  Loading,
  Pagination,
  PostCard,
} from "../index.components";
import toastPresets from "../../utils/toastify";
import { useSelector } from "react-redux";

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);

  const { status, userData } = useSelector((state) => state.auth);
  //redirect if not loged in
  // useEffect(() => {
  //   if (!status) {
  //     toastPresets.info("Not Authorized");
  //     navigate("/");
  //   }
  // }, [navigate, status]);

  const isOwner = username === userData?.user.username;

  //fetch users posts

  const fetchProfile = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profile/${username}`,
          {
            params: {
              page,
              limit: 5,
              ...(status && { user_id: userData.user.id }),
            },
          }
        );

        setProfile((prev) => ({
          ...response.data,
          ...(isOwner && { token: userData?.token }),
        }));

        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Profile not available");
      } finally {
        setLoading(false);
      }
    },
    [username, status, userData?.user?.id, isOwner]
  );

  useEffect(() => {
    fetchProfile(currentPage);
  }, [fetchProfile, currentPage]);

  useEffect(() => {
    if (profile.isFollowed === true) {
      setFollowed(profile.isFollowed);
    }
  }, [profile]);

  const toggleFollow = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/profile/follow`,
        {
          user_id: userData.user.id,
          target_id: profile.id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      fetchProfile();
      toastPresets.success(
        followed ? `Unfollowed ${profile.name}` : `Followed ${profile.name}`
      );
      setFollowed((prev) => !prev);
    } catch (error) {
      console.error("Toggle follow error:", error);
      toastPresets.error("Toggle follow failed");
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return loading ? (
    <Loading />
  ) : error ? (
    <Error errorMessage={error} profile={true} />
  ) : (
    <div className="bg-gray-100 shadow-xl min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className=" rounded-xl shadow-lg overflow-hidden">
          {/* Profile Content */}
          <div className="   bg-amber-200/80 z-10 md:p-6 p-2 flex justify-between items-center">
            {/* Avatar */}
            <div className="md:w-32 w-20 aspect-square rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img
                src={profile.avatar || "/api/placeholder/128/128"}
                alt={profile.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* User Info */}
            <div className="md:flex-grow pl-4 w-4/6">
              <div className="flex items-center  space-x-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                {isOwner ? (
                  <Link
                    to={`/profile/${username}/update-profile`}
                    state={{ profile }}
                    className="border border-gray-50 bg-[#8573E6] shadow-md p-2 rounded-lg flex items-center justify-center hover:bg-[#6855E0] transition-colors"
                  >
                    <LiaUserEditSolid className="text-2xl text-gray-50" />
                  </Link>
                ) : status ? ( // Moved status check into the ternary condition
                  <button
                    onClick={toggleFollow}
                    className="border border-gray-50 bg-[#8573E6] shadow-md p-2 rounded-lg flex items-center justify-center hover:bg-[#6855E0] transition-colors"
                  >
                    {followed ? (
                      <span className="flex gap-2">
                        <LuUserMinus className="text-2xl text-gray-50" />
                        <p className="text-lg text-gray-50 font-mono font-bold">
                          Unfollow
                        </p>
                      </span>
                    ) : (
                      <span className="flex gap-2">
                        <LuUserPlus className="text-2xl text-gray-50" />
                        <p className="text-lg text-gray-50 font-mono font-bold">
                          Follow
                        </p>
                      </span>
                    )}
                  </button>
                ) : null}{" "}
                {/* If status is false, render nothing */}
              </div>
              <p className="text-gray-600 text-lg">@{profile.username}</p>

              {/* Stats */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-4">
                <div className="flex flex-row items-center gap-2">
                  <LuBookOpen className="w-5 h-5 text-gray-500" />
                  <span className="text-sm md:text-base">
                    {profile.totalBlogs} Posts
                  </span>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <LuUsers className="w-5 h-5 text-gray-500" />
                  <span className="text-sm md:text-base">
                    {profile.followers_count} Followers
                  </span>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <LuUser className="w-5 h-5 text-gray-500" />
                  <span className="text-sm md:text-base">
                    {profile.following_count} Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Bio */}
          <div className="p-6 bg-gray-100">
            {/* Bio Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                About Me
              </h2>
              <p className="text-gray-600">
                {profile.bio || "No bio available"}
              </p>
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-4">
              {profile.location && (
                <div className="flex items-center space-x-3">
                  <LuMapPin className="w-5 h-5 text-gray-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center space-x-3">
                  <LuLink className="w-5 h-5 text-gray-500" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto  py-8 max-w-4xl">
        {loading ? (
          <Loading />
        ) : profile?.blogs?.length > 0 ? (
          <div className=" flex flex-col gap-5 ">
            {profile.blogs.map((blog) => (
              <PostCard data={blog} key={blog.id} />
            ))}{" "}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
export default Profile;
