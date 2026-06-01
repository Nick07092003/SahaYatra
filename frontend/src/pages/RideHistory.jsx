import React, { useEffect, useState } from 'react';
import { getDriverRides, getMyBookings, createReview } from '../services/api';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RideHistory = () => {
  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('booked'); // 'booked' or 'offered'
  
  const navigate = useNavigate();

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'passenger' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isRidePast = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return true;
    
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    
    if (dateStr < todayDateStr) return true;
    if (dateStr > todayDateStr) return false;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < today.getHours() || (hours === today.getHours() && minutes < today.getMinutes())) {
      return true;
    }
    return false;
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setUserRole(decoded.role);

      const [bookedRes, offeredRes] = await Promise.all([
        getMyBookings(decoded.id),
        getDriverRides(decoded.id)
      ]);

      setBookedRides(bookedRes.data.filter(r => isRidePast(r.date, r.time)));
      setOfferedRides(offeredRes.data.filter(r => isRidePast(r.date, r.time)));
      
      // If driver, maybe default to offered history?
      if (decoded.role === 'driver') setActiveTab('offered');
    } catch (error) {
      console.error('Error fetching history.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [navigate]);

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
      alert("Review submitted successfully!");
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
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <h1 className="font-h1 text-h2 text-slate-800">Ride History</h1>
          <p className="font-body-md text-slate-500 mt-1">Review your past journeys and experiences.</p>
        </div>

        <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('booked')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'booked' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Past Bookings
          </button>
          <button 
            onClick={() => setActiveTab('offered')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'offered' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Offered Rides
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (activeTab === 'booked' ? bookedRides : offeredRides).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">history</span>
            <h3 className="font-h3 text-xl text-slate-600 mb-2">No history found</h3>
            <p className="text-slate-500 mb-6">You don't have any past {activeTab === 'booked' ? 'bookings' : 'offered rides'} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activeTab === 'booked' ? bookedRides : offeredRides).map((ride) => (
              <div key={ride._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider uppercase">Completed</span>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <span>{ride.source?.address || ride.source}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    <span>{ride.destination?.address || ride.destination}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      {ride.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      {ride.time}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {activeTab === 'booked' ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {ride.driver?.name?.charAt(0) || "D"}
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Driver</p>
                            <p className="text-sm font-bold text-slate-700">{ride.driver?.name || "Unknown"}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex -space-x-2">
                          {ride.passengers?.slice(0, 3).map((p, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700 font-bold text-xs">
                              {p.name?.charAt(0) || "P"}
                            </div>
                          ))}
                          {ride.passengers?.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 font-bold text-xs">
                              +{ride.passengers.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setReviewModal({ 
                        isOpen: true, 
                        ride: ride, 
                        reviewee: activeTab === 'booked' ? ride.driver : ride.passengers[0], 
                        roleAtTime: activeTab === 'booked' ? 'passenger' : 'driver' 
                      })}
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-bold text-xs hover:bg-yellow-100 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      Rate Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-yellow-50/50">
              <h2 className="font-h3 text-xl text-yellow-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">star</span> Rate Experience
              </h2>
              <button onClick={() => setReviewModal({ isOpen: false, ride: null, reviewee: null, roleAtTime: 'passenger' })} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              {reviewModal.reviewee ? (
                <p className="text-center text-slate-600 font-medium">How was your ride with <span className="font-bold text-slate-800">{reviewModal.reviewee?.name}</span>?</p>
              ) : (
                <p className="text-center text-slate-600 font-medium">How was your ride experience?</p>
              )}
              
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
                  placeholder="Leave a comment..."
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

export default RideHistory;
