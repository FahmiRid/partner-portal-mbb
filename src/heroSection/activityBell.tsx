import React from 'react';
import { Bell } from 'lucide-react';
import { ppBtnWithoutBg } from '../stylesStore/stylesGlobal';

interface ActivityBellProps {
    activityCount: number;
    onClick: () => void;
}

const ActivityBell: React.FC<ActivityBellProps> = ({ activityCount, onClick }) => {
    return (
        <div className="position-relative me-3">
            <button
                className={`${ppBtnWithoutBg} position-relative`}
                onClick={onClick}
            >
                <Bell size={18} className="text-muted" />
                {activityCount > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        style={{ fontSize: '0.6rem' }}
                    >
                        {activityCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ActivityBell;