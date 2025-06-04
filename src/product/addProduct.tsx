import React, { useState, useEffect, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput, ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText } from '../stylesStore/stylesGlobal';
import { fetchProducts } from '../hooks/useStock';
import supabase from '../mocks/supabase';
import './styles/addProduct.scss';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'

interface Product {
  id: number;
  item_name: string;
  quantity: any;
  total_price: string;
  unit_price: string;
  totalUnit: string;
  sku: string;
}

interface ProductListPackage {
  id?: number;
  product_name: string;
  cost_total: number;
  selling_price: number;
  profit_margin: number;
  profit: number;
}

interface SelectedItem {
  id: number;
  item_name: string;
  unit_price: number;
  quantity_used: number;
  total_cost: number;
}

interface ProductFormData {
  productName: string;
  costTotal: number;
  sellingPrice: number;
  profitMargin: number;
  profit: number;
  photo: File | null;
  selectedItems: SelectedItem[];
}

const addProductWithItems = async (product: Omit<ProductListPackage, 'id'>, selectedItems: SelectedItem[]) => {
  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (productError) {
    throw new Error(productError.message);
  }

  const productItems = selectedItems.map(item => ({
    product_id: productData.id,
    stock_item_id: item.id,
    quantity_used: item.quantity_used,
    unit_price: item.unit_price,
    total_cost: item.total_cost
  }));

  const { error: itemsError } = await supabase
    .from("product_items")
    .insert(productItems);

  if (itemsError) {
    await supabase.from("products").delete().eq("id", productData.id);
    throw new Error(itemsError.message);
  }

  return productData;
};

