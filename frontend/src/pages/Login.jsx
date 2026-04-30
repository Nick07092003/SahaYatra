import React, { useState } from 'react';
import { loginUser, googleLogin } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard'); 
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Login Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
          
          {/* Left Side: Branding & Visuals */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-600 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-xl">
                <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                <h1 className="font-h1 text-white text-h3 tracking-tighter">SahaYatra</h1>
              </div>
              <h2 className="font-h1 text-white text-h2 mb-md">Journeying Together, Confidently.</h2>
              <p className="font-body-lg text-emerald-100 leading-relaxed opacity-90">Join thousands of verified commuters reducing carbon footprint and travel costs through seamless carpooling.</p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-sm">
              <div className="flex items-center gap-md p-md bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-emerald-100" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <div>
                  <p className="font-label-md text-white">Trusted Community</p>
                  <p className="text-xs text-emerald-100">100% Verified Profiles</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-emerald-100" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                <div>
                  <p className="font-label-md text-white">Eco-Friendly</p>
                  <p className="text-xs text-emerald-100">1.2k Tons CO2 Saved</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-400 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
          </div>
          
          {/* Right Side: Auth Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
            <div className="lg:hidden flex items-center gap-2 mb-lg">
              <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
              <h1 className="font-h1 text-emerald-600 text-h3 tracking-tighter">SahaYatra</h1>
            </div>
            
            <div className="mb-lg">
              <h2 className="font-h2 text-h3 text-slate-800 mb-xs">Welcome Back</h2>
              <p className="text-slate-500 font-body-md">Sign in to continue your journey.</p>
            </div>
            
            {/* Form Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-lg max-w-xs">
              <Link to="/login" className="flex-1 py-2 text-center font-label-md rounded-md bg-white text-emerald-600 shadow-sm transition-all duration-200">
                Sign In
              </Link>
              <Link to="/register" className="flex-1 py-2 text-center font-label-md rounded-md text-slate-500 hover:text-slate-800 transition-all duration-200">
                Sign Up
              </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="font-label-md text-slate-600" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md" 
                    id="email" 
                    name="email"
                    placeholder="name@example.com" 
                    type="email"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-slate-600" htmlFor="password">Password</label>
                  <a className="text-blue-600 font-label-sm hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md" 
                    id="password" 
                    name="password"
                    placeholder="••••••••" 
                    type="password"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <button 
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-body-md shadow-lg shadow-emerald-600/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70" 
                type="submit"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>
            
            <div className="my-8 flex items-center gap-4">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="text-slate-400 font-label-sm uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await googleLogin(credentialResponse.credential);
                    localStorage.setItem('token', res.data.token);
                    navigate('/dashboard');
                  } catch (error) {
                    alert('Google Login Failed: ' + (error.response?.data?.message || 'Unknown error'));
                  }
                }}
                onError={() => {
                  alert('Google Login Failed');
                }}
              />
            </div>
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;