import React from 'react';
import { Clock, Plus, Pencil, Trash, CheckCircle } from 'lucide-react';
import { Activity } from '../hooks/useActivityTracker';

interface ActivityPanelProps {
    activities: Activity[];
    showPanel: boolean;
    onClearAll: () => void;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ 
    activities, 
    showPanel, 
    onClearAll 
}) => {
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

    if (!showPanel) return null;

    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 d-flex align-items-center">
                    <Clock size={16} className="me-2 text-muted" />
                    Recent Activity
                </h6>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onClearAll}
                >
                    Clear All
                </button>
            </div>
            <div className="card-body p-0">
                {activities && activities.length > 0 ? (
                    <div className="list-group list-group-flush">
                        {activities.map((activity) => (
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
                            {activities ? `State has ${activities.length} activities` : 'State is null'}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityPanel;