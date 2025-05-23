import React, { useState, useEffect, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput, ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText } from '../stylesStore/stylesGlobal';
import { fetchProducts } from '../hooks/useStock';
import './styles/addProduct.scss';
import { fetchProductItem, updateProductItem, ProductEditFormData } from '../hooks/useEditProduct';

interface Product {
  id: number;
  item_name: string;
  quantity: any;
  total_price: string;
  unit_price: string;
  totalUnit: string;
  sku: string;
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

export default function EditProduct() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState<boolean>(false);

  // Fetch product data
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductItem(Number(productId)),
    enabled: !!productId,
  });

  // Fetch stock items
  const { data: stockItems = [], isLoading: isStockLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: fetchProducts
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct: Omit<ProductEditFormData, 'id'>) => 
      updateProductItem(Number(productId), updatedProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/products'); // Redirect after successful update
      }, 2000);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      alert(`Error updating product: ${error.message}`);
    }
  });

  useEffect(() => {
    if (productData) {
        console.log('Product data:', productData); // Debug
        
        setFormData(prev => ({
            ...prev,
            productName: productData.product_name || '',
            costTotal: productData.cost_total || 0,
            sellingPrice: productData.selling_price || 0,
            profitMargin: productData.profit_margin || 0,
            profit: productData.profit || 0,
            // Keep existing selectedItems if any
            selectedItems: prev.selectedItems
        }));
        
        if (productData.photo_url) {
            setPhotoPreview(productData.photo_url);
        }
    }
}, [productData]);

  // Calculate totals when items or selling price changes
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

  const handleAddItem = (stockItem: Product, quantity: number) => {
    const unitPrice = parseFloat(stockItem.unit_price);
    const totalCost = unitPrice * quantity;

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
    setShowItemSelector(false);
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
      alert('Please select at least one item');
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);

      const productData: ProductEditFormData = {
        product_name: formData.productName,
        cost_total: formData.costTotal,
        selling_price: formData.sellingPrice,
        profit_margin: formData.profitMargin,
        profit: formData.profit
      };

      updateProductMutation.mutate(productData);
    }
  };


  if (isProductLoading) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className={ppH1Custom2}>Edit Product</h1>
            <p className={ppMediumMuteText}>Edit product in your inventory</p>
          </div>
        </div>

        {showSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Product has been updated.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setShowSuccess(false)}></button>
          </div>
        )}

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
                        onClick={() => setShowItemSelector(true)}
                      >
                        Add Item
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
                    <button 
                      type="button" 
                      className={ppButtonCancel}
                      onClick={() => navigate('/products')}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={ppButtonYellow}
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : 'Update Product'}
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
                    <img src={photoPreview} alt="Product" width="100%" className="img-thumbnail" />
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
                  Contact our support team if you need any assistance with editing products in your inventory.
                </p>
                <a href="/" className="btn btn-outline-primary btn-sm">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Selector Modal */}
      {showItemSelector && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
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
                {isStockLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading stock items...</p>
                  </div>
                ) : (
                  <div className="row">
                    {stockItems.map((stockItem) => (
                      <div key={stockItem.id} className="col-md-6 mb-3">
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <h6 className="card-title text-primary">{stockItem.item_name}</h6>
                            <div className="mb-3">
                              <small className="text-muted d-block">
                                <strong>SKU:</strong> {stockItem.sku}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Unit Price:</strong> RM{stockItem.unit_price}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Available:</strong> {stockItem.quantity} units
                              </small>
                            </div>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                min="1"
                                max={stockItem.quantity}
                                id={`qty-${stockItem.id}`}
                              />
                              <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => {
                                  const qtyInput = document.getElementById(`qty-${stockItem.id}`) as HTMLInputElement;
                                  const quantity = parseInt(qtyInput.value);
                                  if (quantity > 0 && quantity <= stockItem.quantity) {
                                    handleAddItem(stockItem, quantity);
                                    qtyInput.value = '';
                                  } else {
                                    alert('Please enter a valid quantity');
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowItemSelector(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}