import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Login/login';
import PPHomepage from './home/ppHomepage';
import Navbar from './navbar/navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PPHomepage />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
