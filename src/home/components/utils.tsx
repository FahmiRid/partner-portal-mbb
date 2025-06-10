import { useNavigate } from 'react-router-dom';

export const QuickAction = () => {
     const navigate = useNavigate();
    const handleClickAddProduct = () => {
        navigate('/add-product');
    };

    const handleClickAddStock = () => {
        navigate('/add-stock');
    };
    return (
        <div className="row">
            <div className="col-sm-6 mb-3 mb-sm-0">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Add Stock</h5>
                        <p className="card-text">Quick access add new stock.</p>
                        <a href="#" onClick={handleClickAddStock} className="btn btn-primary">Add Stock</a>
                    </div>
                </div>
            </div>
            <div className="col-sm-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Add Product</h5>
                        <p className="card-text">Quick access add new product.</p>
                        <a href="#" onClick={handleClickAddProduct} className="btn btn-primary">Add product</a>
                    </div>
                </div>
            </div>
        </div>
    );
};