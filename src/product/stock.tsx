import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/stockList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, Pencil, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGreen, ppBadgeYellow, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';
import { Product, fetchProducts, updateProductsOrder } from '../hooks/useStock';
import { useDeleteProduct } from '../hooks/useDeleteStock';

export default function Stock() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState<Product | null>(null);
    const [draggedOverItem, setDraggedOverItem] = useState<Product | null>(null);
    const [, setActiveRow] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const deleteProductMutation = useDeleteProduct();

    const queryClient = useQueryClient();
    const {
        data: products = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['stocks'],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: 3,
    });

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Mutation for updating product order
    const updateOrderMutation = useMutation({
        mutationFn: updateProductsOrder,
        onSuccess: (updatedProducts) => {
            queryClient.setQueryData(['stocks'], updatedProducts);
        },
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
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

        const allProducts = [...products];
        queryClient.setQueryData(['stocks'], allProducts);
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
        navigate('/add-stock');
    }

    const handleEditProduct = (productId: number) => {
        navigate(`/edit-stock/${productId}`);
    }

    const handleDeleteProduct = (productId: number) => {
        if (window.confirm(`Are you sure you want to delete product ${productId}?`)) {
            deleteProductMutation.mutate(productId);
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
        <div className="container-fluid py-4 bg-light">
            <div className="container">
                {/* Header section */}
                <div className="row mb-4">
                    <div className="col">
                        <h1 className={ppH1Custom}>Stock List</h1>
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
                            Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredProducts.length)} of {filteredProducts.length} products
                        </div>
                    </div>
                    <div className="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                        <button className={ppBtnWithoutBg} onClick={handleAddProduct}>
                            <Plus size={18} className="me-1 text-primary" />
                            Add Item
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
                                                Item Name
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
                                                Price unit (RM)
                                                <ArrowUpDown size={14} className="ms-1 text-muted" />
                                            </div>
                                        </th>
                                        <th scope="col" className="text-center py-3" style={{ width: '20%' }}>
                                            <div className="d-flex align-items-center justify-content-center">
                                                Total Price (RM)
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
                                    {currentRecords.length > 0 ? (
                                        currentRecords.map((product, index) => (
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
                                                    <span className="badge bg-light text-dark rounded-pill">
                                                        {indexOfFirstRecord + index + 1}
                                                    </span>
                                                </td>
                                                <td className="align-middle fw-medium">
                                                    {product.item_name}
                                                </td>
                                                <td className="text-center align-middle">
                                                    {product.quantity < 5 ? (
                                                        <span className="badge bg-danger text-dark rounded-pill">
                                                            {product.quantity} (Low Stock)
                                                        </span>
                                                    ) : (
                                                        <span className={ppBadgeBlue}>{product.quantity}</span>
                                                    )}
                                                </td>
                                                <td className="text-center align-middle">
                                                    <span className={ppBadgeYellow}>{product.unit_price}</span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <span className={ppBadgeGreen}>{product.total_price}</span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <span className={ppBadgeBlue}>{product.sku}</span>
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
                {filteredProducts.length > recordsPerPage && (
                    <div className="d-flex justify-content-center">
                        <nav aria-label="Page navigation">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={prevPage} aria-label="Previous">
                                        <ChevronLeft size={16} />
                                    </button>
                                </li>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(number)}>
                                            {number}
                                        </button>
                                    </li>
                                ))}
                                
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={nextPage} aria-label="Next">
                                        <ChevronRight size={16} />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}