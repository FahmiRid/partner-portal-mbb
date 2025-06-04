import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  // Detect device theme preference
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    const savedIsSystemTheme = localStorage.getItem('isSystemTheme');
    
    if (savedTheme && savedIsSystemTheme === 'false') {
      // User has manually set a theme
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      setIsSystemTheme(false);
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
      return;
    }

    // Use system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme
    setIsDarkMode(mediaQuery.matches);
    setIsSystemTheme(true);
    
    // Apply Bootstrap theme
    document.documentElement.setAttribute(
      'data-bs-theme', 
      mediaQuery.matches ? 'dark' : 'light'
    );

    // Listen for changes in system theme (only if using system theme)
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (isSystemTheme) {
        setIsDarkMode(e.matches);
        document.documentElement.setAttribute(
          'data-bs-theme', 
          e.matches ? 'dark' : 'light'
        );
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup listener
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [isSystemTheme]);

  // Toggle dark mode manually
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    setIsSystemTheme(false);
    
    const themeString = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', themeString);
    
    // Save user preference
    localStorage.setItem('theme', themeString);
    localStorage.setItem('isSystemTheme', 'false');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={toggleDarkMode} 
        />
        <Toaster 
          position="top-center" 
          richColors
          theme={isDarkMode ? 'dark' : 'light'}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<PPHomepage />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/stock-list" element={<Stock />} />
          <Route path="/add-stock" element={<AddStock />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-stock/:id" element={<EditStock />} />
          <Route path="/edit-product/:productId" element={<EditProduct />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;