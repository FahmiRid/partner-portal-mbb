import React, { useState, useEffect, ChangeEvent } from 'react';

interface ProductFormData {
  productName: string;
  quantity: any;
  price: any;
  totalUnit: number;
  sku: string;
}

export default function AddProduct() {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    quantity: 1,
    price: 0,
    totalUnit: 0,
    sku: ''
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Calculate total unit when quantity changes (assuming 0.20 per unit)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalUnit: Number((prev.quantity * prev.price).toFixed(2))
    }));
  }, [formData.quantity, formData.price]);
  

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'price') {
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
    const newErrors: Partial<ProductFormData> = {};
    let isValid = true;

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
      isValid = false;
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
      isValid = false;
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
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
      
      // Simulating API call
      setTimeout(() => {
        console.log('Product submitted:', formData);
        setIsSubmitting(false);
        setShowSuccess(true);
        
        // Reset form after showing success message
        setTimeout(() => {
          setFormData({
            productName: '',
            quantity: 1,
            price: 0,
            totalUnit: 0.00,
            sku: ''
          });
          setShowSuccess(false);
        }, 3000);
      }, 1000);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold text-success">Add Product</h1>
            <p className="text-muted lead">Add a new product to your inventory</p>
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
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">Product Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.productName ? 'is-invalid' : ''}`}
                      id="productName"
                      name="productName"
                      placeholder="Enter product name"
                      value={formData.productName}
                      onChange={handleInputChange}
                    />
                    {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="quantity" className="form-label">Quantity</label>
                      <input
                        type="number"
                        className={`form-control form-control-lg ${errors.quantity ? 'is-invalid' : ''}`}
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
                      <label htmlFor="price" className="form-label">Price ($)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control form-control-lg ${errors.price ? 'is-invalid' : ''}`}
                          id="price"
                          name="price"
                          placeholder="0.00"
                          value={formData.price || ''}
                          onChange={handleInputChange}
                        />
                        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="totalUnit" className="form-label">Total Unit</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          id="totalUnit"
                          value={formData.totalUnit.toFixed(2)}
                          readOnly
                        />
                        <span className="input-group-text">units</span>
                      </div>
                      <small className="text-muted">Automatically calculated</small>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="sku" className="form-label">SKU</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.sku ? 'is-invalid' : ''}`}
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
                    <button type="button" className="btn btn-outline-secondary btn-lg px-4">Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg px-4" 
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
                <div className="mb-3">
                  <small className="text-muted">Product Name</small>
                  <p className="mb-1 fw-bold">{formData.productName || '---'}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Quantity</small>
                  <p className="mb-1 fw-bold">{formData.quantity}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Price</small>
                  <p className="mb-1 fw-bold">${formData.price.toFixed(2)}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Total Unit</small>
                  <p className="mb-1 fw-bold">{formData.totalUnit.toFixed(2)}</p>
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
                <a href="#" className="btn btn-outline-primary btn-sm">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}