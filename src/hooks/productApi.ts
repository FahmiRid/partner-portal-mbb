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
  
  try {
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
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Network error fetching product:', err);
    throw new Error('Network error: Unable to fetch product data');
  }
};

export const updateProductWithItems = async (
  productId: string, 
  product: Partial<ProductWithItems>, 
  selectedItems: SelectedItem[]
) => {
  console.log('Updating product:', { productId, product, selectedItems });

  try {
    // First, let's try to update using RPC or a different approach
    // Delete existing product items first
    const { error: deleteError } = await supabase
      .from("product_items")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error('Error deleting product items:', deleteError);
      throw new Error(`Failed to delete existing items: ${deleteError.message}`);
    }

    // Update the product using upsert instead of update
    const { data: productData, error: productError } = await supabase
      .from("products")
      .upsert({
        id: parseInt(productId),
        product_name: product.product_name,
        cost_total: product.cost_total,
        selling_price: product.selling_price,
        profit_margin: product.profit_margin,
        profit: product.profit
      })
      .select()
      .single();

    if (productError) {
      console.error('Error updating product:', productError);
      throw new Error(`Failed to update product: ${productError.message}`);
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
        throw new Error(`Failed to insert product items: ${itemsError.message}`);
      }
    }

    return productData;
  } catch (err: any) {
    console.error('Network error updating product:', err);
    
    // Handle different types of errors
    if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your internet connection and try again');
    }
    
    throw new Error(err.message || 'Unknown error occurred while updating product');
  }
};

// Alternative update function using individual operations
export const updateProductWithItemsAlternative = async (
  productId: string, 
  product: Partial<ProductWithItems>, 
  selectedItems: SelectedItem[]
) => {
  console.log('Updating product (alternative method):', { productId, product, selectedItems });

  try {
    // Use individual SQL operations instead of batch operations
    
    // Step 1: Delete existing items
    await supabase.rpc('delete_product_items', { product_id: parseInt(productId) });
    
    // Step 2: Update product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .update({
        product_name: product.product_name,
        cost_total: product.cost_total,
        selling_price: product.selling_price,
        profit_margin: product.profit_margin,
        profit: product.profit,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (productError) {
      throw new Error(`Failed to update product: ${productError.message}`);
    }

    // Step 3: Insert new items one by one
    for (const item of selectedItems) {
      const { error: itemError } = await supabase
        .from("product_items")
        .insert({
          product_id: parseInt(productId),
          stock_item_id: item.id,
          quantity_used: item.quantity_used,
          unit_price: item.unit_price,
          total_cost: item.total_cost
        });

      if (itemError) {
        console.error('Error inserting item:', itemError);
        // Continue with other items instead of failing completely
      }
    }

    return productData;
  } catch (err: any) {
    console.error('Error in alternative update:', err);
    throw new Error(err.message || 'Failed to update product');
  }
};