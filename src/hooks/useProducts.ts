import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define the type for the product items returned from the API
interface Product {
  id: number;
  itemName: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get<Product[]>('http://localhost:3003/api/item');
  return response.data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
};