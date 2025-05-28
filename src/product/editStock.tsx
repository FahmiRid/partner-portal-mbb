// src/components/EditStock.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput,
  ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText
} from '../stylesStore/stylesGlobal';
import { fetchStockItem, updateStockItem ,StockFormData } from '../hooks/useEditStock'; 

export default function EditStock() {
  const { id } = useParams<{ id: string }>();
  const stockId = id ? parseInt(id) : 0;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<StockFormData>({
    item_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    sku: '',
    item: '',
  });

  const [originalQuantity, setOriginalQuantity] = useState<number>(0);
  const [quantityReduction, setQuantityReduction] = useState<number>(0);
  const [updateMode, setUpdateMode] = useState<'direct' | 'reduction'>('direct');

  const [errors, setErrors] = useState<Partial<StockFormData & { quantityReduction: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Use Query to fetch the specific stock item
  const { 
    data: stockItem, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    queryKey: ['stock', stockId],
    queryFn: () => fetchStockItem(stockId), // Call the API function
    enabled: !!stockId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (stockItem) {
      const quantity = Number(stockItem.quantity) || 1;
      setFormData({
        item_name: stockItem.item_name || '',
        quantity: quantity,
        unit_price: Number(stockItem.unit_price) || 0,
        total_price: Number(stockItem.total_price) || 0,
        sku: stockItem.sku || '',
        item: stockItem.item || '',
      });
      setOriginalQuantity(quantity);
    }
  }, [stockItem]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_price: Number((prev.quantity * prev.unit_price).toFixed(2))
    }));
  }, [formData.quantity, formData.unit_price]);

  // Update quantity when reduction amount changes
  useEffect(() => {
    if (updateMode === 'reduction') {
      const newQuantity = Math.max(0, originalQuantity - quantityReduction);
      setFormData(prev => ({
        ...prev,
        quantity: newQuantity
      }));
    }
  }, [quantityReduction, originalQuantity, updateMode]);

  const updateStockMutation = useMutation({
    mutationFn: (updatedStock: Omit<StockFormData, 'item'>) => updateStockItem(stockId, updatedStock), // Call the API function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock', stockId] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/stock-list');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity' || name === 'unit_price') {
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

  const handleQuantityReductionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    setQuantityReduction(Math.max(0, value));
  };

  const handleUpdateModeChange = (mode: 'direct' | 'reduction') => {
    setUpdateMode(mode);
    setErrors({}); // Clear errors when switching modes
    
    if (mode === 'direct') {
      setQuantityReduction(0);
      // Reset to original quantity when switching back to direct mode
      setFormData(prev => ({
        ...prev,
        quantity: originalQuantity
      }));
    } else {
      // When switching to reduction mode, reset reduction amount
      setQuantityReduction(0);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StockFormData & { quantityReduction: string }> = {};
    let isValid = true;

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Product name is required';
      isValid = false;
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
      isValid = false;
    }

    if (updateMode === 'reduction') {
      if (quantityReduction > originalQuantity) {
        newErrors.quantityReduction = `Cannot reduce more than available quantity (${originalQuantity})`;
        isValid = false;
      }
      if (quantityReduction < 0) {
        newErrors.quantityReduction = 'Reduction amount cannot be negative';
        isValid = false;
      }
    } else {
      
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      const stockData = {
        item_name: formData.item_name,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.total_price,
        sku: formData.sku
      };

      updateStockMutation.mutate(stockData);
    }
  };

  const handleCancel = () => {
    navigate('/stock-list');
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          Error loading stock data: {fetchError instanceof Error ? fetchError.message : 'Unknown error'}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Stock List
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className={ppH1Custom2}>Edit Stock</h1>
            <p className={ppMediumMuteText}>Update stock information</p>
          </div>
        </div>

        {showSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Stock has been updated.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setShowSuccess(false)}></button>
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className={ppCardMedium}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="item_name" className="form-label">Item Name</label>
                    <input
                      type="text"
                      className={`${ppGlobalInput} ${errors.item_name ? 'is-invalid' : ''}`}
                      id="item_name"
                      name="item_name"
                      placeholder="Enter product name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                    />
                    {errors.item_name && <div className="invalid-feedback">{errors.item_name}</div>}
                  </div>

                  {/* Quantity Update Mode Selection */}
                  <div className="mb-3">
                    <label className="form-label">Quantity Update Mode</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="updateMode"
                          id="directMode"
                          checked={updateMode === 'direct'}
                          onChange={() => handleUpdateModeChange('direct')}
                        />
                        <label className="form-check-label" htmlFor="directMode">
                          Direct Update
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="updateMode"
                          id="reductionMode"
                          checked={updateMode === 'reduction'}
                          onChange={() => handleUpdateModeChange('reduction')}
                        />
                        <label className="form-check-label" htmlFor="reductionMode">
                          Quantity Reduction
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      {updateMode === 'direct' 
                        ? 'Set the exact quantity value' 
                        : 'Specify how much quantity to reduce from current stock'
                      }
                    </small>
                  </div>

                  <div className="row mb-3">
                    {updateMode === 'direct' ? (
                      <div className="col-md-6">
                        <label htmlFor="quantity" className="form-label">Quantity</label>
                        <input
                          type="number"
                          className={`${ppGlobalInput} ${errors.quantity ? 'is-invalid' : ''}`}
                          id="quantity"
                          name="quantity"
                          min="0"
                          placeholder="Enter quantity"
                          value={formData.quantity || ''}
                          onChange={handleInputChange}
                        />
                        {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                      </div>
                    ) : (
                      <div className="col-md-6">
                        <label htmlFor="quantityReduction" className="form-label">
                          Quantity to Reduce
                        </label>
                        <input
                          type="number"
                          className={`${ppGlobalInput} ${errors.quantityReduction ? 'is-invalid' : ''}`}
                          id="quantityReduction"
                          min="0"
                          max={originalQuantity}
                          placeholder="Enter amount to reduce"
                          value={quantityReduction || ''}
                          onChange={handleQuantityReductionChange}
                        />
                        {errors.quantityReduction && <div className="invalid-feedback">{errors.quantityReduction}</div>}
                        <small className="text-muted">
                          Current stock: {originalQuantity} | After reduction: {formData.quantity}
                        </small>
                      </div>
                    )}

                    <div className="col-md-6">
                      <label htmlFor="unit_price" className="form-label">Price (RM)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.01"
                          className={`${ppGlobalInput} ${errors.unit_price ? 'is-invalid' : ''}`}
                          id="unit_price"
                          name="unit_price"
                          placeholder="0.00"
                          value={formData.unit_price || ''}
                          onChange={handleInputChange}
                        />
                        {errors.unit_price && <div className="invalid-feedback">{errors.unit_price}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="total_price" className="form-label">Total Unit</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={ppGlobalInputDisabled}
                          id="total_price"
                          value={`RM${formData.total_price.toFixed(2)}`}
                          readOnly
                        />
                      </div>
                      <small className="text-muted">Automatically calculated</small>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sku" className="form-label">SKU</label>
                      <input
                        type="text"
                        className={`${ppGlobalInput} ${errors.sku ? 'is-invalid' : ''}`}
                        id="sku"
                        name="sku"
                        placeholder="Enter SKU code"
                        value={formData.sku}
                        onChange={handleInputChange}
                      />
                      {errors.sku && <div className="invalid-feedback">{errors.sku}</div>}
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                    <button
                      type="button"
                      className={ppButtonCancel}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={ppButtonYellow}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Update Stock'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 bg-white">
              <div className="card-body">
                <h5 className="card-title">Stock Summary</h5>
                <hr />
                <div className="mb-3">
                  <small className="text-muted">Product Name</small>
                  <p className="mb-1 fw-bold">{formData.item_name || '---'}</p>
                </div>
                {updateMode === 'reduction' && (
                  <div className="mb-3">
                    <small className="text-muted">Original Quantity</small>
                    <p className="mb-1 fw-bold text-muted">{originalQuantity}</p>
                  </div>
                )}
                {updateMode === 'reduction' && quantityReduction > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">Quantity Reduced</small>
                    <p className="mb-1 fw-bold text-danger">-{quantityReduction}</p>
                  </div>
                )}
                <div className="mb-3">
                  <small className="text-muted">
                    {updateMode === 'reduction' ? 'New Quantity' : 'Quantity'}
                  </small>
                  <p className={`mb-1 fw-bold ${updateMode === 'reduction' && quantityReduction > 0 ? 'text-success' : ''}`}>
                    {formData.quantity}
                  </p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Price</small>
                  <p className="mb-1 fw-bold">RM{formData.unit_price.toFixed(2)}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Total Unit</small>
                  <p className="mb-1 fw-bold">RM{formData.total_price.toFixed(2)}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">SKU</small>
                  <p className="mb-1 fw-bold">{formData.sku || '---'}</p>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 bg-light mt-3">
              <div className="card-body">
                <h6 className="card-title">Need Help?</h6>
                <p className="small text-muted">
                  Contact our support team if you need any assistance with updating your inventory.
                </p>
                <a href="/support" className="btn btn-outline-primary btn-sm">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}