import React, { useState, useEffect } from 'react';
import './ppHomepage.scss';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';


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

    // State for analytics data
    const [analyticsData] = useState({
        userGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'New Users',
                    data: [320, 420, 390, 450, 520, 600],
                    backgroundColor: 'rgba(66, 133, 244, 0.6)',
                    borderColor: 'rgba(66, 133, 244, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Active Users',
                    data: [290, 350, 330, 420, 490, 580],
                    backgroundColor: 'rgba(52, 168, 83, 0.6)',
                    borderColor: 'rgba(52, 168, 83, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        userDistribution: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            datasets: [{
                data: [55, 35, 10],
                backgroundColor: [
                    'rgba(66, 133, 244, 0.7)',
                    'rgba(219, 68, 55, 0.7)',
                    'rgba(244, 180, 0, 0.7)'
                ],
                borderColor: [
                    'rgba(66, 133, 244, 1)',
                    'rgba(219, 68, 55, 1)',
                    'rgba(244, 180, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        revenueData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12500, 14000, 13200, 15600, 18200, 21000],
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        conversionRate: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Conversion Rate (%)',
                data: [3.2, 3.5, 3.8, 4.1, 4.5, 5.0],
                backgroundColor: 'rgba(244, 180, 0, 0.6)',
                borderColor: 'rgba(244, 180, 0, 1)',
                borderWidth: 2
            }]
        },
        userEngagement: {
            labels: ['0-5 min', '5-15 min', '15-30 min', '30+ min'],
            datasets: [{
                data: [30, 35, 25, 10],
                backgroundColor: [
                    'rgba(66, 133, 244, 0.7)',
                    'rgba(52, 168, 83, 0.7)',
                    'rgba(251, 188, 5, 0.7)',
                    'rgba(219, 68, 55, 0.7)'
                ],
                borderColor: [
                    'rgba(66, 133, 244, 1)',
                    'rgba(52, 168, 83, 1)',
                    'rgba(251, 188, 5, 1)',
                    'rgba(219, 68, 55, 1)'
                ],
                borderWidth: 1
            }]
        }
    });

    // Stats for metrics cards
    const [stats] = useState({
        totalUsers: 12583,
        activeUsers: 8742,
        conversionRate: 4.5,
        avgSessionTime: '18:32',
        revenue: '$87,432',
        orders: 1254
    });

    // State for loading indicators
    const [loading, setLoading] = useState(true);

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Time period filter
    const [timePeriod, setTimePeriod] = useState('monthly');

    // Handle time period change
    const handleTimePeriodChange = (period: React.SetStateAction<string>) => {
        setTimePeriod(period);
        setLoading(true);

        // Simulate data loading when changing time period
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

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

    return (
        <>
            <div className="container-fluid px-4 py-4">
                {/* Header with filters */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2 className="mb-1">Dashboard Partner Portal</h2>
                        <p className="text-muted mb-0">Analytics and performance metrics</p>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-md-end">
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className={`btn ${timePeriod === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handleTimePeriodChange('weekly')}
                                >
                                    Weekly
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${timePeriod === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handleTimePeriodChange('monthly')}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${timePeriod === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handleTimePeriodChange('yearly')}
                                >
                                    Yearly
                                </button>
                            </div>
                            <button className="btn btn-outline-secondary ms-2">
                                <i className="fas fa-download me-1"></i> Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row">
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
                </div>

                {/* Main charts */}
                <div className="row">
                    {/* User Growth Chart */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">User Growth</h5>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            Last 6 Months
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item">Last 3 Months</a></li>
                                            <li><a className="dropdown-item">Last 6 Months</a></li>
                                            <li><a className="dropdown-item">Last Year</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <Line
                                        data={analyticsData.userGrowth}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                    align: 'end'
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {

                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            }
                                        }}
                                        height={300}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Distribution */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">User Platform Distribution</h5>
                                    <button className="btn btn-sm btn-outline-secondary">
                                        <i className="fas fa-info-circle"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ height: '300px' }}>
                                        <Doughnut
                                            data={analyticsData.userDistribution}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                },
                                                cutout: '65%'
                                            }}
                                        />
                                        <div className="text-center mt-3">
                                            <div className="d-inline-block mx-2">
                                                <span className="d-inline-block rounded-circle me-1" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(66, 133, 244, 0.7)' }}></span>
                                                <small>Desktop</small>
                                            </div>
                                            <div className="d-inline-block mx-2">
                                                <span className="d-inline-block rounded-circle me-1" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(219, 68, 55, 0.7)' }}></span>
                                                <small>Mobile</small>
                                            </div>
                                            <div className="d-inline-block mx-2">
                                                <span className="d-inline-block rounded-circle me-1" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(244, 180, 0, 0.7)' }}></span>
                                                <small>Tablet</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second row of charts */}
                <div className="row">
                    {/* Revenue chart */}
                    <div className="col-md-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Revenue Overview</h5>
                                    <div className="btn-group" role="group">
                                        <button type="button" className="btn btn-sm btn-outline-primary active">Revenue</button>
                                        <button type="button" className="btn btn-sm btn-outline-primary">Orders</button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ height: '300px' }}>
                                        <Line
                                            data={analyticsData.revenueData}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        grid: {

                                                        },
                                                        ticks: {
                                                            callback: function (value) {
                                                                return '$' + value.toLocaleString();
                                                            }
                                                        }
                                                    },
                                                    x: {
                                                        grid: {
                                                            display: false
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="row text-center mt-3">
                                    <div className="col-6">
                                        <h6 className="text-muted mb-1">Total Revenue</h6>
                                        <h4>{stats.revenue}</h4>
                                    </div>
                                    <div className="col-6">
                                        <h6 className="text-muted mb-1">Total Orders</h6>
                                        <h4>{stats.orders}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Engagement */}
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">User Session Duration</h5>
                                    <button className="btn btn-sm btn-outline-secondary">
                                        <i className="fas fa-info-circle"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ height: '300px' }}>
                                        <Pie
                                            data={analyticsData.userEngagement}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate and Recent Activity */}
                <div className="row">
                    {/* Conversion Rate */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Conversion Rate</h5>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            Last 6 Months
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item">Last 3 Months</a></li>
                                            <li><a className="dropdown-item">Last 6 Months</a></li>
                                            <li><a className="dropdown-item">Last Year</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ height: '250px' }}>
                                        <Bar
                                            data={analyticsData.conversionRate}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        grid: {

                                                        },
                                                        ticks: {
                                                            callback: function (value) {
                                                                return value + '%';
                                                            }
                                                        }
                                                    },
                                                    x: {
                                                        grid: {
                                                            display: false
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Recent Activity</h5>
                                    <button className="btn btn-sm btn-primary">View All</button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                                    <i className="fas fa-user-plus text-primary"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-0">New user registered</h6>
                                                    <small className="text-muted">John Smith joined the platform</small>
                                                </div>
                                            </div>
                                            <small className="text-muted">2m ago</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                                    <i className="fas fa-shopping-cart text-success"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-0">New order placed</h6>
                                                    <small className="text-muted">Order #12345 - $230.00</small>
                                                </div>
                                            </div>
                                            <small className="text-muted">15m ago</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                                                    <i className="fas fa-star text-warning"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-0">New review received</h6>
                                                    <small className="text-muted">Jane Doe left a 5-star review</small>
                                                </div>
                                            </div>
                                            <small className="text-muted">1h ago</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                                                    <i className="fas fa-exclamation-triangle text-danger"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-0">System alert</h6>
                                                    <small className="text-muted">Server load reached 85%</small>
                                                </div>
                                            </div>
                                            <small className="text-muted">3h ago</small>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}