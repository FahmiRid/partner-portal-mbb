import React, { useState, useEffect } from 'react';
import './ppHomepage.scss';
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
    const [, setLoading] = useState(true);

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

    return (
        <>
            <div className="container-fluid px-4 py-4">
                {/* Header with filters */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2 className="mb-1">Dashboard Partner Portal</h2>
                        <p className="text-muted mb-0">Analytics and performance metrics</p>
                    </div>
                    {/* <div className="col-md-6">
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
                    </div> */}
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
            </div>
        </>
    );
}