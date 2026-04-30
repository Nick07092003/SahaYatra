import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Support = () => {
  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full text-center">
        <div className="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant shadow-lg mt-10">
          <span className="material-symbols-outlined text-6xl text-emerald-500 mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
          <h1 className="font-h1 text-h2 text-slate-800 mb-4">How can we help you?</h1>
          <p className="font-body-lg text-slate-500 mb-8 max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with bookings, verification, or any issues you might encounter on your journey.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">chat</span>
              Live Chat
            </button>
            <button className="bg-slate-100 text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              Email Support
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
