import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserProfile, updateDriverDetails, updateVehicleDetails, submitVerification } from '../services/api';

/* ── Constants ──────────────────────────────────────────────────────────── */
const LANGUAGE_OPTIONS = [
  'Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam'
];

const VEHICLE_TYPES = [
  { value: 'sedan',    label: 'Sedan',    icon: 'directions_car' },
  { value: 'suv',      label: 'SUV',      icon: 'airport_shuttle' },
  { value: 'hatchback',label: 'Hatchback',icon: 'directions_car' },
  { value: 'mpv',      label: 'MPV / Van',icon: 'rv_hookup' },
  { value: 'other',    label: 'Other',    icon: 'commute' },
];

const TABS = [
  { id: 'driver',   label: 'Driver Details',      icon: 'person' },
  { id: 'vehicle',  label: 'Vehicle Details',      icon: 'directions_car' },
  { id: 'verify',   label: 'Verification',         icon: 'verified_user' },
];

/* ── Progress helper ────────────────────────────────────────────────────── */
function profileCompletion(user) {
  let score = 0;
  const dd = user?.driverDetails;
  const vd = user?.vehicleDetails;
  const vf = user?.verification;

  if (dd?.bio)              score++;
  if (dd?.experienceYears)  score++;
  if (dd?.languages?.length) score++;

  if (vd?.make && vd?.model) score++;
  if (vd?.plateNumber)       score++;
  if (vd?.color)             score++;

  if (vf?.licenseNumber)     score++;
  if (vf?.aadharNumber)      score++;
  if (vf?.licenseDocument || vf?.aadharDocument) score++;

  return Math.min(Math.round((score / 9) * 100), 100);
}

