// src/api/stockApi.ts
import supabase from '../mocks/supabase';

export interface Product {
  id: number;
  item_name: string;
  quantity: any;
  total_price: string;
  unit_price: string;
  totalUnit: string;
  sku: string;
}


export const fetchProducts = async (): Promise<Product[]> => {
        const { data, error } = await supabase.from("stock").select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    };

export const updateProductsOrder =  async (products: Product[]): Promise<Product[]> => {
    return products;
};

