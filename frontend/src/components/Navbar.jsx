import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
        <Link to="/" className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tighter">SahaYatra</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link className={navLinkStyle('/search-rides')} to="/search-rides">Find Rides</Link>
          <Link className={navLinkStyle('/post-ride')} to="/post-ride">Offer Ride</Link>
          <Link className={navLinkStyle('/support')} to="/support">Support</Link>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <>
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
