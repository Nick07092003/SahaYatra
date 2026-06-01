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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      window.location.reload();
    } catch (err) {
      alert("Failed to switch role");
    } finally {
      setSwitching(false);
    }
  };

  const navLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-emerald-600 font-semibold border-b-2 border-emerald-600 px-1 py-1 transition-all"
      : "text-slate-600 hover:text-emerald-500 font-semibold border-b-2 border-transparent hover:border-emerald-500 px-1 py-1 transition-all";
  };

  const mobileLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "block px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold transition-all"
      : "block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-all";
  };

  return (
    <header className="bg-white/80 backdrop-blur-md font-manrope antialiased tracking-tight sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <nav className="flex justify-between items-center w-full px-4 md:px-6 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold text-emerald-600 tracking-tighter flex items-center gap-2">
          SahaYatra
          {user && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${user.role === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {user.role}
            </span>
          )}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* Desktop Right Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={handleSwitchRole}
                disabled={switching}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                {switching ? 'Switching...' : `Switch to ${user.role === 'passenger' ? 'Driver' : 'Passenger'}`}
              </button>
              <Link to="/dashboard" className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Dashboard">
                <span className="material-symbols-outlined">dashboard</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Logout">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all font-semibold">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile: Right side icons + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <>
              <Link to="/dashboard" className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <span className="material-symbols-outlined text-[22px]">dashboard</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {/* Role Badge */}
          {user && (
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-4 mb-2">
              Signed in as {user.role}
            </p>
          )}

          {/* Passenger Links */}
          {(!user || user.role === 'passenger') && (
            <>
              <Link className={mobileLinkStyle('/search-rides')} to="/search-rides">
                <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-emerald-600">search</span> Find Rides</span>
              </Link>
              {user && (
                <>
                  <Link className={mobileLinkStyle('/my-bookings')} to="/my-bookings">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-emerald-600">directions_car</span> Active Rides</span>
                  </Link>
                  <Link className={mobileLinkStyle('/history')} to="/history">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-slate-500">history</span> History</span>
                  </Link>
                </>
              )}
            </>
          )}

          {/* Driver Links */}
          {(!user || user.role === 'driver') && (
            <>
              <Link className={mobileLinkStyle('/post-ride')} to="/post-ride">
                <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-emerald-600">add_circle</span> Offer Ride</span>
              </Link>
              {user && (
                <>
                  <Link className={mobileLinkStyle('/manage-rides')} to="/manage-rides">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-emerald-600">manage_accounts</span> Active Rides</span>
                  </Link>
                  <Link className={mobileLinkStyle('/history')} to="/history">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-slate-500">history</span> History</span>
                  </Link>
                </>
              )}
            </>
          )}

          <Link className={mobileLinkStyle('/support')} to="/support">
            <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px] text-slate-500">help</span> Support</span>
          </Link>

          {/* Auth Buttons or Switch Role */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            {user ? (
              <button
                onClick={handleSwitchRole}
                disabled={switching}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                {switching ? 'Switching...' : `Switch to ${user.role === 'passenger' ? 'Driver' : 'Passenger'}`}
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1 text-center py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all">Login</Link>
                <Link to="/register" className="flex-1 text-center py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition-all">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
