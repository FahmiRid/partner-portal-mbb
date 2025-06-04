import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/stockList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGreen, ppBadgeYellow, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';
import { Product, fetchProducts } from '../hooks/useStock';
import { useDeleteProduct } from '../hooks/useDeleteStock';
import Pagination from '../heroSection/pagination';
import { usePagination } from '../hooks/usePagination';

// Activity-related imports
import { useActivityTracker } from '../hooks/useActivityTracker';
import ActivityPanel from '../heroSection/activityPanel';
import ActivityBell from '../heroSection/activityBell';

export default function Stock() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showActivityPanel, setShowActivityPanel] = useState(false);
    const recordsPerPage = 10;

    // Activity tracking hook
    const { recentActivities, addActivity, clearAllActivities } = useActivityTracker();

    const deleteProductMutation = useDeleteProduct();

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
    const filteredProducts = products
        .filter(product =>
            product.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (a.quantity < 5 && b.quantity >= 5) return -1;
            if (a.quantity >= 5 && b.quantity < 5) return 1;
            return 0;
        });

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

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        resetToFirstPage();
    };

    const handleAddProduct = () => {
        navigate('/add-stock');
    };

    const handleEditProduct = (productId: number) => {
        navigate(`/edit-stock/${productId}`);
    };

    const handleDeleteProduct = (productId: number, item_name: string) => {
        deleteProductMutation.mutate(productId);
        addActivity('delete', item_name, `Product removed from inventory`);
    };

    const handleActivityBellClick = () => {
        setShowActivityPanel(!showActivityPanel);
    };

    const handleClearAllActivities = () => {
        clearAllActivities();
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
                        {/* Activity Bell Component */}
                        <ActivityBell
                            activityCount={recentActivities.length}
                            onClick={handleActivityBellClick}
                        />

                        <button className={ppBtnWithoutBg} onClick={handleAddProduct}>
                            <Plus size={18} className="me-1 text-primary" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Activity Panel Component */}
                <ActivityPanel
                    activities={recentActivities}
                    showPanel={showActivityPanel}
                    onClearAll={handleClearAllActivities}
                />

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
                                                            onClick={() => handleDeleteProduct(product.id, product.item_name)}
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