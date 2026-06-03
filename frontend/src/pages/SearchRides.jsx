import React, { useState, useRef } from 'react';
import { searchRides, requestRide } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useJsApiLoader, GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
import { SkeletonSearchCard } from '../components/Skeletons';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };
const defaultCenter = { lat: 18.5204, lng: 73.8567 }; // Default: Pune

const SearchRides = () => {
  const [rides, setRides] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const navigate = useNavigate();

  // Google Maps Refs
  const sourceRef = useRef();
  const destRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let queryParams = {};
      const sourcePlace = sourceRef.current?.getPlace();
      const destPlace = destRef.current?.getPlace();

      if (sourcePlace?.geometry && destPlace?.geometry) {
        queryParams = {
          sourceLat: sourcePlace.geometry.location.lat(),
          sourceLng: sourcePlace.geometry.location.lng(),
          destLat: destPlace.geometry.location.lat(),
          destLng: destPlace.geometry.location.lng(),
          source: sourcePlace.formatted_address || sourcePlace.name,
          destination: destPlace.formatted_address || destPlace.name
        };
        // Pan map to search area
        setMapCenter({
          lat: sourcePlace.geometry.location.lat(),
          lng: sourcePlace.geometry.location.lng()
        });
      } else {
        // Fallback for empty/invalid selections
        const srcVal = document.getElementById('searchInput').value;
        const dstVal = document.getElementById('destInput').value;
        queryParams = { source: srcVal, destination: dstVal };
      }

      const response = await searchRides(queryParams);
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
        alert("Please login to request a seat!");
        navigate('/login');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const pickupLocation = document.getElementById('searchInput')?.value || 'Unknown Pickup';
      const dropLocation = document.getElementById('destInput')?.value || 'Unknown Dropoff';

      await requestRide(rideId, userId, pickupLocation, dropLocation);
      
      alert("Request Sent! 🎉 The driver will review your request.");
      
      // Refresh the list
      document.getElementById('searchBtn').click(); 

    } catch (error) {
      alert("Booking Failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1600px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6 w-full">
        {/* Mobile: Search toggle button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setSearchPanelOpen(!searchPanelOpen)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">{searchPanelOpen ? 'expand_less' : 'search'}</span>
            {searchPanelOpen ? 'Hide Search' : 'Search for a Ride'}
          </button>
        </div>

        {/* Sidebar: Search Controls */}
        <aside className={`w-full md:w-80 shrink-0 space-y-6 mb-4 md:mb-0 ${searchPanelOpen ? 'block' : 'hidden'} md:block`}>
          <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant shadow-sm md:sticky md:top-24">
            <h3 className="font-h3 text-xl mb-5 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">search</span>
              Find a Ride
            </h3>
            
            <form onSubmit={(e) => { handleSearch(e); setSearchPanelOpen(false); }} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-600">Leaving From</label>
                <div className="relative">
                  {isLoaded ? (
                    <Autocomplete onLoad={(auto) => (sourceRef.current = auto)}>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">my_location</span>
                        <input 
                          id="searchInput"
                          placeholder="e.g. Pune" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md text-slate-800"
                          required
                        />
                      </div>
                    </Autocomplete>
                  ) : (
                    <div className="animate-pulse bg-slate-100 h-12 rounded-xl w-full"></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="font-label-md text-slate-600">Going To</label>
                <div className="relative">
                  {isLoaded ? (
                    <Autocomplete onLoad={(auto) => (destRef.current = auto)}>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">location_on</span>
                        <input 
                          id="destInput"
                          placeholder="e.g. Mumbai" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md text-slate-800"
                          required
                        />
                      </div>
                    </Autocomplete>
                  ) : (
                    <div className="animate-pulse bg-slate-100 h-12 rounded-xl w-full"></div>
                  )}
                </div>
              </div>
              
              <button 
                id="searchBtn"
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-body-md shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Searching...' : 'Search Rides'}
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area: Split into List and Map on large screens */}
        <section className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* List of Rides */}
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-h1 text-h2 text-slate-800">Available Rides</h1>
                {hasSearched ? (
                  <p className="font-body-md text-slate-500 mt-1">Found <span className="font-semibold text-emerald-600">{rides.length}</span> rides nearby.</p>
                ) : (
                  <p className="font-body-md text-slate-500 mt-1">Enter a source and destination to find available rides.</p>
                )}
              </div>
            </header>

            {loading ? (
              /* Skeleton cards while searching */
              <div className="flex flex-col gap-6">
                {[...Array(3)].map((_, i) => <SkeletonSearchCard key={i} />)}
              </div>
            ) : hasSearched && rides.length === 0 ? (
               <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                 <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">directions_car_off</span>
                 <h3 className="font-h3 text-xl text-slate-600 mb-2">No rides found</h3>
                 <p className="text-slate-500">We couldn't find any rides within a 10km radius of your search. Try different locations.</p>
               </div>
            ) : (
              <div className="flex flex-col gap-6">
                {rides.map((ride) => (
                  <div key={ride._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        {ride.driver?.profilePicture ? (
                           <img src={ride.driver.profilePicture.startsWith('http') ? ride.driver.profilePicture : `http://localhost:5000${ride.driver.profilePicture}`} alt="Driver" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-50" loading="lazy" decoding="async" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg ring-2 ring-emerald-50">
                            {ride.driver?.name?.charAt(0) || "D"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-h3 text-lg text-slate-800 flex items-center gap-2">
                            {ride.driver?.name || "Unknown Driver"}
                            {ride.driver?.verification?.isVerified && (
                              <span title="Verified Driver" className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                          </h4>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-label-md text-slate-700">{ride.driver?.averageRating > 0 ? ride.driver.averageRating : 'New'}</span>
                            {ride.driver?.totalReviews > 0 && (
                              <span className="text-xs text-slate-500 font-normal">({ride.driver.totalReviews} reviews)</span>
                            )}
                          </div>
                          {/* Vehicle info */}
                          {(ride.driver?.vehicleDetails?.model || ride.driver?.vehicleDetails?.color) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">directions_car</span>
                              <span className="text-xs text-slate-500 font-semibold">
                                {[ride.driver.vehicleDetails.model, ride.driver.vehicleDetails.color].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          )}
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
                          <p className="font-bold text-slate-800 text-lg">{ride.source?.address || ride.source}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                            Arrival <span className="text-emerald-600 font-bold">...</span>
                          </p>
                          <p className="font-bold text-slate-800 text-lg">{ride.destination?.address || ride.destination}</p>
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
                          Request Seat
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
          </div>

          {/* Map Display - hidden on mobile */}
          <div className="hidden xl:block h-[calc(100vh-150px)] sticky top-24 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {isLoaded ? (
              <GoogleMap
                center={mapCenter}
                zoom={11}
                mapContainerStyle={mapContainerStyle}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* Render markers for each ride's source location */}
                {rides.map((ride, idx) => {
                  if (ride.source?.location?.coordinates) {
                    const [lng, lat] = ride.source.location.coordinates;
                    return (
                      <Marker 
                        key={`marker-${ride._id}-${idx}`} 
                        position={{ lat, lng }} 
                        title={`Ride by ${ride.driver?.name}`}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">map</span>
              </div>
            )}
          </div>

        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchRides;