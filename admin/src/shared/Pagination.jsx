import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Generate page numbers
  const pages = [];
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1) {
    endPage = Math.min(totalPages, 3);
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#0F172A]/70 backdrop-blur-sm">
      <div className="text-xs text-slate-400 font-medium">
        Showing <span className="font-bold text-white">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-bold text-white">{Math.min(totalItems, currentPage * itemsPerPage)}</span> of <span className="font-bold text-white">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <MdChevronLeft size={20} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-slate-500 text-xs">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
              currentPage === p
                ? "bg-[#D4AF37] text-slate-950 font-black shadow-md shadow-[#D4AF37]/25"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-slate-500 text-xs">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
