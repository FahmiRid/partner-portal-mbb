// src/api/stockApi.ts
import supabase from '../mocks/supabase';

export interface StockFormData {
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    sku: string;
    item: string;
  }
  

export const fetchStockItem = async (stockId: number) => {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('id', stockId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateStockItem = async (stockId: number, updatedStock: Omit<StockFormData, 'item'>) => {
  const { data, error } = await supabase
    .from('stock')
    .update(updatedStock)
    .eq('id', stockId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
