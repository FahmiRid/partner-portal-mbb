import supabase from '../mocks/supabase';

export interface ProductListPackage {
    id: number; 
    product_name: string;
    cost_total: number;
    selling_price: number;
    profit_margin: number;
    profit: number;
  }

export const fetchProductsList = async (): Promise<ProductListPackage[]> => {
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    };

export const updateProductsListOrder =  async (products: ProductListPackage[]): Promise<ProductListPackage[]> => {
    return products;
};

