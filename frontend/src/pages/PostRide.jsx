import React, { useState, useRef, useEffect } from 'react';
import { createRide } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useJsApiLoader, GoogleMap, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };
const center = { lat: 18.5204, lng: 73.8567 }; // Default: Pune

const PostRide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    price: '',
    seats: ''
  });
  const [loading, setLoading] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [recommendedPrice, setRecommendedPrice] = useState(0);

  useEffect(() => {
    if (directionsResponse && directionsResponse.routes[selectedRouteIndex]) {
      const route = directionsResponse.routes[selectedRouteIndex];
      const distanceInKm = route.legs[0].distance.value / 1000;
      
      const FUEL_PRICE_PER_LITER = 105;
      const AVERAGE_MILEAGE = 15;
      const MAINTENANCE_PER_KM = 2;
      const AVERAGE_SEATS = 3; 

      const totalTripCost = (distanceInKm / AVERAGE_MILEAGE) * FUEL_PRICE_PER_LITER + (distanceInKm * MAINTENANCE_PER_KM);
      const pricePerSeat = Math.ceil(totalTripCost / AVERAGE_SEATS);
      
      const roundedPrice = Math.round(pricePerSeat / 10) * 10;
      
      setRecommendedPrice(roundedPrice);
      setFormData(prev => ({ ...prev, price: roundedPrice }));
    }
  }, [directionsResponse, selectedRouteIndex]);

  // Google Maps Refs
  const sourceRef = useRef();
  const destRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateRoute = async () => {
    if (!sourceRef.current || !destRef.current) return;
    const sourcePlace = sourceRef.current.getPlace();
    const destPlace = destRef.current.getPlace();

    if (!sourcePlace?.geometry || !destPlace?.geometry) return;

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: sourcePlace.formatted_address || sourcePlace.name,
      destination: destPlace.formatted_address || destPlace.name,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    });
    setDirectionsResponse(results);
    setSelectedRouteIndex(0);
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

      const sourcePlace = sourceRef.current?.getPlace();
      const destPlace = destRef.current?.getPlace();

      if (!sourcePlace?.geometry || !destPlace?.geometry) {
        alert("Please select valid locations from the Google Maps dropdown.");
        setLoading(false);
        return;
      }

      const selectedRoute = directionsResponse.routes[selectedRouteIndex];
      const waypoints = selectedRoute.overview_path.map(p => ({
        location: {
            type: 'Point',
            coordinates: [p.lng(), p.lat()]
        }
      }));

      const decoded = jwtDecode(token);
      
      const rideData = { 
        ...formData, 
        driver: decoded.id,
        source: {
            address: sourcePlace.formatted_address || sourcePlace.name,
            location: { type: 'Point', coordinates: [sourcePlace.geometry.location.lng(), sourcePlace.geometry.location.lat()] }
        },
        destination: {
            address: destPlace.formatted_address || destPlace.name,
            location: { type: 'Point', coordinates: [destPlace.geometry.location.lng(), destPlace.geometry.location.lat()] }
        },
        waypoints: waypoints
      };
      
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
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <h2 className="font-h2 text-h2 text-slate-800 mb-2">Offer a Ride</h2>
          <p className="font-body-md text-slate-500">Turn your empty seats into shared experiences and savings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <section className="w-full">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Google Autocomplete for Source */}
                  <div className="relative">
                    <label className="font-label-md block mb-2 text-slate-600">Source</label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => (sourceRef.current = autocomplete)}
                        onPlaceChanged={calculateRoute}
                      >
                        <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                          <span className="material-symbols-outlined text-emerald-600 mr-3">my_location</span>
                          <input 
                            required
                            className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                            placeholder="Departure city" 
                            type="text"
                          />
                        </div>
                      </Autocomplete>
                    ) : (
                      <div className="animate-pulse bg-slate-100 h-12 rounded-xl"></div>
                    )}
                  </div>
                  
                  {/* Google Autocomplete for Destination */}
                  <div className="relative">
                    <label className="font-label-md block mb-2 text-slate-600">Destination</label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => (destRef.current = autocomplete)}
                        onPlaceChanged={calculateRoute}
                      >
                        <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-emerald-500 focus-within:ring-4 ring-emerald-500/10 transition-all">
                          <span className="material-symbols-outlined text-emerald-600 mr-3">location_on</span>
                          <input 
                            required
                            className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                            placeholder="Arrival city" 
                            type="text"
                          />
                        </div>
                      </Autocomplete>
                    ) : (
                      <div className="animate-pulse bg-slate-100 h-12 rounded-xl"></div>
                    )}
                  </div>
                </div>

                {directionsResponse && directionsResponse.routes.length > 1 && (
                  <div className="space-y-3 pt-2">
                    <label className="font-label-md block text-slate-600">Select Preferred Route</label>
                    <div className="flex flex-col gap-3">
                      {directionsResponse.routes.map((route, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setSelectedRouteIndex(idx)}
                          className={`p-4 rounded-xl border text-left transition-all ${selectedRouteIndex === idx ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                        >
                          <div className="font-bold text-slate-800">Route {idx + 1} <span className="font-normal text-slate-500 text-sm ml-1">via {route.summary}</span></div>
                          <div className="text-sm text-slate-600 mt-2 flex gap-6">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {route.legs[0].duration.text}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">route</span> {route.legs[0].distance.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
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
                        value={formData.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (recommendedPrice > 0 && val > recommendedPrice * 1.5) {
                            alert(`Fair pricing policy limits the maximum price to ₹${Math.ceil(recommendedPrice * 1.5)} for this route.`);
                            setFormData({...formData, price: Math.ceil(recommendedPrice * 1.5)});
                          } else {
                            handleChange(e);
                          }
                        }}
                        required
                        className="w-full border-none focus:ring-0 p-0 text-body-md bg-transparent outline-none placeholder:text-slate-400" 
                        placeholder="500" 
                        type="number"
                      />
                    </div>
                    {recommendedPrice > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Recommended: <span className="font-bold text-slate-700">₹{recommendedPrice}</span> (Max: ₹{Math.ceil(recommendedPrice * 1.5)}).
                        <br/>Calculated based on fair-cost sharing.
                      </p>
                    )}
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
                  disabled={loading || !directionsResponse}
                  className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" 
                  type="submit"
                >
                  {loading ? 'Publishing...' : (
                    <>
                      <span className="material-symbols-outlined">directions_car</span>
                      {directionsResponse ? 'Publish Ride' : 'Select Locations First'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Map Section */}
          <section className="w-full h-[500px] lg:h-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100 flex items-center justify-center">
            {isLoaded ? (
              <GoogleMap
                center={center}
                zoom={10}
                mapContainerStyle={mapContainerStyle}
                options={{
                  zoomControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {directionsResponse && (
                  <DirectionsRenderer 
                    directions={directionsResponse} 
                    routeIndex={selectedRouteIndex}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostRide;