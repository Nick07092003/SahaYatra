import React, { useState } from 'react';
import { searchRides, bookRide } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SearchRides = () => {
  const [query, setQuery] = useState({ source: '', destination: '' });
  const [rides, setRides] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await searchRides(query);
      setRides(response.data);
      setHasSearched(true);
    } catch (error) {
      alert('Error fetching rides');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to book a ride!");
        navigate('/login');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;

      await bookRide(rideId, userId);
      
      alert("Booking Successful! 🎉");
      
      // Refresh the list to show updated seats
      handleSearch({ preventDefault: () => {} }); 

    } catch (error) {
      alert("Booking Failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 md:flex gap-8 w-full">
        {/* Sidebar: Search Controls */}
        <aside className="w-full md:w-80 shrink-0 space-y-6 mb-8 md:mb-0">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm sticky top-24">
            <h3 className="font-h3 text-xl mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">search</span>
              Find a Ride
            </h3>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-600">Leaving From</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">my_location</span>
                  <input 
                    placeholder="e.g. Pune" 
                    onChange={(e) => setQuery({...query, source: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md text-slate-800"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="font-label-md text-slate-600">Going To</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">location_on</span>
                  <input 
                    placeholder="e.g. Mumbai" 
                    onChange={(e) => setQuery({...query, destination: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md text-slate-800"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-body-md shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Searching...' : 'Search Rides'}
              </button>
            </form>
          </div>

          {/* Promotion Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-h3 text-xl mb-2">Refer & Earn</h4>
              <p className="text-sm opacity-90 mb-4">Invite friends to SahaYatra and get 50% off your next 3 rides.</p>
              <button className="bg-white text-emerald-700 px-4 py-2 rounded-full font-label-md text-xs font-bold hover:bg-slate-50 transition-colors">Share Now</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
            </div>
          </div>
        </aside>

        {/* Main Content: Available Rides */}
        <section className="flex-1 space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="font-h1 text-h2 text-slate-800">Available Rides</h1>
              {hasSearched ? (
                <p className="font-body-md text-slate-500 mt-1">Showing matches for <span className="font-semibold text-emerald-600">{query.source} to {query.destination}</span></p>
              ) : (
                <p className="font-body-md text-slate-500 mt-1">Enter a source and destination to find available rides.</p>
              )}
            </div>
            {hasSearched && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full font-label-md text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full font-label-md text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-sm">sort</span>
                  Cheapest
                </button>
              </div>
            )}
          </header>

          {/* Ride Results Grid */}
          {hasSearched && rides.length === 0 ? (
             <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
               <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">directions_car_off</span>
               <h3 className="font-h3 text-xl text-slate-600 mb-2">No rides found</h3>
               <p className="text-slate-500">We couldn't find any rides matching your search. Try different locations or dates.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg ring-2 ring-emerald-50">
                        {ride.driver?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <h4 className="font-h3 text-lg text-slate-800">{ride.driver?.name || "Unknown Driver"}</h4>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-label-md text-slate-700">4.8</span>
                          <span className="text-xs text-slate-500 font-normal">(New)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-h3 text-emerald-600 font-bold">₹{ride.price}</div>
                      <span className="font-label-sm text-slate-500">per seat</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-10 bg-slate-200 my-1"></div>
                      <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white"></div>
                    </div>
                    <div className="flex-1 space-y-5">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                          Departure <span className="text-emerald-600 font-bold">{ride.time}</span>
                        </p>
                        <p className="font-bold text-slate-800 text-lg">{ride.source}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                          Arrival <span className="text-emerald-600 font-bold">...</span>
                        </p>
                        <p className="font-bold text-slate-800 text-lg">{ride.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex gap-2">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        {ride.date}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${ride.seats > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {ride.seats} seats left
                      </span>
                    </div>
                    
                    {ride.seats > 0 ? (
                      <button 
                        onClick={() => handleBook(ride._id)}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        Book Seat
                      </button>
                    ) : (
                      <button 
                        disabled 
                        className="bg-slate-200 text-slate-400 px-6 py-2.5 rounded-full font-bold text-sm cursor-not-allowed"
                      >
                        Full
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchRides;