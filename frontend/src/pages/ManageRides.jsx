import React, { useEffect, useState } from 'react';
import { getDriverRides, updateRide, deleteRide, createReview, acceptRequest, rejectRequest } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ManageRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'driver' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const navigate = useNavigate();

  const fetchDriverRides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const decoded = jwtDecode(token);
      const driverId = decoded.id;
      setUserId(driverId);

      const response = await getDriverRides(driverId);
      const activeRides = response.data.filter(r => isRideActive(r.date, r.time));
      setRides(activeRides);
    } catch (error) {
      console.error('Error fetching your rides.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverRides();
  }, [navigate]);

  const isRideActive = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    
    if (dateStr < todayDateStr) return false;
    if (dateStr > todayDateStr) return true;
    
    // Same day, check time
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < today.getHours() || (hours === today.getHours() && minutes < today.getMinutes())) {
      return false;
    }
    return true;
  };

  const handleEditClick = (ride) => {
    setCurrentEdit({
      id: ride._id,
      date: ride.date,
      time: ride.time,
      price: ride.price,
      seats: ride.seats
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setCurrentEdit({ ...currentEdit, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateRide(currentEdit.id, currentEdit);
      alert('Ride updated successfully!');
      setIsEditModalOpen(false);
      fetchDriverRides(); // Refresh list
    } catch (error) {
      alert('Error updating ride: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRide = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel and delete this ride?");
    if (!confirmCancel) return;

    try {
      await deleteRide(id);
      alert("Ride deleted successfully!");
      fetchDriverRides(); // Refresh list
    } catch (error) {
      alert("Error deleting ride: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleAcceptRequest = async (rideId, requestId) => {
    try {
      await acceptRequest(rideId, requestId);
      alert('Request accepted!');
      fetchDriverRides();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectRequest = async (rideId, requestId) => {
    try {
      await rejectRequest(rideId, requestId);
      alert('Request rejected.');
      fetchDriverRides();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await createReview({
        reviewer: userId,
        reviewee: reviewModal.reviewee._id,
        ride: reviewModal.ride._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        roleAtTime: reviewModal.roleAtTime
      });
      alert("Review submitted successfully! Thanks for your feedback.");
      setReviewModal({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'driver' });
      setReviewForm({ rating: 5, comment: '' });
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-h1 text-2xl md:text-h2 text-slate-800">My Rides</h1>
            <p className="font-body-md text-slate-500 mt-1 text-sm md:text-base">Manage the rides you have offered.</p>
          </div>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {rides.length} Active
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">directions_car</span>
            <h3 className="font-h3 text-xl text-slate-600 mb-2">No rides found</h3>
            <p className="text-slate-500 mb-6">You haven't offered any rides yet. Turn your empty seats into shared experiences.</p>
            <Link to="/post-ride" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              Offer a Ride
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {rides.map((ride) => {
              const active = isRideActive(ride.date, ride.time);

              return (
                <div key={ride._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase">Active</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className={`flex items-center gap-3 font-bold mb-3 text-lg ${active ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <span>{ride.source?.address || ride.source}</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        <span>{ride.destination?.address || ride.destination}</span>
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
                    
                    <div className={`flex flex-col items-center gap-2 min-w-[120px] p-4 bg-slate-50 border border-slate-100 rounded-xl ${!active && 'grayscale'}`}>
                      <span className="font-label-sm text-slate-500">Seat Occupancy</span>
                      <div className="flex gap-1 my-1">
                         {Array.from({ length: ride.passengers?.length || 0 }).map((_, i) => (
                           <span key={`booked-${i}`} className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                         ))}
                         {Array.from({ length: Math.max(0, ride.seats) }).map((_, i) => (
                           <span key={`avail-${i}`} className="material-symbols-outlined text-slate-300">person</span>
                         ))}
                      </div>
                      <span className={`font-bold text-lg ${active ? 'text-emerald-600' : 'text-slate-500'}`}>
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
                            <div className="flex gap-2">
                              <a href={`tel:${passenger.phone}`} className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                Call
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Requests */}
                  {active && ride.requests && ride.requests.filter(r => r.status === 'pending').length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">Pending Requests ({ride.requests.filter(r => r.status === 'pending').length})</h4>
                      <div className="space-y-3">
                        {ride.requests.filter(r => r.status === 'pending').map((req, idx) => (
                          <div key={idx} className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-xs">
                                {req.passenger?.name?.charAt(0) || "P"}
                              </div>
                              <span className="font-bold text-slate-800">{req.passenger?.name}</span>
                            </div>
                            <div className="text-sm text-slate-600 mb-4 space-y-1">
                              <p><span className="font-semibold">Pickup:</span> {req.pickupLocation}</p>
                              <p><span className="font-semibold">Dropoff:</span> {req.dropLocation}</p>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleAcceptRequest(ride._id, req._id)}
                                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(ride._id, req._id)}
                                className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-h3 text-slate-800">
                      <span className="text-sm text-slate-500 font-normal mr-1">Price:</span>
                      ₹{ride.price}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCancelRide(ride._id)}
                        className="px-5 py-2 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleEditClick(ride)}
                        className="px-5 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Ride Modal */}
      {isEditModalOpen && currentEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-h3 text-xl text-slate-800">Edit Ride Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label-md text-slate-700 block">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={currentEdit.date}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-slate-700 block">Time</label>
                  <input 
                    type="time" 
                    name="time"
                    value={currentEdit.time}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label-md text-slate-700 block">Price (₹)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={currentEdit.price}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-slate-700 block">Available Seats</label>
                  <input 
                    type="number" 
                    name="seats"
                    value={currentEdit.seats}
                    onChange={handleEditChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                    required
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-yellow-50/50">
              <h2 className="font-h3 text-xl text-yellow-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">star</span> Rate Passenger
              </h2>
              <button onClick={() => setReviewModal({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'driver' })} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              <p className="text-center text-slate-600 font-medium">How was your ride with <span className="font-bold text-slate-800">{reviewModal.reviewee?.name}</span>?</p>
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                    className="focus:outline-none"
                  >
                    <span 
                      className={`material-symbols-outlined text-4xl transition-colors ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-200'}`} 
                      style={{ fontVariationSettings: star <= reviewForm.rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-slate-700 block">Feedback (Optional)</label>
                <textarea 
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  placeholder="Leave a comment about the passenger..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-body-md min-h-[100px] resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-md shadow-yellow-500/20 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageRides;