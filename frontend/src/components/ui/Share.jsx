import React, { useState, useRef, useEffect } from "react";
import { LuShare2 } from "react-icons/lu";
import { FaWhatsapp, FaTwitter, FaEnvelope, FaLink } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

function Share({ postUrl, postTitle, className = "" }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null); // Ref for the popup
  const fullUrl = window.location.origin + postUrl;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: postTitle,
        url: fullUrl,
      });
    } else {
      setShowPopup(!showPopup); // Toggle popup
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    alert("Link copied to clipboard!");
    setShowPopup(false);
  };

  return (
    <div className=" flex">
      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        className={`text-gray-500 cursor-pointer hover:text-gray-700 transition-colors ${className}`}
      >
        <LuShare2 />
      </button>

      {/* Share Popup */}
      {showPopup && (
        <div
          ref={popupRef} // Assign ref here
          className="absolute right-0 bottom-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-2"
        >
          <div className="flex flex-col space-y-2">
            {/* Copy URL */}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <FaLink className="text-blue-500" />
              <span>Copy URL</span>
            </button>

            {/* Share on WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                fullUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <FaWhatsapp className="text-green-500" />
              <span>WhatsApp</span>
            </a>

            {/* Share on Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                fullUrl
              )}&text=${encodeURIComponent(postTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <FaTwitter className="text-blue-400" />
              <span>Twitter</span>
            </a>

            {/* Share via Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(
                postTitle
              )}&body=${encodeURIComponent(fullUrl)}`}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <FaEnvelope className="text-red-500" />
              <span>Email</span>
            </a>
          </div>

          <div className="border-t pt-2 border-t-gray-300 flex justify-between ">
            <span className="text-gray-700 font-medium">Share this post </span>
            <button
              onClick={(e) => {
                setShowPopup(false);
                e.stopPropagation();
              }}
              className=" text-gray-500 hover:text-gray-700"
            >
              <RxCross1 />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Share;
