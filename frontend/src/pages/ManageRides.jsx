import React, { useEffect, useState } from 'react';
import { getDriverRides } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ManageRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverRides = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const decoded = jwtDecode(token);
        const driverId = decoded.id;

        const response = await getDriverRides(driverId);
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching your rides.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverRides();
  }, [navigate]);

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-h1 text-h2 text-slate-800">My Active Rides</h1>
            <p className="font-body-md text-slate-500 mt-1">Manage the rides you have offered.</p>
          </div>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {rides.length} {rides.length === 1 ? 'Ride Live' : 'Rides Live'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">directions_car</span>
            <h3 className="font-h3 text-xl text-slate-600 mb-2">No active rides</h3>
            <p className="text-slate-500 mb-6">You haven't offered any rides yet. Turn your empty seats into shared experiences.</p>
            <Link to="/post-ride" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              Offer a Ride
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase">Active</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold mb-3 text-lg">
                      <span>{ride.source}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      <span>{ride.destination}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-slate-600 font-label-md mb-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">event</span>
                        {ride.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                        {ride.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 min-w-[120px] p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="font-label-sm text-slate-500">Seat Occupancy</span>
                    <div className="flex gap-1 my-1">
                       {/* Render colored persons for booked seats, grey for available */}
                       {Array.from({ length: ride.passengers?.length || 0 }).map((_, i) => (
                         <span key={`booked-${i}`} className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                       ))}
                       {Array.from({ length: Math.max(0, ride.seats) }).map((_, i) => (
                         <span key={`avail-${i}`} className="material-symbols-outlined text-slate-300">person</span>
                       ))}
                    </div>
                    <span className="text-emerald-600 font-bold text-lg">
                      {ride.passengers?.length || 0} / {(ride.passengers?.length || 0) + parseInt(ride.seats)}
                    </span>
                  </div>
                </div>

                {/* Passengers List */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Passengers ({ride.passengers?.length || 0})</h4>
                  
                  {ride.passengers?.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {ride.passengers.map((passenger, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {passenger.name?.charAt(0) || "P"}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{passenger.name}</span>
                          </div>
                          <a href={`tel:${passenger.phone}`} className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            Call
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-h3 text-slate-800">
                    <span className="text-sm text-slate-500 font-normal mr-1">Price:</span>
                    ₹{ride.price}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cancel</button>
                    <button className="px-5 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 transition-colors">Edit</button>
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

export default ManageRides;