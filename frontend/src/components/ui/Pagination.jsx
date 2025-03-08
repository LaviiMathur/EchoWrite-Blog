import React from "react";
import { GrPrevious,GrNext } from "react-icons/gr";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pageNumbers = [];
   

    // Always show first and last page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start and end pages if we're near the beginning or end
    if (endPage - startPage + 1 < 5) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-4 ">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className=" mr-5 
          disabled:opacity-50 disabled:cursor-not-allowed md:cursor-pointer
          hover:bg-gray-100 transition-colors"
      >
       <GrPrevious />
      </button>

      {/* Page Numbers */}
      {generatePageNumbers().map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-4 py-2 rounded-full cursor-pointer
            ${
              currentPage === pageNumber
                ? "bg-[#cdcdef]"
                : "hover:bg-[#cdcdef]/50 "
            } transition-colors`}
        >
          {pageNumber}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className=" ml-5 
          disabled:opacity-50 disabled:cursor-not-allowed md:cursor-pointer
          hover:bg-gray-100 transition-colors"
      >
       <GrNext />
      </button>
    </div>
  );
};

export default Pagination;
