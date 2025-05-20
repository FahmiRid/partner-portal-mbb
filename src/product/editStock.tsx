import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput,
  ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText
} from '../stylesStore/stylesGlobal';
import supabase from '../mocks/supabase';

interface StockFormData {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku: string;
  item: string;
}

export default function EditStock() {
  // Get the stock ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const stockId = id ? parseInt(id) : 0;
  const navigate = useNavigate();

  // Initialize form state
  const [formData, setFormData] = useState<StockFormData>({
    item_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    sku: '',
    item: '',
  });

  const [errors, setErrors] = useState<Partial<StockFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Access the QueryClient instance
  const queryClient = useQueryClient();

  // Fetch the stock data for the specific item
  const fetchStockItem = async () => {
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

  // Use Query to fetch the specific stock item
  const { 
    data: stockItem, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    queryKey: ['stock', stockId],
    queryFn: fetchStockItem,
    enabled: !!stockId, // Only run the query if we have a stockId
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
  });

  // Populate form when stock data is loaded
  useEffect(() => {
    if (stockItem) {
      setFormData({
        item_name: stockItem.item_name || '',
        quantity: Number(stockItem.quantity) || 1,
        unit_price: Number(stockItem.unit_price) || 0,
        total_price: Number(stockItem.total_price) || 0,
        sku: stockItem.sku || '',
        item: stockItem.item || '',
      });
    }
  }, [stockItem]);

  // Calculate total price when quantity or unit_price changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_price: Number((prev.quantity * prev.unit_price).toFixed(2))
    }));
  }, [formData.quantity, formData.unit_price]);

  // Create mutation for updating stock in Supabase
  const updateStockMutation = useMutation({
    mutationFn: async (updatedStock: Omit<StockFormData, 'item'>) => {
      const { data, error } = await supabase
        .from('stock') // Make sure this matches your actual table name
        .update(updatedStock)
        .eq('id', stockId)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch stocks list query
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Match the key used in Stock component
      queryClient.invalidateQueries({ queryKey: ['stock', stockId] });
      setShowSuccess(true);

      // Navigate away or reset form after showing success message
      setTimeout(() => {
        navigate('/stock-list'); // Navigate back to stock list after success
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

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StockFormData> = {};
    let isValid = true;

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Product name is required';
      isValid = false;
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Prepare the data for Supabase (exclude the 'item' field as it's not in the DB table)
      const stockData = {
        item_name: formData.item_name,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.total_price,
        sku: formData.sku
      };

      // Execute the mutation
      updateStockMutation.mutate(stockData);
    }
  };

  const handleCancel = () => {
    navigate('/'); // Navigate back to stock list
  };

  // Show loading state
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

  // Show error state
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

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="quantity" className="form-label">Quantity</label>
                      <input
                        type="number"
                        className={`${ppGlobalInput} ${errors.quantity ? 'is-invalid' : ''}`}
                        id="quantity"
                        name="quantity"
                        min="1"
                        placeholder="Enter quantity"
                        value={formData.quantity || ''}
                        onChange={handleInputChange}
                      />
                      {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                    </div>

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

                  <div className="mb-3">
                    <label htmlFor="item" className="form-label">Item Category</label>
                    <select
                      className={ppGlobalInput}
                      id="item"
                      name="item"
                      value={formData.item}
                      onChange={handleSelectChange}
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </select>
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
                <div className="mb-3">
                  <small className="text-muted">Item Category</small>
                  <p className="mb-1 fw-bold">{formData.item || '---'}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Quantity</small>
                  <p className="mb-1 fw-bold">{formData.quantity}</p>
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