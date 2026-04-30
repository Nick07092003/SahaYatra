import React, { useState } from 'react';
import { registerUser, googleLogin } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'passenger' // Default role
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
      await registerUser(formData);
      alert('Registration Successful!');
      navigate('/login'); 
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Something went wrong'));
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
              <h2 className="font-h1 text-white text-h2 mb-md">Join the Movement.</h2>
              <p className="font-body-lg text-emerald-100 leading-relaxed opacity-90">Become part of a community that values efficiency, trust, and environmental consciousness in their daily commute.</p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-sm">
              <div className="flex items-center gap-md p-md bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-emerald-100" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div>
                  <p className="font-label-md text-white">Secure Platform</p>
                  <p className="text-xs text-emerald-100">Your data is safe with us</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-emerald-100" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                <div>
                  <p className="font-label-md text-white">Save Money</p>
                  <p className="text-xs text-emerald-100">Split costs seamlessly</p>
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
            
            <div className="mb-8">
              <h2 className="font-h2 text-h3 text-slate-800 mb-xs">Create an Account</h2>
              <p className="text-slate-500 font-body-md">Fill in your details to get started.</p>
            </div>
            
            {/* Form Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-8 max-w-xs">
              <Link to="/login" className="flex-1 py-2 text-center font-label-md rounded-md text-slate-500 hover:text-slate-800 transition-all duration-200">
                Sign In
              </Link>
              <Link to="/register" className="flex-1 py-2 text-center font-label-md rounded-md bg-white text-emerald-600 shadow-sm transition-all duration-200">
                Sign Up
              </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="font-label-md text-slate-600" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md" 
                    id="name" 
                    name="name"
                    placeholder="John Doe" 
                    type="text"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-600" htmlFor="email">Email</label>
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

                <div className="space-y-1">
                  <label className="font-label-md text-slate-600" htmlFor="phone">Phone</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">call</span>
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md" 
                      id="phone" 
                      name="phone"
                      placeholder="+977 98..." 
                      type="tel"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-600" htmlFor="password">Password</label>
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
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-body-md shadow-lg shadow-emerald-600/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70" 
                type="submit"
              >
                {loading ? 'Registering...' : 'Sign Up'}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>
            
            <div className="my-6 flex items-center gap-4">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="text-slate-400 font-label-sm uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>
            
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await googleLogin(credentialResponse.credential);
                    localStorage.setItem('token', res.data.token);
                    navigate('/dashboard');
                  } catch (error) {
                    alert('Google Sign Up Failed: ' + (error.response?.data?.message || 'Unknown error'));
                  }
                }}
                onError={() => {
                  alert('Google Sign Up Failed');
                }}
              />
            </div>

            <p className="mt-2 text-center text-slate-500 font-label-md text-sm">
                By signing up, you agree to SahaYatra's 
                <a className="text-blue-600 hover:underline mx-1" href="#">Terms</a> and 
                <a className="text-blue-600 hover:underline mx-1" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;