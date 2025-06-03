import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles/stockList.scss';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, Pencil, Trash, Bell, Clock, CheckCircle } from 'lucide-react';
import { ppBadgeBlue, ppBadgeGreen, ppBadgeYellow, ppBtnWithoutBg, ppH1Custom, ppMediumMuteText, ppSmallMuteText, ppTableLight } from '../stylesStore/stylesGlobal';
import NotFoundPage from '../heroSection/notFoundPage';
import { Product, fetchProducts, updateProductsOrder } from '../hooks/useStock';
import { useDeleteProduct } from '../hooks/useDeleteStock';
import Pagination from '../heroSection/pagination';
import { usePagination } from '../hooks/usePagination';
import { toast } from 'sonner';

// Activity tracking interface
interface Activity {
    id: string;
    type: 'add' | 'update' | 'delete';
    productName: string;
    timestamp: Date;
    details: string;
}

export default function Stock() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState<Product | null>(null);
    const [draggedOverItem, setDraggedOverItem] = useState<Product | null>(null);
    const [, setActiveRow] = useState<number | null>(null);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [showActivityPanel, setShowActivityPanel] = useState(false);
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

    // Load activities from localStorage on component mount
    useEffect(() => {
        const savedActivities = localStorage.getItem('stockActivities');
        if (savedActivities) {
            try {
                const parsed = JSON.parse(savedActivities).map((activity: any) => ({
                    ...activity,
                    timestamp: new Date(activity.timestamp)
                }));
                setRecentActivities(parsed);
            } catch (error) {
                console.error('Error parsing saved activities:', error);
            }
        }
    }, []);

    // Save activities to localStorage whenever activities change
    // Replace your activity-related useEffect with this simplified version
    useEffect(() => {
        // Load activities from localStorage on component mount
        const loadActivities = () => {
            const savedActivities = localStorage.getItem('stockActivities');
            if (savedActivities) {
                try {
                    const parsed = JSON.parse(savedActivities).map((activity: any) => ({
                        ...activity,
                        timestamp: new Date(activity.timestamp)
                    }));
                    setRecentActivities(parsed);
                } catch (error) {
                    console.error('Error parsing saved activities:', error);
                    
                }
            }
        };

        loadActivities();

        // Simplified storage event handler
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'stockActivities') {
                loadActivities();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Modify your addActivity function to be simpler
    const addActivity = useCallback((type: 'add' | 'update' | 'delete', productName: string, details: string) => {
        const newActivity: Activity = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            productName,
            timestamp: new Date(),
            details
        };

        setRecentActivities(prev => {
            const updatedActivities = [newActivity, ...prev].slice(0, 20);
            localStorage.setItem('stockActivities', JSON.stringify(updatedActivities));
            return updatedActivities;
        });

        // Show toast notification
        const activityMessages = {
            add: `✅ New stock added: ${productName}`,
            update: `📝 Stock updated: ${productName}`,
            delete: `🗑️ Stock deleted: ${productName}`
        };

        toast.success(activityMessages[type], {
            description: details,
            duration: 4000,
            action: {
                label: "View Activities",
                onClick: () => setShowActivityPanel(true)
            }
        });
    }, []);

    // Enhanced activity tracking with useCallback dependency
    useEffect(() => {
        window.addStockActivity = addActivity;
        const processedActivities = new Set<string>();
        const loadActivities = () => {
            try {
                const saved = localStorage.getItem('stockActivities');
                if (saved) {
                    const parsed = JSON.parse(saved).map((a: any) => ({
                        ...a,
                        timestamp: new Date(a.timestamp) // Ensure proper Date object
                    }));
                    setRecentActivities(parsed);
                }
            } catch (error) {
                console.error('Failed to load activities:', error);
            }
        };

        loadActivities();
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'stockActivities') {
                loadActivities();
            }
        };

        // Handle custom events for same-window communication
        const handleCustomEvent = (e: CustomEvent) => {
            const activity = e.detail;
            addActivity(activity.type, activity.productName, activity.details);
        };
        // Enhanced polling mechanism for same-window detection
        let lastCheckedTimestamp = Date.now();
        const checkForActivityTrigger = () => {
            const activityTrigger = localStorage.getItem('stockActivityTrigger');
            if (activityTrigger) {
                try {
                    const activityData = JSON.parse(activityTrigger);
                    const activityId = `${activityData.type}-${activityData.productName}-${activityData.timestamp}`;

                    // Check if this is a new activity and hasn't been processed
                    if (activityData.timestamp > lastCheckedTimestamp &&
                        activityData.type &&
                        activityData.productName &&
                        !processedActivities.has(activityId)) {

                        console.log('Processing polled activity:', activityData);
                        addActivity(activityData.type, activityData.productName, activityData.details);
                        processedActivities.add(activityId);
                    }
                } catch (error) {
                    console.error('Error parsing activity trigger:', error);
                }
            }
            lastCheckedTimestamp = Date.now();
        };

        const pendingActivity = localStorage.getItem('stockActivityTrigger') ||
            sessionStorage.getItem('lastStockActivity');
        if (pendingActivity) {
            try {
                const activity = JSON.parse(pendingActivity);
                addActivity(activity.type, activity.productName, activity.details);
            } catch (error) {
                console.error('Error parsing pending activity:', error);
            }
        }

        // Set up polling to check for activity triggers every 100ms (more frequent)
        const activityCheckInterval = setInterval(checkForActivityTrigger, 100);

        // Initial check
        checkForActivityTrigger();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('stockAdded', handleCustomEvent as EventListener);
        window.addEventListener('stockUpdated', handleCustomEvent as EventListener);

        return () => {
            clearInterval(activityCheckInterval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('stockAdded', handleCustomEvent as EventListener);
            window.removeEventListener('stockUpdated', handleCustomEvent as EventListener);
            // Clean up global reference
            if (window.addStockActivity) {
                delete window.addStockActivity;
            }
        };
    }, [addActivity]); // Now addActivity is stable due to useCallback

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

    const updateOrderMutation = useMutation({
        mutationFn: updateProductsOrder,
        onSuccess: (updatedProducts) => {
            queryClient.setQueryData(['stocks'], updatedProducts);
        },
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        resetToFirstPage();
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
    };

    const handleEditProduct = (productId: number) => {
        navigate(`/edit-stock/${productId}`);
    };

    const handleDeleteProduct = (productId: number, item_name: string) => {
        deleteProductMutation.mutate(productId);
        addActivity('delete', item_name, `Product removed from inventory`);
    };

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'add': return <Plus size={16} className="text-success" />;
            case 'update': return <Pencil size={16} className="text-warning" />;
            case 'delete': return <Trash size={16} className="text-danger" />;
            default: return <CheckCircle size={16} className="text-info" />;
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
                        {/* Activity Bell Icon */}
                        <div className="position-relative me-3">
                            <button
                                className={`${ppBtnWithoutBg} position-relative`}
                                onClick={() => setShowActivityPanel(!showActivityPanel)}
                            >
                                <Bell size={18} className="text-muted" />
                                {recentActivities.length > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                        {recentActivities.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <button className={ppBtnWithoutBg} onClick={handleAddProduct}>
                            <Plus size={18} className="me-1 text-primary" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Activity Panel */}
                {showActivityPanel && (
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light border-bottom-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 d-flex align-items-center">
                                <Clock size={16} className="me-2 text-muted" />
                                Recent Activity
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                    localStorage.removeItem('stockActivities');
                                    localStorage.removeItem('stockActivityTrigger');
                                    localStorage.removeItem('newStockAdded');
                                    setRecentActivities([]);
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="card-body p-0">
                            {recentActivities && recentActivities.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="d-flex">
                                                <div className="me-3 mt-1">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div>
                                                    <div className="fw-medium">{activity.productName}</div>
                                                    <small className="text-muted">{activity.details}</small>
                                                </div>
                                            </div>
                                            <small className="text-muted">{formatTimeAgo(activity.timestamp)}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <Clock size={32} className="mb-2 opacity-50" />
                                    <p className="mb-0">No recent activities</p>
                                    <small className="d-block mt-2">
                                        {recentActivities ? `State has ${recentActivities.length} activities` : 'State is null'}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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