import { fetchProducts, Product } from './useStock';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Query keys for better cache management
export const stockQueryKeys = {
  products: ['products'] as const,
  stockAnalytics: ['stock-analytics'] as const,
};

// Main hook to fetch all products
export const useDataDashboard = () => {
  return useQuery({
    queryKey: stockQueryKeys.products,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get stock analytics (derived data)
export const useStockAnalytics = (lowStockThreshold: number = 4) => {
  return useQuery({
    queryKey: [...stockQueryKeys.stockAnalytics, lowStockThreshold],
    queryFn: async (): Promise<StockAnalytics> => {
      const products = await fetchProducts();
      
      const totalStockCount = products.length;
      
      // Calculate total quantity of all items
      const totalQuantity = products.reduce((sum, product) => {
        return sum + (parseInt(product.quantity) || 0);
      }, 0);
      
      // Filter products with low stock
      const lowStockItems = products.filter(product => {
        const quantity = parseInt(product.quantity) || 0;
        return quantity > 0 && quantity <= lowStockThreshold;
      });
      
      const lowStockCount = lowStockItems.length;
      
      // Calculate average stock per item
      const avgStock = totalStockCount > 0
        ? parseFloat((totalQuantity / totalStockCount).toFixed(1))
        : 0;
      
      return {
        products,
        totalStockCount,
        totalQuantity,
        lowStockItems,
        lowStockCount,
        avgStock,
        lowStockThreshold,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Type definitions
export interface StockAnalytics {
  products: Product[];
  totalStockCount: number;
  totalQuantity: number;
  lowStockItems: Product[];
  lowStockCount: number;
  avgStock: number;
  lowStockThreshold: number;
}

// Hook for just low stock items (if you need it separately)
export const useLowStockItems = (lowStockThreshold: number = 4) => {
  return useQuery({
    queryKey: ['low-stock-items', lowStockThreshold],
    queryFn: async (): Promise<Product[]> => {
      const products = await fetchProducts();
      return products.filter(product => {
        const quantity = parseInt(product.quantity) || 0;
        return quantity > 0 && quantity <= lowStockThreshold;
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product> & { id: string }) => {
      // Replace this with your actual update API call
      const response = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch stock data
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.products });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.stockAnalytics });
    },
  });
};