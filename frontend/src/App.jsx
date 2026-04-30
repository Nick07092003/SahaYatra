// frontend/src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostRide from './pages/PostRide';
import SearchRides from './pages/SearchRides';
import ManageRides from './pages/ManageRides';
import MyBookings from './pages/MyBookings';
import Support from './pages/Support';


import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* 2. OTHER PAGES */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/post-ride" element={<PostRide />} />
      <Route path="/search-rides" element={<SearchRides />} />
      <Route path="/manage-rides" element={<ManageRides />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/support" element={<Support />} />
      
    </Routes>
  );
}

export default App;
