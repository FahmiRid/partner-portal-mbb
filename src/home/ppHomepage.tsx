import React, { useState, useEffect } from 'react';
import './ppHomepage.scss';
import { Chart, registerables } from 'chart.js';
import { fetchProducts, Product } from '../hooks/useStock'; // Adjust path as needed

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    percentChange?: number;
}

export default function PPHomepage() {
    // Register Chart.js components
    Chart.register(...registerables);

    // Stats for metrics cards
    const [stats] = useState({
        totalUsers: 12583,
        activeUsers: 8742,
        conversionRate: 4.5,
        avgSessionTime: '18:32',
        revenue: '$87,432',
        orders: 1254
    });

    // State for loading indicators and stock data
    const [, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [totalStockCount, setTotalStockCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

    // Define low stock threshold (you can adjust this value)
    const LOW_STOCK_THRESHOLD = 4;

    // Fetch stock data
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const products = await fetchProducts();
                setAllProducts(products);
                setTotalStockCount(products.length);
                
                // Filter products with low stock
                const lowStock = products.filter(product => {
                    const quantity = parseInt(product.quantity) || 0;
                    return quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
                });

                setLowStockItems(lowStock);
                setLowStockCount(lowStock.length);
            } catch (error) {
                console.error('Error fetching stock data:', error);
                setTotalStockCount(0);
                setAllProducts([]);
                setLowStockCount(0);
                setLowStockItems([]);
            }
        };

        fetchStockData();
    }, []);

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Stats card component
    const StatCard = ({ title, value, icon, color, percentChange }: StatCardProps) => {
        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted mb-1">{title}</h6>
                            <h4 className="mb-0 font-weight-bold">{value}</h4>
                            {percentChange && (
                                <small className={`mt-1 ${percentChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                    <i className={`fas fa-${percentChange >= 0 ? 'arrow-up' : 'arrow-down'} me-1`}></i>
                                    {Math.abs(percentChange)}% from last period
                                </small>
                            )}
                        </div>
                        <div className={`bg-${color} bg-opacity-25 p-3 rounded-circle`}>
                            <i className={`fas fa-${icon} text-${color}`}></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Overall Stock Card
    const OverallStockCard = () => {
        // Calculate total quantity of all items
        const totalQuantity = allProducts.reduce((sum, product) => {
            return sum + (parseInt(product.quantity) || 0);
        }, 0);

        // Calculate average stock per item
        const avgStock = allProducts.length > 0 
            ? (totalQuantity / allProducts.length).toFixed(1)
            : 0;

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted mb-1">Overall Stock Item</h6>
                            <h4 className="mb-0 font-weight-bold">{totalStockCount}</h4>
                            <div className="mt-2">
                                <small className="text-muted">
                                    <i className="fas fa-boxes me-1"></i>
                                    Total items: {totalStockCount}
                                </small>
                                <br />
                                <small className="text-muted">
                                    <i className="fas fa-cube me-1"></i>
                                    Total units: {totalQuantity}
                                </small>
                                <br />
                                <small className="text-muted">
                                    <i className="fas fa-calculator me-1"></i>
                                    Avg. stock: {avgStock} units/item
                                </small>
                            </div>
                        </div>
                        <div className="bg-primary bg-opacity-25 p-3 rounded-circle">
                            <i className="fas fa-warehouse text-primary"></i>
                        </div>
                    </div>
                    
                    {allProducts.length > 0 && (
                        <div className="mt-3">
                            <div className="progress" style={{ height: '8px' }}>
                                <div 
                                    className="progress-bar bg-success" 
                                    role="progressbar" 
                                    style={{ 
                                        width: `${(lowStockCount / totalStockCount) * 100}%` 
                                    }} 
                                    aria-valuenow={lowStockCount}
                                    aria-valuemin={0}
                                    aria-valuemax={totalStockCount}
                                ></div>
                            </div>
                            <small className="text-muted">
                                <span className="text-danger">
                                    {lowStockCount} low stock items
                                </span> 
                                {' '}out of {totalStockCount} total items
                            </small>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Low Stock Card with expandable details
    const LowStockCard = () => {
        const [showDetails, setShowDetails] = useState(false);

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted mb-1">Low Stock Items</h6>
                            <h4 className="mb-0 font-weight-bold text-danger">{lowStockCount}</h4>
                            <small className="text-danger mt-1">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Items below {LOW_STOCK_THRESHOLD} units
                            </small>
                        </div>
                        <div className="bg-danger bg-opacity-25 p-3 rounded-circle">
                            <i className="fas fa-exclamation-triangle text-danger"></i>
                        </div>
                    </div>
                    
                    {lowStockCount > 0 && (
                        <div className="mt-3">
                            <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? 'Hide Details' : 'View Details'}
                                <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} ms-1`}></i>
                            </button>
                            
                            {showDetails && (
                                <div className="mt-3">
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Item Name</th>
                                                    <th>SKU</th>
                                                    <th>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lowStockItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.item_name}</td>
                                                        <td>{item.sku}</td>
                                                        <td>
                                                            <span className="badge bg-danger">
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="container-fluid px-4 py-4">
                {/* Header with filters */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2 className="mb-1">Dashboard Partner Portal</h2>
                        <p className="text-muted mb-0">Analytics and performance metrics</p>
                    </div>
                </div>

                {/* Stats Cards */}
                {/* <div className="row">
                    <div className="col-md-6 col-lg-3">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon="users"
                            color="primary"
                            percentChange={12.4}
                        />
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <StatCard
                            title="Active Users"
                            value={stats.activeUsers.toLocaleString()}
                            icon="user-check"
                            color="success"
                            percentChange={8.7}
                        />
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <StatCard
                            title="Conversion Rate"
                            value={`${stats.conversionRate}%`}
                            icon="chart-line"
                            color="info"
                            percentChange={3.2}
                        />
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <StatCard
                            title="Avg. Session Time"
                            value={stats.avgSessionTime}
                            icon="clock"
                            color="warning"
                            percentChange={5.8}
                        />
                    </div>
                </div> */}

                {/* Stock Overview Row */}
                <div className="row">
                    <div className="col-md-6 col-lg-4">
                        <OverallStockCard />
                    </div>
                    <div className="col-md-6 col-lg-4">
                        <LowStockCard />
                    </div>
                </div>
            </div>
        </>
    );
}