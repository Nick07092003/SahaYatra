import React, { useState } from 'react';
import { createRide } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PostRide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    seats: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login first");
        navigate('/login');
        return;
      }
      
      const decoded = jwtDecode(token);
      
      // Add the driver's ID to the data before sending
      const rideData = { ...formData, driver: decoded.id };
      
      await createRide(rideData);
      alert('Ride Posted Successfully! 🚗');
      navigate('/manage-rides');
      
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to post ride'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full flex justify-center">
        <section className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-h2 text-h2 text-slate-800 mb-2">Offer a Ride</h2>
              <p className="font-body-md text-slate-500">Turn your empty seats into shared experiences and savings.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <label className="font-label-md block mb-2 text-slate-600">Source</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="material-symbols-outlined text-emerald-600 mr-3">my_location</span>
                    <input 
                      name="source"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                      placeholder="Departure city" 
                      type="text"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="font-label-md block mb-2 text-slate-600">Destination</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="material-symbols-outlined text-emerald-600 mr-3">location_on</span>
                    <input 
                      name="destination"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                      placeholder="Arrival city" 
                      type="text"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-label-md block mb-2 text-slate-600">Date</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="material-symbols-outlined text-slate-400 mr-3">calendar_month</span>
                    <input 
                      name="date"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none text-slate-600" 
                      type="date"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-md block mb-2 text-slate-600">Time</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="material-symbols-outlined text-slate-400 mr-3">schedule</span>
                    <input 
                      name="time"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none text-slate-600" 
                      type="time"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-label-md block mb-2 text-slate-600">Price per seat</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="text-slate-500 font-bold mr-3">₹</span>
                    <input 
                      name="price"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                      placeholder="500" 
                      type="number"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-md block mb-2 text-slate-600">Available Seats</label>
                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                    <span className="material-symbols-outlined text-slate-400 mr-3">group</span>
                    <input 
                      name="seats"
                      onChange={handleChange}
                      required
                      className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                      placeholder="e.g. 3" 
                      type="number"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70" 
                type="submit"
              >
                {loading ? 'Publishing...' : (
                  <>
                    <span className="material-symbols-outlined">directions_car</span>
                    Publish Ride
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostRide;