import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/stockList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGreen, ppBadgeYellow, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';
import { fetchProductsList, updateProductsListOrder } from '../hooks/useProductList';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { fetchProductsWithItems } from './addProduct';
import Pagination from '../heroSection/pagination';
import { usePagination } from '../hooks/usePagination';
import { toast } from 'sonner';

export default function ProductList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const recordsPerPage = 10;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const deleteProductMutation = useDeleteProduct();

  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsList,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  useQuery({
    queryKey: ['productsWithItems'],
    queryFn: fetchProductsWithItems
  });

  const sortedProducts = useMemo(() => {
    if (!sortColumn) return products;
    return products.slice().sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    });
  }, [products, sortColumn, sortOrder]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(product =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedProducts, searchTerm]);

  // Use pagination hook
  const {
    currentPage,
    currentRecords,
    totalPages,
    indexOfFirstRecord,
    indexOfLastRecord,
    paginate,
    nextPage,
    prevPage,
    resetToFirstPage
  } = usePagination({
    data: filteredProducts,
    recordsPerPage
  });

  // Mutation for updating product order
  useMutation({
    mutationFn: updateProductsListOrder,
    onSuccess: (updatedProducts) => {
      queryClient.setQueryData(['products'], updatedProducts);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    resetToFirstPage(); // Reset to first page when searching
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  }

  const handleEditProduct = (productId: number) => {
    navigate(`/edit-product/${productId}`);
  }

  const handleDeleteProduct = (productId: number) => {
    toast.success('Product deleted successfully');
    deleteProductMutation.mutate(productId);
  };

  const handleSort = (column: any) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Error loading products: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className={`container-fluid py-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container">
        {/* Header section */}
        <div className="row mb-4">
          <div className="col">
            <h1 className={`${ppH1Custom} ${isDarkMode ? 'text-white' : ''}`}>Product List</h1>
            <p className={ppMediumMuteText}>Manage and organize your stock unit</p>
          </div>
        </div>

        {/* Search and stats bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className={`input-group-text border-end-0 rounded-start-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`}>
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 shadow-none rounded-end-4"
                placeholder="Search by name, quantity, SKU..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className={ppSmallMuteText}>
              Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
            <button className={ppBtnWithoutBg} onClick={handleAddProduct}>
              <Plus size={18} className="me-1 text-primary" />
              Add Product
            </button>
          </div>
        </div>

        {/* Product table */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className={`${ppTableLight} ${isDarkMode ? 'table-dark' : ''}`}>
                  <tr>
                    <th scope="col" className="text-center py-3" style={{ width: '5%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        #
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="py-3" style={{ width: '30%' }}>
                      <div className="d-flex align-items-center" onClick={() => handleSort('product_name')}>
                        Product Name
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '15%' }}>
                      <div className="d-flex align-items-center justify-content-center" onClick={() => handleSort('cost_total')}>
                        Cost Total (RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center" onClick={() => handleSort('selling_price')}>
                        Selling price(RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center" onClick={() => handleSort('profit_margin')}>
                        Profit Margin %
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '15%' }}>
                      <div className="d-flex align-items-center justify-content-center" onClick={() => handleSort('profit')}>
                        Profit (RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-end py-3" style={{ width: '15%' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((product, index) => (
                      <tr
                        key={product.id}>
                        <td className="text-center align-middle">
                          <span className={`badge rounded-pill ${isDarkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`}>
                            {indexOfFirstRecord + index + 1}
                          </span>
                        </td>
                        <td className="align-middle fw-medium">
                          {product.product_name}
                        </td>
                        <td className="text-center align-middle">
                          <span className={ppBadgeBlue}>{product.cost_total}</span>
                        </td>
                        <td className="text-center align-middle">
                          <span className={ppBadgeYellow}>{product.selling_price}</span>
                        </td>
                        <td className="text-center align-middle">
                          <span className={ppBadgeGreen}>{product.profit_margin}</span>
                        </td>
                        <td className="text-center align-middle">
                          <span className={ppBadgeBlue}>{product.profit}</span>
                        </td>
                        <td className="text-end align-middle">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary border-0"
                              onClick={() => handleEditProduct(product.id)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <NotFoundPage />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </div>
    </div>
  );
}