// frontend/src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route-based code splitting ────────────────────────────────────────────
// Each page becomes its own JS chunk — downloaded only when first visited.
// The initial bundle shrinks dramatically, making first paint much faster.
const Home        = lazy(() => import('./pages/Home'));
const Register    = lazy(() => import('./pages/Register'));
const Login       = lazy(() => import('./pages/Login'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const PostRide    = lazy(() => import('./pages/PostRide'));
const SearchRides = lazy(() => import('./pages/SearchRides'));
const ManageRides = lazy(() => import('./pages/ManageRides'));
const MyBookings  = lazy(() => import('./pages/MyBookings'));
const RideHistory = lazy(() => import('./pages/RideHistory'));
const Support     = lazy(() => import('./pages/Support'));

// ── Page loading skeleton ─────────────────────────────────────────────────
// Shown while a lazy chunk is being downloaded.
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin" />
    </div>
    <p className="text-sm text-slate-400 font-semibold animate-pulse">Loading…</p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/post-ride"    element={<PostRide />} />
        <Route path="/search-rides" element={<SearchRides />} />
        <Route path="/manage-rides" element={<ManageRides />} />
        <Route path="/my-bookings"  element={<MyBookings />} />
        <Route path="/history"      element={<RideHistory />} />
        <Route path="/support"      element={<Support />} />
      </Routes>
    </Suspense>
  );
}

export default App;
