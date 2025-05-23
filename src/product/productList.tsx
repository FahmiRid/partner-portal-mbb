import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/stockList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGreen, ppBadgeYellow, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';
import { ProductListPackage, fetchProductsList, updateProductsListOrder } from '../hooks/useProductList';
import { useDeleteProduct } from '../hooks/useDeleteProduct';



export default function ProductList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<ProductListPackage | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<ProductListPackage | null>(null);
  const [, setActiveRow] = useState<number | null>(null);

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
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    // Add this option to refetch the data when the cache is invalidated
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutation for updating product order
  const updateOrderMutation = useMutation({
    mutationFn: updateProductsListOrder,
    onSuccess: (updatedProducts) => {
      // Update the cache with new order
      queryClient.setQueryData(['products'], updatedProducts);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, product: ProductListPackage) => {
    setDraggedItem(product);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, product: ProductListPackage) => {
    e.preventDefault();
    setDraggedOverItem(product);
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();

    if (!draggedItem || !draggedOverItem) return;

    // Update the master products array based on the original indices
    const allProducts = [...products];

    // Update the cache immediately for a responsive UI
    queryClient.setQueryData(['products'], allProducts);

    // Then send the update to the server
    updateOrderMutation.mutate(allProducts);

    e.currentTarget.classList.remove('drag-over');
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  }

  // Handle edit button click - Navigate to edit page with the product ID
  const handleEditProduct = (productId: number) => {
    navigate(`/edit-product/${productId}`);
  }

  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };


  // Show loading state
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

  // Show error state
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
    <div className="container-fluid py-4 bg-light">
      <div className="container">
        {/* Header section */}
        <div className="row mb-4">
          <div className="col">
            <h1 className={ppH1Custom}>Product List</h1>
            <p className={ppMediumMuteText}>Manage and organize your stock unit</p>
          </div>
        </div>

        {/* Search and stats bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-4">
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
              {filteredProducts.length} of {products.length} products found
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
                <thead className={ppTableLight}>
                  <tr>
                    <th scope="col" className="text-center py-3" style={{ width: '5%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        #
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="py-3" style={{ width: '30%' }}>
                      <div className="d-flex align-items-center">
                        Product Name
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '15%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        Cost Total (RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        Selling price(RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        Profit Margin %
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '15%' }}>
                      <div className="d-flex align-items-center justify-content-center">
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
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, product)}
                      onDragOver={(e) => handleDragOver(e, product)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => setActiveRow(product.id)}
                      onMouseLeave={() => setActiveRow(null)}
                      className="cursor-move"
                    >
                      <td className="text-center align-middle">
                        <span className="badge bg-light text-dark rounded-pill">{index + 1}</span>
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
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <NotFoundPage />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}