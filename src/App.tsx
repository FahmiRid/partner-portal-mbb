import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Login/login';
import PPHomepage from './home/ppHomepage';
import Navbar from './navbar/navbar';
import ProductList from './product/productList';
import AddProduct from './product/addProduct';
import Stock from './product/stock';
import AddStock from './product/addStock';
import EditStock from './product/editStock';
import EditProduct from './product/editProduct';
import { Toaster } from 'sonner'

function App() {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" richColors/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PPHomepage />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/stock-list" element={<Stock />} />
        <Route path="/add-stock" element={<AddStock />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-stock/:id" element={<EditStock />} />
        <Route path="/edit-product/:productId" element={<EditProduct />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
