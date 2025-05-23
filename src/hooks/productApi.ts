import supabase from '../mocks/supabase';

export interface ProductWithItems {
  id: number;
  product_name: string;
  cost_total: number;
  selling_price: number;
  profit_margin: number;
  profit: number;
  product_items: Array<{
    id: number;
    quantity_used: number;
    unit_price: number;
    total_cost: number;
    stock_item: {
      id: number;
      item_name: string;
      sku: string;
      unit_price: string;
      quantity: number;
    };
  }>;
}

export interface SelectedItem {
  id: number;
  item_name: string;
  unit_price: number;
  quantity_used: number;
  total_cost: number;
}

export const fetchProductWithItems = async (productId: string): Promise<ProductWithItems> => {
  console.log('Fetching product with ID:', productId);
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_items (
        id,
        quantity_used,
        unit_price,
        total_cost,
        stock_item:stock_item_id (
          id,
          item_name,
          sku,
          unit_price,
          quantity
        )
      )
    `)
    .eq('id', productId)
    .single();

  console.log('Product fetch result:', { data, error });

  if (error) {
    console.error('Error fetching product:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateProductWithItems = async (
  productId: string, 
  product: Partial<ProductWithItems>, 
  selectedItems: SelectedItem[]
) => {
  console.log('Updating product:', { productId, product, selectedItems });

  // Update the product
  const { data: productData, error: productError } = await supabase
    .from("products")
    .update({
      product_name: product.product_name,
      cost_total: product.cost_total,
      selling_price: product.selling_price,
      profit_margin: product.profit_margin,
      profit: product.profit
    })
    .eq('id', productId)
    .select()
    .single();

  if (productError) {
    console.error('Error updating product:', productError);
    throw new Error(productError.message);
  }

  // Delete existing product items
  const { error: deleteError } = await supabase
    .from("product_items")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error('Error deleting product items:', deleteError);
    throw new Error(deleteError.message);
  }

  // Insert new product items
  if (selectedItems.length > 0) {
    const productItems = selectedItems.map(item => ({
      product_id: parseInt(productId),
      stock_item_id: item.id,
      quantity_used: item.quantity_used,
      unit_price: item.unit_price,
      total_cost: item.total_cost
    }));

    const { error: itemsError } = await supabase
      .from("product_items")
      .insert(productItems);

    if (itemsError) {
      console.error('Error inserting product items:', itemsError);
      throw new Error(itemsError.message);
    }
  }

  return productData;
};