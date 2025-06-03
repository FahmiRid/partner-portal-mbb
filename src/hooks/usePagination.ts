import { useState, useMemo } from 'react';

interface UsePaginationProps {
  data: any[];
  recordsPerPage: number;
}

interface UsePaginationReturn {
  currentPage: number;
  currentRecords: any[];
  totalPages: number;
  indexOfFirstRecord: number;
  indexOfLastRecord: number;
  paginate: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetToFirstPage: () => void;
}

export function usePagination({ 
  data, 
  recordsPerPage 
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(data.length / recordsPerPage);

    return {
      indexOfLastRecord,
      indexOfFirstRecord,
      currentRecords,
      totalPages
    };
  }, [data, currentPage, recordsPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetToFirstPage = () => setCurrentPage(1);

  return {
    currentPage,
    currentRecords: paginationData.currentRecords,
    totalPages: paginationData.totalPages,
    indexOfFirstRecord: paginationData.indexOfFirstRecord,
    indexOfLastRecord: paginationData.indexOfLastRecord,
    paginate,
    nextPage,
    prevPage,
    resetToFirstPage
  };
}