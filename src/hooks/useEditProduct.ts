// src/api/stockApi.ts
import supabase from '../mocks/supabase';

export interface ProductEditFormData {
    id?: number;
    product_name: string;
    cost_total: number;
    selling_price: number;
    profit_margin: number;
    profit: number;
    photo_url?: string;
}

// Fetch product with related items
export const fetchProductItem = async (productId: number) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_items (
                quantity_used,
                items (
                    id,
                    item_name,
                    unit_price
                )
            )
        `)
        .eq('id', productId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Update product
export const updateProductItem = async (productId: number, updatedProduct: Omit<ProductEditFormData, 'id'>) => {
    const { data, error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', productId)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};