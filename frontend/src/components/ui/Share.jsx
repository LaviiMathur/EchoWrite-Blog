import React, { useState, useRef, useEffect } from "react";
import { LuShare2 } from "react-icons/lu";
import { FaWhatsapp, FaEnvelope, FaLink, FaTwitter } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

function Share({ postUrl, postTitle, className = "" }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
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

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          url: fullUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowPopup(!showPopup);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl);
    alert("Link copied to clipboard!");
    setShowPopup(false);
  };

  return (
    <div className="relative flex">
      {/* Share Button */}
      <button
        onClick={(e) => handleShare(e)}
        className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors flex items-center"
      >
        <LuShare2 />
      </button>

      {/* Share Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className={`absolute w-48 bg-white border border-gray-200 shadow-lg rounded-lg px-2 pb-2 z-50 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-2">
            {/* Copy URL */}
            <button
              onClick={(e) => handleCopy(e)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <FaLink className="text-blue-500" />
              <span>Copy URL</span>
            </button>

            {/* Share on WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(fullUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <FaWhatsapp className="text-green-500" />
              <span>WhatsApp</span>
            </a>

            {/* Share on Twitter(X) */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(postTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <FaTwitter className="text-blue-500" />
              <span>Twitter (X)</span>
            </a>

            {/* Share via Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(fullUrl)}`}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <FaEnvelope className="text-red-500" />
              <span>Email</span>
            </a>
          </div>

          <div className="border-t pt-2 border-t-gray-300 flex justify-between">
            <span className="text-gray-700 font-medium">Share this post</span>
            <button
              onClick={(e) => {
                setShowPopup(false);
                e.stopPropagation();
              }}
              className="text-gray-500 hover:text-gray-700"
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
