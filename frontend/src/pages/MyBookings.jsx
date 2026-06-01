import React, { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking, createReview } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyBookings = () => {
  const [rides, setRides] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'passenger' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const decoded = jwtDecode(token);
      setUserId(decoded.id);

      const response = await getMyBookings(decoded.id);
      const activeBookings = response.data.filter(r => isRideActive(r.date, r.time));
      setRides(activeBookings);
    } catch (error) {
      console.error('Error fetching your bookings.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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
      setReviewModal({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'passenger' });
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
            <h1 className="font-h1 text-2xl md:text-h2 text-slate-800">My Bookings</h1>
            <p className="font-body-md text-slate-500 mt-1 text-sm md:text-base">Manage your upcoming trips and travel history.</p>
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {rides.length} Upcoming
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
            {rides.map((ride) => {
              const active = isRideActive(ride.date, ride.time);
              
              return (
                <div key={ride._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col md:flex-row gap-6">
                  <div className="absolute top-0 right-0 p-4">
                    {ride.passengers?.includes(userId) || ride.passengers?.some(p => p._id === userId) ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Confirmed
                      </span>
                    ) : ride.requests?.find(r => r.passenger === userId || r.passenger?._id === userId)?.status === 'pending' ? (
                      <span className="bg-orange-50 text-orange-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">pending</span>
                        Pending Approval
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">cancel</span>
                        Rejected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4 pr-24">
                      <div className="flex items-center gap-4">
                        {ride.driver?.profilePicture ? (
                           <img src={ride.driver.profilePicture.startsWith('http') ? ride.driver.profilePicture : `http://localhost:5000${ride.driver.profilePicture}`} alt="Driver" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-50" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg ring-2 ring-slate-50">
                            {ride.driver?.name?.charAt(0) || "D"}
                          </div>
                        )}
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
                          <p className="font-bold text-slate-800">{ride.source?.address || ride.source}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-2">
                            Arrival <span className="text-slate-800 font-bold">...</span>
                          </p>
                          <p className="font-bold text-slate-800">{ride.destination?.address || ride.destination}</p>
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
              );
            })}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-yellow-50/50">
              <h2 className="font-h3 text-xl text-yellow-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">star</span> Rate your trip
              </h2>
              <button onClick={() => setReviewModal({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'passenger' })} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm">
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
                  placeholder="Leave a comment about the trip..."
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

export default MyBookings;