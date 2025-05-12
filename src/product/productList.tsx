import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/productList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, X, Plus, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGrey, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';

interface Product {
  id: number;
  productName: string;
  quantity: string;
  totalUnit: string;
  sku: string;
}

// API functions
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('http://localhost:3001/api/products');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const updateProductsOrder = async (products: Product[]): Promise<Product[]> => {
  // This would typically be a PUT or PATCH request to your API
  // For now, we'll just return the reordered products
  return products;
};

export default function ProductList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<Product | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<Product | null>(null);
  const [, setActiveRow] = useState<number | null>(null);

  // QueryClient instance to interact with the cache
  const queryClient = useQueryClient();

  // Fetch products using TanStack Query
  const {
    data: products = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
  });

  // Mutation for updating product order
  const updateOrderMutation = useMutation({
    mutationFn: updateProductsOrder,
    onSuccess: (updatedProducts) => {
      // Update the cache with new order
      queryClient.setQueryData(['products'], updatedProducts);
    },
  });

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    const term = searchTerm.toLowerCase().trim();
    return products.filter(product =>
      product.productName.toLowerCase().includes(term) ||
      product.quantity.toLowerCase().includes(term) ||
      product.totalUnit.toLowerCase().includes(term) ||
      product.id.toString().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, product: Product) => {
    setDraggedItem(product);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, product: Product) => {
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

    const draggedItemIndex = filteredProducts.findIndex(item => item.id === draggedItem.id);
    const draggedOverItemIndex = filteredProducts.findIndex(item => item.id === draggedOverItem.id);

    // Create new array with reordered items - this is for the filtered view
    const newFilteredProducts = [...filteredProducts];
    const [movedItem] = newFilteredProducts.splice(draggedItemIndex, 1);
    newFilteredProducts.splice(draggedOverItemIndex, 0, movedItem);

    // Update the master products array based on the original indices
    const allProducts = [...products];
    const originalDraggedIndex = allProducts.findIndex(item => item.id === draggedItem.id);
    const originalDropIndex = allProducts.findIndex(item => item.id === draggedOverItem.id);

    const [originalMovedItem] = allProducts.splice(originalDraggedIndex, 1);
    allProducts.splice(originalDropIndex, 0, originalMovedItem);

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
            <h1 className={ppH1Custom}>Product Inventory</h1>
            <p className={ppMediumMuteText}>Manage and organize your product catalog</p>
          </div>
        </div>

        {/* Search and stats bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 shadow-none"
                placeholder="Search by name, quantity, SKU..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <div className={ppSmallMuteText}>
              {filteredProducts.length} of {products.length} products found
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
            <button className={ppBtnWithoutBg} onClick={handleAddProduct}>
               {/*Plus Icon*/}
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
                        Quantity
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        Total Unit (RM)
                        <ArrowUpDown size={14} className="ms-1 text-muted" />
                      </div>
                    </th>
                    <th scope="col" className="text-center py-3" style={{ width: '15%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        SKU
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
                        {product.productName}
                      </td>
                      <td className="text-center align-middle">
                        <span className={ppBadgeGrey}>{product.quantity}</span>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2">{product.totalUnit}</span>
                      </td>
                      <td className="text-center align-middle">
                        <span className={ppBadgeBlue}>{product.sku}</span>
                      </td>
                      <td className="text-end align-middle">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary border-0"
                            onClick={() => alert(`Edit product ${product.id}`)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => alert(`Delete product ${product.id}`)}
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