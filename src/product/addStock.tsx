import React, { useState, useEffect, ChangeEvent } from 'react';
import { ppButtonCancel, ppButtonYellow, ppCardMedium, ppGlobalInput, ppGlobalInputDisabled, ppH1Custom2, ppMediumMuteText } from '../stylesStore/stylesGlobal';
import './styles/addProduct.scss';
import supabase from '../mocks/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface stockFormData {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku: string;
  // photo: File | null;
  item: string;
}
declare global {
  interface Window {
    addStockActivity?: (type: 'add' | 'update' | 'delete', productName: string, details: string) => void;
  }
}

export default function AddStock() {
  const navigate = useNavigate();
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
 
  // Detect current theme
  const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  // Access the QueryClient instance
  const queryClient = useQueryClient();

  // Enhanced function to trigger notification
  const triggerAddNotification = (productName: string, quantity: number, price: number) => {
    const addInfo = {
      productName,
      details: `Quantity: ${quantity}, Price: RM${price.toFixed(2)}`,
      timestamp: Date.now(),
      type: 'add' as const
    };

    console.log('Triggering add notification for:', productName);

    // Method 1: Direct function call (most reliable for same window)
    if (window.addStockActivity) {
      console.log('Using direct function call');
      window.addStockActivity('add', productName, addInfo.details);
    }

    // Method 2: Custom events (backup for same-window communication)
    try {
      const customEvent = new CustomEvent('stockAdded', {
        detail: addInfo
      });
      window.dispatchEvent(customEvent);
      console.log('Dispatched custom event');
    } catch (error) {
      console.error('Error dispatching custom event:', error);
    }

    // Method 3: localStorage approach with enhanced data
    try {
      localStorage.setItem('stockActivityTrigger', JSON.stringify(addInfo));
      console.log('Set localStorage trigger:', addInfo);

      // Also set a simple flag that can be easily detected
      localStorage.setItem('newStockAdded', JSON.stringify({
        productName,
        timestamp: Date.now()
      }));

      // Force a storage event for same-window detection
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stockActivityTrigger',
        newValue: JSON.stringify(addInfo),
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      }));

    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

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
    onSuccess: (data) => {
      console.log('Stock added successfully:', data);

      // Invalidate and refetch stocks list query
      queryClient.invalidateQueries({ queryKey: ['stocks'] });

      // Trigger notification AFTER successful database insert
      // Add a small delay to ensure the query invalidation is processed
      setTimeout(() => {
        triggerAddNotification(
          formData.item_name,
          formData.quantity,
          formData.unit_price
        );
      }, 100);

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

        // Navigate back to stock list after successful addition
        navigate('/stock-list');
      }, 2000);
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

  const validateForm = (): boolean => {
    const newErrors: Partial<stockFormData> = {};
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

      const stockData = {
        item_name: formData.item_name,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.total_price,
        sku: formData.sku
      };

      // The notification will be triggered in the onSuccess callback
      addStockMutation.mutate(stockData);
    }
  };

  const handleCancel = () => {
    navigate('/stock-list');
  };

  return (
    <div className={`container-fluid py-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className={`${ppH1Custom2} ${isDarkMode ? 'text-white' : ''}`}>Add Stock</h1>
            <p className={`${ppMediumMuteText} ${isDarkMode ? 'text-light' : ''}`}>Add a new product to your inventory</p>
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
            <div className={`card shadow-sm border-0 ${isDarkMode ? 'bg-dark' : ''}`}>
              <div className={`${ppCardMedium} ${isDarkMode ? 'text-light' : ''}`}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="item_name" className={`form-label ${isDarkMode ? 'text-light' : ''}`}>Item Name</label>
                    <input
                      type="text"
                      className={`${ppGlobalInput} ${errors.item_name ? 'is-invalid' : ''} ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      id="item_name"
                      name="item_name"
                      placeholder="Enter product name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                      // style={isDarkMode ? { color: '#6c757d' } : {}}
                    />
                    {errors.item_name && <div className="invalid-feedback">{errors.item_name}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="quantity" className={`form-label ${isDarkMode ? 'text-light' : ''}`}>Quantity</label>
                      <input
                        type="number"
                        className={`${ppGlobalInput} ${errors.quantity ? 'is-invalid' : ''} ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
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
                      <label htmlFor="unit_price" className={`form-label ${isDarkMode ? 'text-light' : ''}`}>Price (RM)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.01"
                          className={`${ppGlobalInput} ${errors.unit_price ? 'is-invalid' : ''} ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
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
                      <label htmlFor="total_price" className={`form-label ${isDarkMode ? 'text-light' : ''}`}>Total Unit</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`${ppGlobalInputDisabled} ${isDarkMode ? 'bg-secondary text-dark border-secondary' : ''}`}
                          id="total_price"
                          value={formData.total_price.toFixed(2)}
                          readOnly
                        />
                      </div>
                      <small className={isDarkMode ? 'text-muted' : 'text-muted'}>Automatically calculated</small>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sku" className={`form-label ${isDarkMode ? 'text-light' : ''}`}>SKU</label>
                      <input
                        type="text"
                        className={`${ppGlobalInput} ${errors.sku ? 'is-invalid' : ''} ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
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
                    <button type="button" className={ppButtonCancel} onClick={handleCancel}>Cancel</button>
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
            <div className={`card shadow-sm border-0 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
              <div className={`card-body ${isDarkMode ? 'text-light' : ''}`}>
                <h5 className={`card-title ${isDarkMode ? 'text-light' : ''}`}>Product Summary</h5>
                <hr className={isDarkMode ? 'border-secondary' : ''} />
                {photoPreview && (
                  <div className="mb-3">
                    <small className="text-muted">Product Photo</small>
                    <img src={photoPreview} alt="Product" width="100%" />
                  </div>
                )}
                <div className="mb-3">
                  <small className="text-muted">Product Name</small>
                  <p className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : ''}`}>{formData.item_name || '---'}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Quantity</small>
                  <p className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : ''}`}>{formData.quantity}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Price</small>
                  <p className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : ''}`}>RM{formData.unit_price.toFixed(2)}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Total Unit</small>
                  <p className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : ''}`}>RM{formData.total_price.toFixed(2)}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">SKU</small>
                  <p className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : ''}`}>{formData.sku || '---'}</p>
                </div>
              </div>
            </div>

            <div className={`card shadow-sm border-0 mt-3 ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
              <div className={`card-body ${isDarkMode ? 'text-light' : ''}`}>
                <h6 className={`card-title ${isDarkMode ? 'text-light' : ''}`}>Need Help?</h6>
                <p className={`small ${isDarkMode ? 'text-light' : 'text-muted'}`}>
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