import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Activity tracking interface
export interface Activity {
    id: string;
    type: 'add' | 'update' | 'delete';
    productName: string;
    timestamp: Date;
    details: string;
}

export const useActivityTracker = () => {
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

    // Load activities from localStorage on component mount
    useEffect(() => {
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

    // Add activity function
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
                        timestamp: new Date(a.timestamp)
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

        // Set up polling to check for activity triggers every 100ms
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
    }, [addActivity]);

    // Clear all activities
    const clearAllActivities = useCallback(() => {
        localStorage.removeItem('stockActivities');
        localStorage.removeItem('stockActivityTrigger');
        localStorage.removeItem('newStockAdded');
        setRecentActivities([]);
    }, []);

    return {
        recentActivities,
        addActivity,
        clearAllActivities
    };
};