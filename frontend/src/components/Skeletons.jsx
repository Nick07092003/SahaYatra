/**
 * Skeleton UI components — shared across all pages.
 *
 * Usage:
 *   <Skeleton className="h-6 w-48" />          — single bar
 *   <SkeletonRideCard />                        — full ride card
 *   <SkeletonDashboard />                       — dashboard profile + actions
 *   <SkeletonSearchResult count={3} />          — search result cards
 *   <SkeletonHistoryCard count={4} />           — history grid cards
 */

import React from 'react';

/* ── Base pulse block ───────────────────────────────────────────────────── */
export const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
);

/* ── Shimmer wrapper (optional richer effect) ───────────────────────────── */
const Shimmer = ({ children, className = '' }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm ${className}`}>
    {/* Shimmer highlight sweep */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-10" />
    {children}
  </div>
);

/* ── Ride Card skeleton (used by MyBookings & ManageRides) ─────────────── */
export const SkeletonRideCard = () => (
  <Shimmer className="p-6 flex flex-col md:flex-row gap-6">
    {/* Left: driver info + route */}
    <div className="flex-1 space-y-5">
      {/* Driver row */}
      <div className="flex items-center gap-4 pr-24">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Status badge placeholder */}
        <Skeleton className="h-5 w-24 rounded-full absolute top-4 right-4" />
      </div>
      {/* Route */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-0.5 h-8" />
          <Skeleton className="w-3 h-3 rounded-full" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    </div>
    {/* Right: details panel */}
    <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between gap-4">
      <div className="bg-slate-50 p-3 rounded-xl space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </Shimmer>
);

/* ── Driver ride card skeleton (ManageRides — 2-col grid) ──────────────── */
export const SkeletonDriverCard = () => (
  <Shimmer className="p-6 space-y-5">
    {/* Route header */}
    <div className="flex items-center gap-4 pr-16">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-5 w-28" />
    </div>
    {/* Date / time */}
    <div className="flex gap-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    {/* Seat occupancy */}
    <div className="flex gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="w-6 h-6 rounded-full" />
      ))}
    </div>
    {/* Passenger row */}
    <div className="pt-4 border-t border-slate-100 space-y-3">
      <Skeleton className="h-3 w-24" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    {/* Footer */}
    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
      <Skeleton className="h-6 w-16" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-16 rounded-lg" />
      </div>
    </div>
  </Shimmer>
);

/* ── Search result card skeleton ───────────────────────────────────────── */
export const SkeletonSearchCard = () => (
  <Shimmer className="p-6 space-y-5">
    <div className="flex justify-between items-start">
      <div className="flex gap-4 items-center">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col items-center gap-1 pt-1">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-0.5 h-8" />
        <Skeleton className="w-3 h-3 rounded-full" />
      </div>
      <div className="flex-1 space-y-5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-11 w-full rounded-xl" />
  </Shimmer>
);

/* ── History card skeleton ──────────────────────────────────────────────── */
export const SkeletonHistoryCard = () => (
  <Shimmer className="p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  </Shimmer>
);

/* ── Dashboard skeleton ─────────────────────────────────────────────────── */
export const SkeletonDashboard = () => (
  <div className="space-y-8 animate-pulse">
    {/* Profile header */}
    <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
      <Skeleton className="w-32 h-32 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 text-center md:text-left">
        <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
        <Skeleton className="h-4 w-36 mx-auto md:mx-0" />
        <div className="flex gap-3 justify-center md:justify-start pt-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Action grid */}
      <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
        <Skeleton className="h-7 w-44 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col items-center">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
