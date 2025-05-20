import React, { useState, useEffect, ChangeEvent } from 'react';
import { ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput, ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText } from '../stylesStore/stylesGlobal';
import './styles/addProduct.scss';
import supabase from '../mocks/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface stockFormData {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku: string;
  // photo: File | null;
  item: string;
}

export default function AddStock() {
  const [formData, setFormData] = useState<stockFormData>({
    item_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    sku: '',
    // photo: null,
    item: '',
  });

  const [errors, setErrors] = useState<Partial<stockFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Access the QueryClient instance
  const queryClient = useQueryClient();

  // Create mutation for adding stock to Supabase
  const addStockMutation = useMutation({
    mutationFn: async (newStock: Omit<stockFormData, 'item'>) => {
      const { data, error } = await supabase
        .from('stock')
        .insert([newStock])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch stocks list query
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setShowSuccess(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        setFormData({
          item_name: '',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
          sku: '',
          item: '',
        });
        setPhotoPreview(null);
        setShowSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      console.error('Error adding stock:', error);
      alert('Failed to add stock. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Calculate total price when quantity or unit_price changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_price: Number((prev.quantity * prev.unit_price).toFixed(2))
    }));
  }, [formData.quantity, formData.unit_price]);

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
    const newErrors: Partial<stockFormData> = {};
    let isValid = true;

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Product name is required';
      isValid = false;
    }

    // if (formData.quantity <= 0) {
    //   newErrors.quantity = 'Quantity must be greater than 0';
    //   isValid = false;
    // }

    // if (formData.unit_price <= 0) {
    //   newErrors.unit_price = 'Price must be greater than 0';
    //   isValid = false;
    // }

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
      addStockMutation.mutate(stockData);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className={ppH1Custom2}>Add Stock</h1>
            <p className={ppMediumMuteText}>Add a new product to your inventory</p>
          </div>
        </div>

        {showSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Product has been added to inventory.
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
                          value={formData.total_price.toFixed(2)}
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
                    <button type="button" className={ppButtonCancel}>Cancel</button>
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
                      ) : 'Add Product'}
                    </button>
                  </div>
                </form>
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
                  <p className="mb-1 fw-bold">{formData.item_name || '---'}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Item</small>
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
                  Contact our support team if you need any assistance with adding products to your inventory.
                </p>
                <a href="/" className="btn btn-outline-primary btn-sm">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}