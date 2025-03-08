import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../index.components";
import { logout } from "../../store/authSlice";
import { TbLogout } from "react-icons/tb";

function DesktopNav() {
  const { status, userData } = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const defaultImage =
    "https://cloud.appwrite.io/v1/storage/buckets/67c5d88a001fafdc813d/files/67c72085000fee052488/view?project=67c5d4a400153ab3eeef&mode=admin";

  const getProfileImage = () => {
    try {
      if (!userData.user?.avatar) {
        return defaultImage;
      }
      return userData.user.avatar;
    } catch (error) {
      console.error("Error processing profile image:", error);
      return defaultImage;
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    dispatch(logout());
    window.location.reload();
    navigate("/");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultImage;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleProfileClick = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Saved", slug: `/profile/${userData?.user.username}/saved`, active: status },
   
    { name: "New Posts", slug: "/create-post", active: status },
    { name: "About", slug: "/about", active: true },
  ];

  return (
    <header className="bg-[#fae88e]  py-3 hidden w-full px-8 md:flex justify-between items-center transition-colors duration-200">
      {/* Left side: Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/penLogo.png" alt="Logo" className="h-10" />
          <span className="ml-2 text-xl mistrully text-black">EchoWrite</span>
        </Link>
      </div>

      {/* Right side: Navigation Items and Auth Buttons */}
      <nav className="flex items-center">
        <ul className="flex space-x-6 items-center">
          {/* Regular nav items as links */}
          {navItems.map((item) =>
            item.active ? (
              <li key={item.name}>
                <Link to={item.slug} className="text-black  hover:border-b-2">
                  {item.name}
                </Link>
              </li>
            ) : null
          )}

          {/* Profile picture and dropdown when logged in */}
          {status && (
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center cursor-pointer overflow-hidden none border-2 rounded-full transition-all duration-200 border-transparent hover:border-[#6855E0] hover:scale-110"
              >
                <div className="h-10 w-10  rounded-full overflow-hidden">
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="h-10  object-cover rounded-full"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white  rounded-md shadow-lg overflow-hidden z-20 ">
                  <div className="p-4 border-b border-gray-200 cursor-pointer">
                    <p className="text-base font-semibold text-gray-900">
                      {userData?.user.name || "User"}
                    </p>
                    <p
                      className="text-xs
                     font-medium text-gray-500"
                    >
                      @{userData?.user.username || "User"}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={`/profile/${userData.user.username}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100  transition-colors duration-200"
                      onClick={handleProfileClick}
                    >
                      My Profile
                    </Link>
                    <Link
                          to={`/profile/${userData.user.username}/posts`}
                      className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleProfileClick}
                    >
                      My Posts
                    </Link>

                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <TbLogout className="inline text-xl" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </li>
          )}

          {/* Auth buttons when not logged in */}
          {!status && (
            <>
              <li>
                <Button
                  onClick={() => navigate("/auth/login")}
                  className="px-4 py-2 ml-2 border border-[#6855E0] box-border hover:shadow-md shadow-[#6855E0] transition-all duration-200 ease-in-out "
                  bgColor="white"
                  textColor="#6855E0"
                  width="100px"
                >
                  Login
                </Button>
              </li>
              <li>
                <Button
                  onClick={() => navigate("/auth/signup")}
                  className="px-4 py-2 ml-2 box-border hover:shadow-md shadow-[black] transition-all duration-200 ease-in-out"
                  bgColor="#6855E0"
                  textColor="white"
                  width="100px"
                >
                  Signup
                </Button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default DesktopNav;