/* ── Main Component ─────────────────────────────────────────────────────── */
const DriverProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('driver');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Tab 1 — Driver Details
  const [driverForm, setDriverForm] = useState({ bio: '', experienceYears: 0, languages: [] });

  // Tab 2 — Vehicle Details
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', color: '', plateNumber: '', type: 'sedan' });

  // Tab 3 — Verification
  const [verifyForm, setVerifyForm] = useState({ licenseNumber: '', aadharNumber: '' });
  const [licenseFile, setLicenseFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const licenseRef = useRef();
  const aadharRef = useRef();

  /* ── Load user ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    const decoded = jwtDecode(token);

    getUserProfile(decoded.id).then(res => {
      const u = res.data;
      setUser(u);

      // Pre-fill forms
      if (u.driverDetails) {
        setDriverForm({
          bio: u.driverDetails.bio || '',
          experienceYears: u.driverDetails.experienceYears || 0,
          languages: u.driverDetails.languages || [],
        });
      }
      if (u.vehicleDetails) {
        setVehicleForm({
          make: u.vehicleDetails.make || '',
          model: u.vehicleDetails.model || '',
          year: u.vehicleDetails.year || '',
          color: u.vehicleDetails.color || '',
          plateNumber: u.vehicleDetails.plateNumber || '',
          type: u.vehicleDetails.type || 'sedan',
        });
      }
      if (u.verification) {
        setVerifyForm({
          licenseNumber: u.verification.licenseNumber || '',
          aadharNumber: u.verification.aadharNumber || '',
        });
      }
    }).catch(() => navigate('/login'));
  }, [navigate]);

  /* ── Toast helper ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Toggle language pill ── */
  const toggleLanguage = (lang) => {
    setDriverForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang]
    }));
  };

  /* ── Save handlers ── */
  const saveDriverDetails = async () => {
    setSaving(true);
    try {
      await updateDriverDetails(user._id, driverForm);
      showToast('Driver details saved!');
      const res = await getUserProfile(user._id);
      setUser(res.data);
    } catch { showToast('Failed to save driver details', 'error'); }
    finally { setSaving(false); }
  };

  const saveVehicleDetails = async () => {
    setSaving(true);
    try {
      await updateVehicleDetails(user._id, { ...vehicleForm, year: Number(vehicleForm.year) || null });
      showToast('Vehicle details saved!');
      const res = await getUserProfile(user._id);
      setUser(res.data);
    } catch { showToast('Failed to save vehicle details', 'error'); }
    finally { setSaving(false); }
  };

  const saveVerification = async () => {
    if (!verifyForm.licenseNumber || !verifyForm.aadharNumber) {
      return showToast('Please fill both license and Aadhar numbers', 'error');
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('licenseNumber', verifyForm.licenseNumber);
      fd.append('aadharNumber', verifyForm.aadharNumber);
      if (licenseFile) fd.append('licenseDocument', licenseFile);
      if (aadharFile)  fd.append('aadharDocument', aadharFile);

      await submitVerification(user._id, fd);
      showToast('Verification submitted! We\'ll review your documents soon.');
      const res = await getUserProfile(user._id);
      setUser(res.data);
    } catch { showToast('Failed to submit verification', 'error'); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const completion = profileCompletion(user);
  const hasSubmitted = !!user?.verification?.submittedAt;
  const isVerified  = !!user?.verification?.isVerified;

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 text-sm font-semibold mb-2 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Dashboard
            </Link>
            <h1 className="font-h1 text-2xl md:text-h2 text-slate-800">Driver Profile Setup</h1>
            <p className="text-slate-500 text-sm mt-1">Complete your profile to build trust with passengers.</p>
          </div>

          {/* Completion ring */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm shrink-0">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={completion === 100 ? '#059669' : '#10b981'}
                  strokeWidth="3"
                  strokeDasharray={`${completion} ${100 - completion}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-700">{completion}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Profile</p>
              <p className="text-sm font-bold text-slate-800">{completion === 100 ? '🎉 Complete!' : 'Incomplete'}</p>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          {/* ── Tab 1: Driver Details ── */}
          {activeTab === 'driver' && (
            <motion.div key="driver" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">person</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">About You</h2>
                    <p className="text-slate-500 text-sm">Tell passengers a bit about yourself as a driver.</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">edit_note</span>
                    Driver Bio
                  </label>
                  <textarea
                    value={driverForm.bio}
                    onChange={e => setDriverForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Hi! I'm a safe and punctual driver with 5 years of experience. I keep my car clean and love good music on long drives..."
                    rows={4}
                    maxLength={400}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 text-right">{driverForm.bio.length}/400</p>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">timeline</span>
                    Years of Experience
                    <span className="ml-auto bg-emerald-100 text-emerald-700 font-extrabold text-sm px-3 py-0.5 rounded-full">
                      {driverForm.experienceYears} yr{driverForm.experienceYears !== 1 ? 's' : ''}
                    </span>
                  </label>
                  <input
                    type="range" min={0} max={30} step={1}
                    value={driverForm.experienceYears}
                    onChange={e => setDriverForm(f => ({ ...f, experienceYears: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0 yrs</span><span>15 yrs</span><span>30 yrs</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">language</span>
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => {
                      const selected = driverForm.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                            selected
                              ? 'bg-emerald-600 text-white border-emerald-600 scale-105'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={saveDriverDetails}
                  disabled={saving}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><span className="material-symbols-outlined text-[18px]">save</span> Save Driver Details</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Tab 2: Vehicle Details ── */}
          {activeTab === 'vehicle' && (
            <motion.div key="vehicle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">directions_car</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Your Vehicle</h2>
                    <p className="text-slate-500 text-sm">Help passengers identify your vehicle at pickup.</p>
                  </div>
                </div>

                {/* Vehicle type pills */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vehicle Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {VEHICLE_TYPES.map(vt => (
                      <button
                        key={vt.value}
                        type="button"
                        onClick={() => setVehicleForm(f => ({ ...f, type: vt.value }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          vehicleForm.type === vt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">{vt.icon}</span>
                        {vt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Make + Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Make (Brand)</label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(f => ({ ...f, make: e.target.value }))}
                      placeholder="e.g. Maruti, Honda, Hyundai"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Model</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm(f => ({ ...f, model: e.target.value }))}
                      placeholder="e.g. Swift Dzire, City, Creta"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Year + Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Year</label>
                    <input
                      type="number"
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(f => ({ ...f, year: e.target.value }))}
                      placeholder="e.g. 2021"
                      min={1990} max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Color
                      {vehicleForm.color && (
                        <span className="text-xs font-normal text-slate-500">({vehicleForm.color})</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={e => setVehicleForm(f => ({ ...f, color: e.target.value }))}
                      placeholder="e.g. White, Silver, Red"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Plate number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Number Plate</label>
                  <input
                    type="text"
                    value={vehicleForm.plateNumber}
                    onChange={e => setVehicleForm(f => ({ ...f, plateNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. MH12AB1234"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-mono tracking-widest uppercase"
                  />
                </div>

                {/* Preview card */}
                {(vehicleForm.make || vehicleForm.model) && (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-white">
                        {VEHICLE_TYPES.find(v => v.value === vehicleForm.type)?.icon || 'directions_car'}
                      </span>
                    </div>
                    <div>
                      <p className="font-extrabold text-lg">{[vehicleForm.make, vehicleForm.model].filter(Boolean).join(' ')}</p>
                      <p className="text-slate-400 text-sm">
                        {[vehicleForm.year, vehicleForm.color].filter(Boolean).join(' · ')}
                      </p>
                      {vehicleForm.plateNumber && (
                        <span className="inline-block mt-1 bg-white text-slate-900 text-xs font-extrabold px-3 py-0.5 rounded font-mono tracking-widest">
                          {vehicleForm.plateNumber}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={saveVehicleDetails}
                  disabled={saving}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><span className="material-symbols-outlined text-[18px]">save</span> Save Vehicle Details</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Tab 3: Verification ── */}
          {activeTab === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              {/* Status banner */}
              {isVerified ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <span className="material-symbols-outlined text-3xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <p className="font-bold text-emerald-800">Verified Driver ✅</p>
                    <p className="text-emerald-700 text-sm">Your identity has been verified. Passengers see a verified badge on your rides.</p>
                  </div>
                </div>
              ) : hasSubmitted ? (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <span className="material-symbols-outlined text-3xl text-orange-500">pending</span>
                  <div>
                    <p className="font-bold text-orange-800">Verification Pending Review</p>
                    <p className="text-orange-700 text-sm">We received your documents and will verify them within 1–2 business days.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <span className="material-symbols-outlined text-3xl text-blue-500">info</span>
                  <div>
                    <p className="font-bold text-blue-800">Complete Verification</p>
                    <p className="text-blue-700 text-sm">Submit your license and Aadhar to get a verified badge. Documents are kept private.</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600">verified_user</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Identity Documents</h2>
                    <p className="text-slate-500 text-sm">Your documents are encrypted and never shared publicly.</p>
                  </div>
                </div>

                {/* Driving License */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">credit_card</span>
                    Driving License
                    {user?.verification?.licenseNumber && (
                      <span className="ml-auto text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Saved
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={verifyForm.licenseNumber}
                    onChange={e => setVerifyForm(f => ({ ...f, licenseNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. MH1420120012345"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-mono tracking-wider"
                  />
                  {/* File upload */}
                  <div
                    onClick={() => licenseRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${licenseFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50/50'}`}
                  >
                    <input ref={licenseRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setLicenseFile(e.target.files[0])} />
                    <span className="material-symbols-outlined text-2xl text-slate-400">{licenseFile ? 'check_circle' : 'upload_file'}</span>
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      {licenseFile ? licenseFile.name : (user?.verification?.licenseDocument ? '📎 Document on file — click to replace' : 'Upload License Image or PDF')}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG, PDF — max 5MB</p>
                  </div>
                </div>

                {/* Aadhar */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">badge</span>
                    Aadhar Card
                    {user?.verification?.aadharNumber && (
                      <span className="ml-auto text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Saved
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={verifyForm.aadharNumber}
                    onChange={e => setVerifyForm(f => ({ ...f, aadharNumber: e.target.value.replace(/\D/g,'').slice(0,12) }))}
                    placeholder="12-digit Aadhar number"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-mono tracking-widest"
                    maxLength={12}
                  />
                  <div
                    onClick={() => aadharRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${aadharFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50/50'}`}
                  >
                    <input ref={aadharRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setAadharFile(e.target.files[0])} />
                    <span className="material-symbols-outlined text-2xl text-slate-400">{aadharFile ? 'check_circle' : 'upload_file'}</span>
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      {aadharFile ? aadharFile.name : (user?.verification?.aadharDocument ? '📎 Document on file — click to replace' : 'Upload Aadhar Image or PDF')}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG, PDF — max 5MB</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">lock</span>
                  Your Aadhar number will be masked (XXXX-XXXX-1234) and documents are only accessible to our verification team.
                </p>

                <button
                  onClick={saveVerification}
                  disabled={saving || isVerified}
                  className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                  ) : isVerified ? (
                    <><span className="material-symbols-outlined text-[18px]">verified</span> Already Verified</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">send</span> Submit for Verification</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-xl text-white font-bold text-sm ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default DriverProfile;
