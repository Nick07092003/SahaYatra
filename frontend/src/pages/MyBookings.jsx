import React, { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyBookings = () => {
  const [rides, setRides] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const decoded = jwtDecode(token);
      setUserId(decoded.id);

      const response = await getMyBookings(decoded.id);
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching your bookings.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const handleCancel = async (rideId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this ride booking?");
    if (!confirmCancel) return;

    try {
      await cancelBooking(rideId, userId);
      alert("Booking cancelled successfully! 🛑");
      fetchBookings();
    } catch (error) {
      alert("Failed to cancel: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-h1 text-h2 text-slate-800">My Bookings</h1>
            <p className="font-body-md text-slate-500 mt-1">Manage your upcoming trips and travel history.</p>
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {rides.length} {rides.length === 1 ? 'Trip Booked' : 'Trips Booked'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">book_online</span>
            <h3 className="font-h3 text-xl text-slate-600 mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-6">You haven't booked any rides yet. Find your next journey today!</p>
            <Link to="/search-rides" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors">
              <span className="material-symbols-outlined text-sm">search</span>
              Find a Ride
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-4xl">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col md:flex-row gap-6">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Confirmed
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4 pr-24">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg ring-2 ring-slate-50">
                        {ride.driver?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <h4 className="font-h3 text-lg text-slate-800">{ride.driver?.name || "Unknown Driver"}</h4>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <span className="material-symbols-outlined text-[16px]">directions_car</span>
                          Driver
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-8 bg-slate-200 my-1"></div>
                      <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                          Departure <span className="text-slate-800 font-bold">{ride.time}</span>
                        </p>
                        <p className="font-bold text-slate-800">{ride.source}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                          Arrival <span className="text-slate-800 font-bold">...</span>
                        </p>
                        <p className="font-bold text-slate-800">{ride.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Trip Details</p>
                      <div className="flex items-center gap-2 text-slate-700 font-medium text-sm mb-1">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_month</span>
                        {ride.date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                        ₹{ride.price} per seat
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleCancel(ride._id)}
                      className="flex-1 py-2.5 text-red-600 font-bold text-sm bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MyBookings;