export const fetchProductsWithItems = async () => {
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
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const categorizeItem = (itemName: string): string => {
  const brand = itemName.split(' ')[0].toLowerCase();
  return ['nabati', 'cadbury', 'apollo'].includes(brand) ? 'Snack' : 'Others';
};

export default function AddProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    costTotal: 0,
    sellingPrice: 0,
    profitMargin: 0,
    profit: 0,
    photo: null,
    selectedItems: [],
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, setShowSuccess] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: stockItems = [], isLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: fetchProducts
  });

  const addProductMutation = useMutation({
    mutationFn: ({ product, selectedItems }: { product: Omit<ProductListPackage, 'id'>, selectedItems: SelectedItem[] }) =>
      addProductWithItems(product, selectedItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsWithItems'] });
      setIsSubmitting(false);
      

      setTimeout(() => {
        setFormData({
          productName: '',
          costTotal: 0,
          sellingPrice: 0,
          profitMargin: 0,
          profit: 0,
          photo: null,
          selectedItems: [],
        });
        setPhotoPreview(null);
        setShowSuccess(false);
        navigate('/product-list');
      }, 1000);
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error adding product: ${error.message}`);
    }
  });

  useEffect(() => {
    const costTotal = formData.selectedItems.reduce((sum, item) => sum + item.total_cost, 0);
    const profit = formData.sellingPrice - costTotal;
    const profitMargin = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;

    setFormData(prev => ({
      ...prev,
      costTotal,
      profit,
      profitMargin
    }));
  }, [formData.selectedItems, formData.sellingPrice]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'sellingPrice') {
      const numValue = value === '' ? 0 : Number(value);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleQuantityChange = (stockItemId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [stockItemId]: quantity
    }));
  };

  const handleAddItem = (stockItem: Product, quantity: number) => {
    const existingItemIndex = formData.selectedItems.findIndex(item => item.id === stockItem.id);

    const unitPrice = parseFloat(stockItem.unit_price);
    const totalCost = unitPrice * quantity;

    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity_used: updatedItems[existingItemIndex].quantity_used + quantity,
        total_cost: updatedItems[existingItemIndex].total_cost + totalCost
      };

      setFormData(prev => ({
        ...prev,
        selectedItems: updatedItems
      }));
    } else {
      const newItem: SelectedItem = {
        id: stockItem.id,
        item_name: stockItem.item_name,
        unit_price: unitPrice,
        quantity_used: quantity,
        total_cost: totalCost
      };

      setFormData(prev => ({
        ...prev,
        selectedItems: [...prev.selectedItems, newItem]
      }));
    }

    setQuantities(prev => ({
      ...prev,
      [stockItem.id]: 0
    }));
  };

  const handleAddAllSelectedItems = () => {
    let addedCount = 0;

    Object.entries(quantities).forEach(([stockItemId, quantity]) => {
      if (quantity > 0) {
        const stockItem = stockItems.find(item => item.id === parseInt(stockItemId));
        if (stockItem && quantity <= stockItem.quantity) {
          handleAddItem(stockItem, quantity);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      alert(`${addedCount} item(s) added successfully!`);
    } else {
      alert('Please select quantities for items you want to add.');
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};
    let isValid = true;

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
      isValid = false;
    }

    if (formData.selectedItems.length === 0) {
      toast.error('Please select at least one item');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      toast.success('Product has been added to inventory.');

      const productData: ProductListPackage = {
        product_name: formData.productName,
        cost_total: formData.costTotal,
        selling_price: formData.sellingPrice,
        profit_margin: formData.profitMargin,
        profit: formData.profit
      };

      addProductMutation.mutate({
        product: productData,
        selectedItems: formData.selectedItems
      });
    }
  };

  const handleCancel = () => {
    navigate('/product-list');
  };

  const getAvailableQuantity = (stockItem: Product) => {
    const selectedItem = formData.selectedItems.find(item => item.id === stockItem.id);
    const usedQuantity = selectedItem ? selectedItem.quantity_used : 0;
    return stockItem.quantity - usedQuantity;
  };

  const isItemAlreadySelected = (stockItemId: number) => {
    return formData.selectedItems.some(item => item.id === stockItemId);
  };

  const filteredStockItems = stockItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group items by category
  const categorizedItems = {
    Snack: filteredStockItems.filter(item => categorizeItem(item.item_name) === 'Snack'),
    Others: filteredStockItems.filter(item => categorizeItem(item.item_name) === 'Others')
  };

  return (
    <>
      <div className="container-fluid py-4 bg-light">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <h1 className={ppH1Custom2}>Add Product</h1>
              <p className={ppMediumMuteText}>Add a new product to your inventory</p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className={ppCardMedium}>
                  <div>
                    <div className="mb-3">
                      <label htmlFor="productName" className="form-label">Product Name</label>
                      <input
                        type="text"
                        className={`${ppGlobalInput} ${errors.productName ? 'is-invalid' : ''}`}
                        id="productName"
                        name="productName"
                        placeholder="Enter product name"
                        value={formData.productName}
                        onChange={handleInputChange}
                      />
                      {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                    </div>

                    {/* Selected Items Section */}
                    <div className="mb-3">
                      <label className="form-label">Selected Items</label>
                      <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                        {formData.selectedItems.length === 0 ? (
                          <p className="text-muted mb-0">No items selected</p>
                        ) : (
                          <div>
                            {formData.selectedItems.map((item, index) => (
                              <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                                <div>
                                  <strong>{item.item_name}</strong>
                                  <br />
                                  <small className="text-muted">
                                    Qty: {item.quantity_used} × RM{item.unit_price} = RM{item.total_cost.toFixed(2)}
                                  </small>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <div className="mt-2 p-2 bg-info bg-opacity-10 rounded">
                              <strong>Total Items Cost: RM{formData.costTotal.toFixed(2)}</strong>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm mt-2"
                          onClick={() => {
                            setShowItemSelector(true);
                            setQuantities({});
                            setSearchTerm('');
                          }}
                        >
                          Add Items
                        </button>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="costTotal" className="form-label">Cost Total (RM)</label>
                        <input
                          type="text"
                          className={ppGlobalInputDisabled}
                          id="costTotal"
                          value={`RM${formData.costTotal.toFixed(2)}`}
                          readOnly
                        />
                        <small className="text-muted">Automatically calculated from selected items</small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="sellingPrice" className="form-label">Selling Price (RM)</label>
                        <div className="input-group">
                          <input
                            type="number"
                            step="0.01"
                            className={`${ppGlobalInput} ${errors.sellingPrice ? 'is-invalid' : ''}`}
                            id="sellingPrice"
                            name="sellingPrice"
                            placeholder="0.00"
                            value={formData.sellingPrice || ''}
                            onChange={handleInputChange}
                          />
                          {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="profitMargin" className="form-label">Profit Margin (%)</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`${ppGlobalInputDisabled} ${formData.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}
                            id="profitMargin"
                            value={`${formData.profitMargin.toFixed(2)}%`}
                            readOnly
                          />
                        </div>
                        <small className="text-muted">Automatically calculated</small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="profit" className="form-label">Profit (RM)</label>
                        <input
                          type="text"
                          className={`${ppGlobalInputDisabled} ${formData.profit >= 0 ? 'text-success' : 'text-danger'}`}
                          id="profit"
                          value={`RM${formData.profit.toFixed(2)}`}
                          readOnly
                        />
                        <small className="text-muted">Automatically calculated</small>
                      </div>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                      <button type="button" className={ppButtonCancel} onClick={handleCancel}>Cancel</button>
                      <button
                        type="button"
                        className={ppButtonYellow}
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : 'Add Product'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0 bg-white">
                <div className="card-body">
                  <h5 className="card-title">Product Summary</h5>
                  <hr />
                  {photoPreview && (
                    <div className="mb-3">
                      <small className="text-muted">Product Photo</small>
                      <img src={photoPreview} alt="Product" width="100%" />
                    </div>
                  )}
                  <div className="mb-3">
                    <small className="text-muted">Product Name</small>
                    <p className="mb-1 fw-bold">{formData.productName || '---'}</p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Selected Items</small>
                    <p className="mb-1 fw-bold">{formData.selectedItems.length} item(s)</p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Cost Total</small>
                    <p className="mb-1 fw-bold">RM{formData.costTotal.toFixed(2)}</p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Selling Price</small>
                    <p className="mb-1 fw-bold">RM{formData.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Profit</small>
                    <p className={`mb-1 fw-bold ${formData.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      RM{formData.profit.toFixed(2)}
                    </p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Profit Margin</small>
                    <p className={`mb-1 fw-bold ${formData.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formData.profitMargin.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0 bg-light mt-3">
                <div className="card-body">
                  <h6 className="card-title">Need Help?</h6>
                  <p className="small text-muted">
                    Contact our support team if you need any assistance with adding products to your inventory.
                  </p>
                  <a href="/" className="btn btn-outline-primary btn-sm">Contact Support</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Item Selector Modal */}
        {showItemSelector && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Select Items from Stock</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowItemSelector(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Tip:</strong> Set quantities for multiple items and click "Add All Selected Items" to add them all at once.
                  </div>

                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by item name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {searchTerm && (
                      <small className="text-muted">
                        Showing {filteredStockItems.length} of {stockItems.length} items
                      </small>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading stock items...</p>
                    </div>
                  ) : (
                    <div>
                      {Object.entries(categorizedItems).map(([category, items]) => {
                        if (items.length === 0) return null;

                        return (
                          <div key={category} className="mb-4">
                            <h5 className="border-bottom pb-2 mb-3">{category}</h5>
                            <div className="row">
                              {items.map((stockItem) => {
                                const availableQty = getAvailableQuantity(stockItem);
                                const isSelected = isItemAlreadySelected(stockItem.id);

                                return (
                                  <div key={stockItem.id} className="col-lg-6 col-xl-4 mb-3">
                                    <div className={`card h-100 shadow-sm ${isSelected ? 'border-success' : ''}`}>
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title text-primary mb-0">{stockItem.item_name}</h6>
                                          {isSelected && (
                                            <span className="badge bg-success">Selected</span>
                                          )}
                                        </div>
                                        <div className="mb-3">
                                          <small className="text-muted d-block">
                                            <strong>SKU:</strong> {stockItem.sku}
                                          </small>
                                          <small className="text-muted d-block">
                                            <strong>Unit Price:</strong> RM{stockItem.unit_price}
                                          </small>
                                          <small className="text-muted d-block">
                                            <strong>Available:</strong> {availableQty} units
                                            {isSelected && ` (${stockItem.quantity - availableQty} already selected)`}
                                          </small>
                                        </div>

                                        <div className="row g-2">
                                          <div className="col-8">
                                            <input
                                              type="number"
                                              className="form-control form-control-sm"
                                              placeholder="Qty"
                                              min="0"
                                              max={availableQty}
                                              value={quantities[stockItem.id] || ''}
                                              onChange={(e) => handleQuantityChange(stockItem.id, parseInt(e.target.value) || 0)}
                                              disabled={availableQty === 0}
                                            />
                                          </div>
                                          <div className="col-4">
                                            <button
                                              className="btn btn-outline-primary btn-sm w-100"
                                              type="button"
                                              disabled={!quantities[stockItem.id] || quantities[stockItem.id] <= 0 || quantities[stockItem.id] > availableQty}
                                              onClick={() => {
                                                const quantity = quantities[stockItem.id];
                                                if (quantity > 0 && quantity <= availableQty) {
                                                  handleAddItem(stockItem, quantity);
                                                }
                                              }}
                                            >
                                              Add
                                            </button>
                                          </div>
                                        </div>

                                        {quantities[stockItem.id] > 0 && (
                                          <small className="text-success d-block mt-1">
                                            Total: RM{(parseFloat(stockItem.unit_price) * quantities[stockItem.id]).toFixed(2)}
                                          </small>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <div className="me-auto">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleAddAllSelectedItems}
                      disabled={Object.values(quantities).every(qty => qty <= 0)}
                    >
                      Add All Selected Items
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowItemSelector(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}