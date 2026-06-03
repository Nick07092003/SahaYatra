import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SkeletonDashboard } from '../components/Skeletons';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', profilePicture: null });
  const [updating, setUpdating] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
    } else {
        try {
          const decoded = jwtDecode(token);
          const response = await import('../services/api').then(module => module.getUserProfile(decoded.id));
          setUser(response.data);
          setEditForm({ name: response.data.name || '', phone: response.data.phone || '', profilePicture: null });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          navigate('/login');
        }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const handleEditChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setEditForm({ ...editForm, profilePicture: e.target.files[0] });
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('phone', editForm.phone);
      if (editForm.profilePicture) {
        formData.append('profilePicture', editForm.profilePicture);
      }
      
      await import('../services/api').then(module => module.updateUserProfile(user._id, formData));
      alert('Profile updated successfully!');
      setIsEditModalOpen(false);
      fetchUser(); // Refresh data
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <SkeletonDashboard />
      </main>
      <Footer />
    </div>
  );

  // Helper to determine image URL
  const getProfileImageUrl = () => {
    if (!user.profilePicture) return null;
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    return `http://localhost:5000${user.profilePicture}`;
  };

  const profileImageUrl = getProfileImageUrl();

  // ── Driver profile completion score ─────────────────────────────────────
  const driverCompletion = (() => {
    if (user.role !== 'driver') return null;
    let filled = 0, total = 3;
    const dd = user.driverDetails;
    const vd = user.vehicleDetails;
    const vf = user.verification;
    if (dd?.bio || dd?.experienceYears || dd?.languages?.length) filled++;
    if (vd?.make && vd?.model) filled++;
    if (vf?.licenseNumber && vf?.aadharNumber) filled++;
    return { filled, total, pct: Math.round((filled / total) * 100) };
  })();
  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full relative">
        {/* Profile Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full border-4 border-emerald-600 object-cover shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-emerald-600 flex items-center justify-center bg-emerald-100 text-emerald-700 text-5xl font-bold shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Verified badge — only shows if driver is verified */}
              {user?.verification?.isVerified && (
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-1.5 border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2 z-10">
              <h1 className="font-h1 text-h2 text-slate-800">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-yellow-500">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="font-label-md text-slate-500">
                  {user.averageRating > 0 ? `${user.averageRating} • ${user.totalReviews} Reviews` : 'New User'} • Verified
                </span>
              </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">eco</span> Active User
                </span>
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider border border-slate-200">
                  Joined {new Date(user.createdAt || Date.now()).getFullYear()}
                </span>
                {user.verification?.isVerified && (
                  <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1 border border-blue-200">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Verified Driver
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 z-10">
              <button onClick={() => setIsEditModalOpen(true)} className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Personal Info Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="font-h3 text-xl mb-6 flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-emerald-600">person</span> Personal Info
              </h2>
              <dl className="space-y-6">
                <div>
                  <dt className="font-label-sm text-slate-400 uppercase tracking-wider font-bold">Email Address</dt>
                  <dd className="font-body-md text-slate-800 mt-1">{user.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="font-label-sm text-slate-400 uppercase tracking-wider font-bold">Phone Number</dt>
                  <dd className="font-body-md text-slate-800 mt-1">{user.phone || 'Not provided'}</dd>
                </div>
              </dl>
            </div>

            {/* ── Driver Profile Completion Card (drivers only) ── */}
            {driverCompletion && (
              <div className={`rounded-2xl border p-6 shadow-sm ${
                driverCompletion.pct === 100
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">assignment_ind</span>
                    Driver Profile
                  </h3>
                  <span className={`text-sm font-extrabold ${
                    driverCompletion.pct === 100 ? 'text-emerald-600' : 'text-orange-600'
                  }`}>{driverCompletion.filled}/{driverCompletion.total}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      driverCompletion.pct === 100 ? 'bg-emerald-500' : 'bg-orange-400'
                    }`}
                    style={{ width: `${driverCompletion.pct}%` }}
                  />
                </div>

                <div className="space-y-1.5 mb-4">
                  {[
                    { label: 'Driver Details', done: !!(user.driverDetails?.bio || user.driverDetails?.experienceYears || user.driverDetails?.languages?.length) },
                    { label: 'Vehicle Details', done: !!(user.vehicleDetails?.make && user.vehicleDetails?.model) },
                    { label: 'Verification Docs', done: !!(user.verification?.licenseNumber && user.verification?.aadharNumber) },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <span className={`material-symbols-outlined text-[16px] ${ done ? 'text-emerald-600' : 'text-slate-300' }`}
                        style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>check_circle</span>
                      <span className={done ? 'text-slate-700 font-semibold' : 'text-slate-400'}>{label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/driver-profile"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    driverCompletion.pct === 100
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {driverCompletion.pct === 100 ? 'edit' : 'arrow_forward'}
                  </span>
                  {driverCompletion.pct === 100 ? 'Edit Profile' : 'Complete Profile'}
                </Link>
              </div>
            )}
          </aside>

          {/* Action Panels */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-8">
              <h2 className="font-h3 text-2xl mb-8 text-slate-800 border-b border-slate-100 pb-4">Dashboard Actions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user.role === 'passenger' && (
                  <>
                    <Link to="/search-rides" className="group p-6 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">search</span>
                      </div>
                      <h3 className="font-h3 text-lg text-emerald-900 mb-2">Find a Ride</h3>
                      <p className="text-emerald-700/80 text-sm">Search for available rides to your destination.</p>
                    </Link>
                    
                    <Link to="/my-bookings" className="group p-6 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-md hover:border-purple-300 transition-all flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">book_online</span>
                      </div>
                      <h3 className="font-h3 text-lg text-purple-900 mb-2">My Bookings</h3>
                      <p className="text-purple-700/80 text-sm">View your upcoming and past bookings.</p>
                    </Link>
                  </>
                )}

                {user.role === 'driver' && (
                  <>
                    <Link to="/post-ride" className="group p-6 bg-orange-50 rounded-2xl border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">add_circle</span>
                      </div>
                      <h3 className="font-h3 text-lg text-orange-900 mb-2">Offer a Ride</h3>
                      <p className="text-orange-700/80 text-sm">Create a new ride and share your journey.</p>
                    </Link>
                    
                    <Link to="/manage-rides" className="group p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">directions_car</span>
                      </div>
                      <h3 className="font-h3 text-lg text-blue-900 mb-2">Manage My Rides</h3>
                      <p className="text-blue-700/80 text-sm">View and manage the rides you have offered.</p>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
              <h2 className="font-h3 text-xl text-emerald-900">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="font-label-md text-slate-700 block">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200">
                    {editForm.profilePicture ? (
                      <img src={URL.createObjectURL(editForm.profilePicture)} alt="Preview" className="w-full h-full object-cover" />
                    ) : profileImageUrl ? (
                      <img src={profileImageUrl} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">image</span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    name="profilePicture" 
                    accept="image/*" 
                    onChange={handleEditChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-slate-700 block">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-slate-700 block">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-body-md"
                />
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
                  {updating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Dashboard;