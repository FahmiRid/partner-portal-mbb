import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define the type for the product items returned from the API
interface Stock {
  id: number;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  sku?: string;
}

const fetchStock = async (): Promise<Stock[]> => {
  const response = await axios.get<Stock[]>('http://localhost:3003/api/item');
  return response.data;
};

export const useStock = () => {
  return useQuery({
    queryKey: ['stock'],
    queryFn: fetchStock
  });
};