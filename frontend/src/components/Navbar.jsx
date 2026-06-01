import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { switchRole } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSwitchRole = async () => {
    if (!user) return;
    setSwitching(true);
    try {
      const response = await switchRole(user.id);
      localStorage.setItem('token', response.data.token);
      window.location.reload(); // Refresh the entire app to update all state
    } catch (err) {
      alert("Failed to switch role");
    } finally {
      setSwitching(false);
    }
  };

  const navLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 px-1 py-1 transition-all"
      : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 font-semibold border-b-2 border-transparent hover:border-emerald-500 px-1 py-1 transition-all";
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md font-manrope antialiased tracking-tight docked full-width top-0 sticky z-50 border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <nav className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tighter flex items-center gap-2">
          SahaYatra
          {user && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${user.role === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {user.role}
            </span>
          )}
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {/* Conditionally render links based on Role */}
          {(!user || user.role === 'passenger') && (
            <>
              <Link className={navLinkStyle('/search-rides')} to="/search-rides">Find Rides</Link>
              {user && (
                <>
                  <Link className={navLinkStyle('/my-bookings')} to="/my-bookings">Active Rides</Link>
                  <Link className={navLinkStyle('/history')} to="/history">History</Link>
                </>
              )}
            </>
          )}
          {(!user || user.role === 'driver') && (
            <>
              <Link className={navLinkStyle('/post-ride')} to="/post-ride">Offer Ride</Link>
              {user && (
                <>
                  <Link className={navLinkStyle('/manage-rides')} to="/manage-rides">Active Rides</Link>
                  <Link className={navLinkStyle('/history')} to="/history">History</Link>
                </>
              )}
            </>
          )}
          <Link className={navLinkStyle('/support')} to="/support">Support</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Switch Role Button */}
              <button 
                onClick={handleSwitchRole} 
                disabled={switching}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                {switching ? 'Switching...' : `Switch to ${user.role === 'passenger' ? 'Driver' : 'Passenger'}`}
              </button>

              <Link to="/dashboard" className="p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all" title="Dashboard">
                <span className="material-symbols-outlined">dashboard</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all" title="Logout">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all font-semibold">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-sm">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
