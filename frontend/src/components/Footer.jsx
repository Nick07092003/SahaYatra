import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 w-full py-12 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
        <div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mb-4">SahaYatra</div>
          <p className="font-manrope text-sm text-slate-500 dark:text-slate-400">Transforming the daily commute into a shared experience of community and sustainability.</p>
        </div>
        <div>
          <h4 className="font-label-md text-slate-900 dark:text-white mb-4">Product</h4>
          <ul className="space-y-2 font-manrope text-sm text-slate-500 dark:text-slate-400">
            <li><Link className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" to="/search-rides">Find Rides</Link></li>
            <li><Link className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" to="/post-ride">Offer Ride</Link></li>
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="/#how-it-works">How it Works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-slate-900 dark:text-white mb-4">Support</h4>
          <ul className="space-y-2 font-manrope text-sm text-slate-500 dark:text-slate-400">
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="#">Privacy Policy</a></li>
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="#">Terms of Service</a></li>
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="#">Help Center</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-slate-900 dark:text-white mb-4">Impact</h4>
          <ul className="space-y-2 font-manrope text-sm text-slate-500 dark:text-slate-400">
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="#">Carbon Impact</a></li>
            <li><a className="hover:text-emerald-500 hover:underline decoration-emerald-500 underline-offset-4 transition-all duration-300" href="#">Community Safety</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center font-manrope text-sm text-slate-500 dark:text-slate-400">
          © 2024 SahaYatra. Confident Commuting.
      </div>
    </footer>
  );
};

export default Footer;
