import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Login/login';
import PPHomepage from './home/ppHomepage';
import Navbar from './navbar/navbar';
import ProductList from './product/productList';
import AddProduct from './product/addProduct';

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
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PPHomepage />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
