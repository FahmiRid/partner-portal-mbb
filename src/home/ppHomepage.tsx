import React, { useState } from 'react';
import './ppHomepage.scss';
import { Chart, registerables } from 'chart.js';
import { useStockAnalytics } from '../hooks/useDataDashboard';
import { QuickAction } from './components/utils';
import { ppHomeCustom } from '../stylesStore/stylesGlobal';

export default function PPHomepage() {
    // Register Chart.js components
    Chart.register(...registerables);

    // Define low stock threshold
    const LOW_STOCK_THRESHOLD = 4;

    // Use TanStack Query hook instead of useEffect
    const {
        data: stockData,
        isLoading,
        isError,
        error,
        isRefetching,
        refetch
    } = useStockAnalytics(LOW_STOCK_THRESHOLD);

    // Overall Stock Card
    const OverallStockCard = () => {
        if (isLoading) {
            return (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-3">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (isError || !stockData) {
            return (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-3">
                        <div className="text-center text-muted">
                            <i className="fas fa-exclamation-triangle mb-2"></i>
                            <p>Failed to load stock data</p>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const { totalStockCount, totalQuantity, avgStock, lowStockCount } = stockData;

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="d-flex align-items-center">
                                <h6 className="text-muted mb-1 me-2">Overall Stock Item</h6>
                                {isRefetching && (
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Refreshing...</span>
                                    </div>
                                )}
                            </div>
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

                    {totalStockCount > 0 && (
                        <div className="mt-3">
                            <div className="progress" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-danger"
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

        if (isLoading) {
            return (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-3">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (isError || !stockData) {
            return (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-3">
                        <div className="text-center text-muted">
                            <i className="fas fa-exclamation-triangle mb-2"></i>
                            <p>Failed to load low stock data</p>
                            <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const { lowStockCount, lowStockItems } = stockData;

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="d-flex align-items-center">
                                <h6 className="text-muted mb-1 me-2">Low Stock Items</h6>
                                {isRefetching && (
                                    <div className="spinner-border spinner-border-sm text-danger" role="status">
                                        <span className="visually-hidden">Refreshing...</span>
                                    </div>
                                )}
                            </div>
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
                                                {lowStockItems.map((item: { id: React.Key | null | undefined; item_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; sku: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; quantity: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
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
            <div className={`container-fluid  py-4 ${ppHomeCustom}`}>
                {/* Header with filters */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2 className="mb-1">Dashboard Partner Portal</h2>
                        <p className="text-muted mb-0">Analytics and performance metrics</p>
                    </div>
                    <div className="col-md-6 text-end">
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => refetch()}
                            disabled={isRefetching}
                        >
                            {isRefetching ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Refresh Data
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {isError && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                <strong>Error loading data:</strong> {error?.message || 'Something went wrong'}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger ms-2"
                                    onClick={() => refetch()}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stock Overview Row */}
                <div className="row">
                    <div className="col-md-6 col-lg-4">
                        <OverallStockCard />
                    </div>
                    <div className="col-md-6 col-lg-4">
                        <LowStockCard />
                    </div>
                </div>

                <label>Quick Actions</label>
                <div className="row">
                    <div className="col-md-6">
                        <QuickAction />
                    </div>
                </div>
            </div>
        </>
    );
}