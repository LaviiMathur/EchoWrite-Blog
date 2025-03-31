import React, { useState } from "react";
import { RxHamburgerMenu, RxCross1 } from "react-icons/rx";

import { TbLogout } from "react-icons/tb";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

function MobileNav() {
  const { status, userData } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logout());
    navigate("/");
  };

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "Saved",
      slug: `/profile/${userData?.user?.username}`,
      active: status,
    },
  
    {
      name: "About",
      slug: "/about",
      active: true,
    },
    {
      name: "New Posts",
      slug: "/create-post",
      active: status,
    },
    {
      name: "My Profile",
      slug: `/profile/${userData?.user.username}`,
      active: status,
    },
    {
      name: "My Posts",
      slug:`/profile/${userData?.user.username}/posts`,
      active: status,
    },

    {
      name: "Log In",
      slug: "/auth/login",
      active: !status,
      color: "#6855E0",
    },
    {
      name: "Sign Up",
      slug: "/auth/signup",
      active: !status,
      color: "#6855E0",
    },
    {
      name: "Log Out",
      slug: "#",
      active: status,
      color: "red",
      action: handleLogout,
      children: <TbLogout className="inline  text-xl" />,
    },
  ];

  const handleClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="max-h-screen">
      <header className="bg-[#fae88e] py-3 relative md:hidden w-full px-8 flex justify-between items-center z-40">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/penLogo.png" alt="Logo" className="h-10" />
            <span className="ml-2 text-xl mistrully">EchoWrite</span>
          </Link>
        </div>
        <button
          className="text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <RxCross1 /> : <RxHamburgerMenu />}
        </button>
      </header>

      <div
        className={`fixed top-0 w-full h-full bg-white z-30 pt-20 transition-transform duration-400 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-8 absolute w-full">
          <ul className="flex flex-col space-y-4">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name} className="py-2 border-b border-gray-200">
                  {item.action ? (
                    // Handle buttons (logout)
                    <button
                      className="text-lg font-medium text-left cursor-pointer"
                      style={item.color ? { color: item.color } : {}}
                      onClick={() => handleClick(item)}
                    >
                      {item.name} {item.children ? item.children : ""}
                    </button>
                  ) : (
                    // Handle links
                    <Link
                      to={item.slug}
                      className="text-lg font-medium text-left"
                      style={item.color ? { color: item.color } : {}}
                      onClick={() => handleClick(item)}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ) : null
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
