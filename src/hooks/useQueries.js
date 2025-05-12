// hooks/useQueries.js
import { useQuery } from '@tanstack/react-query';
import dashboardApi from '../api/dashboardService';

/**
 * Hook to fetch dashboard stats
 */
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: dashboardApi.fetchStats,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch user growth data
 * @param {string} period - Time period (weekly, monthly, yearly)
 */
export const useUserGrowth = (period = 'monthly') => {
  return useQuery({
    queryKey: ['userGrowth', period],
    queryFn: () => dashboardApi.fetchUserGrowth(period),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch user platform distribution data
 */
export const useUserDistribution = () => {
  return useQuery({
    queryKey: ['userDistribution'],
    queryFn: dashboardApi.fetchUserDistribution,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch revenue data
 * @param {string} period - Time period (weekly, monthly, yearly)
 */
export const useRevenueData = (period = 'monthly') => {
  return useQuery({
    queryKey: ['revenue', period],
    queryFn: () => dashboardApi.fetchRevenueData(period),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch conversion rate data
 * @param {string} period - Time period (weekly, monthly, yearly)
 */
export const useConversionRate = (period = 'monthly') => {
  return useQuery({
    queryKey: ['conversion', period],
    queryFn: () => dashboardApi.fetchConversionRate(period),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch user engagement data
 */
export const useUserEngagement = () => {
  return useQuery({
    queryKey: ['userEngagement'],
    queryFn: dashboardApi.fetchUserEngagement,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch recent activity data
 * @param {number} limit - Number of activities to fetch
 */
export const useRecentActivity = (limit = 4) => {
  return useQuery({
    queryKey: ['recentActivity', limit],
    queryFn: () => dashboardApi.fetchRecentActivity(limit),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Export all hooks as a single object
 */
export const dashboardHooks = {
  useStats,
  useUserGrowth,
  useUserDistribution,
  useRevenueData,
  useConversionRate,
  useUserEngagement,
  useRecentActivity,
};