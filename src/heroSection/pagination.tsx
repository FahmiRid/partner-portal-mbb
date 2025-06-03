import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  className = ""
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`d-flex justify-content-center ${className}`}>
      <nav aria-label="Page navigation">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={onPrevPage} aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(number)}>
                {number}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={onNextPage} aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}