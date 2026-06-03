import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const navigate = useNavigate();

  const handleProtectedNavigation = (path, e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login; pass intended destination so Login can redirect back
      navigate('/login', { state: { from: path, message: 'Please log in to continue.' } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-xl pb-xl px-margin overflow-hidden">
          {/* Parallax Background — responsive srcset: 640w mobile, 1280w tablet, 1920w desktop */}
          <div className="absolute inset-0 z-0">
            <motion.div 
              style={{ y: backgroundY }}
              className="absolute inset-0 z-0"
            >
              <motion.div 
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="w-full h-full overflow-hidden"
              >
                {/* 
                  Responsive hero image:
                  - Mobile  (≤640px):  640w  ≈ ~40KB
                  - Tablet  (≤1280px): 1280w ≈ ~100KB
                  - Desktop (>1280px): 1920w ≈ ~180KB
                  fetchpriority="high" = LCP image, load as early as possible
                */}
                <img
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=75&w=1280"
                  srcSet="
                    https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=60&w=640  640w,
                    https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=70&w=1280 1280w,
                    https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1920 1920w
                  "
                  sizes="100vw"
                  alt="City street view for hero background"
                  className="w-full h-full object-cover object-center scale-[1.15] motion-safe:transition-transform"
                  fetchPriority="high"
                  decoding="async"
                />
              </motion.div>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <motion.div 
              className="max-w-2xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-label-md text-sm border border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Over 10,000 trusted riders
                </span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="font-h1 text-h1 text-on-background mb-md leading-tight"
              >
                Confident Commuting for the Modern Community.
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="font-body-lg text-body-lg text-secondary mb-xl leading-relaxed"
              >
                Bridge the gap between environmental consciousness and unwavering reliability. Join SahaYatra's trusted network of carpoolers.
              </motion.p>
              
              {/* Search Widget */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                className="bg-surface-container-lowest p-md rounded-2xl shadow-xl border border-outline-variant flex flex-col md:flex-row gap-4 relative overflow-hidden group transition-all duration-300"
              >
                {/* Shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full min-w-0 text-slate-800 font-body-md p-0 outline-none placeholder:text-slate-400" placeholder="Leaving from..." type="text"/>
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <span className="material-symbols-outlined text-primary">near_me</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full min-w-0 text-slate-800 font-body-md p-0 outline-none placeholder:text-slate-400" placeholder="Going to..." type="text"/>
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full min-w-0 font-body-md p-0 outline-none text-slate-500" type="date"/>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleProtectedNavigation('/search-rides', e)}
                  className="bg-primary text-on-primary px-xl py-3 rounded-xl font-label-md hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  Search
                </motion.button>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-lg flex flex-wrap gap-4 items-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={(e) => handleProtectedNavigation('/post-ride', e)}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-lg py-3 rounded-full font-label-md hover:opacity-90 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">directions_car</span>
                    Offer a Ride
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a href="#how-it-works" className="flex items-center gap-2 border-2 border-outline text-secondary px-lg py-3 rounded-full font-label-md hover:bg-surface-container-low hover:text-on-surface transition-all">
                    <span className="material-symbols-outlined text-sm">info</span>
                    How it Works
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features Section — deferred rendering until scrolled into view */}
        <section id="how-it-works" className="cv-auto py-24 px-margin max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="font-h2 text-h2 text-on-background mb-sm">Why choose SahaYatra?</h2>
            <p className="font-body-md text-secondary text-lg">The helpful, high-tech concierge for your daily journey.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature: Trust */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row gap-8 items-center group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-tertiary mb-4">
                  <span className="material-symbols-outlined p-2 bg-blue-50 rounded-lg text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="font-label-md uppercase tracking-wider text-blue-600">Verified Profiles</span>
                </div>
                <h3 className="font-h3 text-h3 text-on-background mb-4">Community Trust is our Currency.</h3>
                <p className="font-body-md text-secondary mb-6 leading-relaxed">Every SahaYatra member undergoes a multi-step verification process, including ID checks and peer reviews, ensuring your safety is never a compromise.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">Government ID</span>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">Phone Verified</span>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span> 4.8+ Avg Rating
                  </span>
                </div>
              </div>
              <div className="w-full md:w-5/12 aspect-square rounded-2xl overflow-hidden shadow-inner relative">
                {/* Lazy-loaded responsive image: saves bandwidth on mobile */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=75&w=640"
                  srcSet="
                    https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=60&w=400  400w,
                    https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=75&w=640  640w,
                    https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=900  900w
                  "
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  alt="Diverse group of happy young professionals"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </motion.div>
            
            {/* Carbon Impact Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="relative z-10">
                <span className="material-symbols-outlined text-emerald-400 text-5xl mb-4 p-3 bg-emerald-900/30 rounded-2xl inline-block group-hover:rotate-12 transition-transform duration-300">eco</span>
                <h3 className="font-h3 text-4xl mb-2 font-extrabold text-white">12.4 Tons</h3>
                <p className="font-body-md text-slate-300 leading-relaxed">Carbon emissions saved by our community this month alone.</p>
              </div>
              <div className="mt-8 relative z-10">
                <button className="text-emerald-400 font-label-md flex items-center gap-2 hover:text-emerald-300 hover:gap-3 transition-all">
                  Track your impact <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
            </motion.div>
            
            {/* Reliability Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <span className="material-symbols-outlined text-3xl">schedule</span>
              </div>
              <h3 className="font-h3 text-xl text-on-surface mb-3">Always on Time</h3>
              <p className="font-body-md text-secondary leading-relaxed">Our smart routing and real-time tracking ensure you reach your destination without the stress of delays.</p>
            </motion.div>
            
            {/* Cost Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <h3 className="font-h3 text-xl text-on-surface mb-3">Split the Costs</h3>
              <p className="font-body-md text-secondary leading-relaxed">Reduce your monthly commuting expenses by up to 60% by sharing fuel and parking costs with peers.</p>
            </motion.div>
            
            {/* Concierge Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <span className="material-symbols-outlined text-3xl">support_agent</span>
              </div>
              <h3 className="font-h3 text-xl text-on-surface mb-3">24/7 Concierge</h3>
              <p className="font-body-md text-secondary leading-relaxed">Professional support always available to help with bookings, verification, or trip adjustments.</p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section — deferred rendering until scrolled into view */}
        <section className="cv-auto py-24 px-margin bg-emerald-50/50 dark:bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <h2 className="font-h1 text-h1 text-emerald-900 dark:text-emerald-400 mb-6 font-extrabold tracking-tight">Ready for a better commute?</h2>
            <p className="font-body-lg text-slate-600 dark:text-slate-300 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">Join thousands of commuters making the switch to a smarter, greener, and more connected way of traveling.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-full font-label-md text-lg shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:bg-emerald-700 transition-all w-full sm:w-auto font-bold"
                >
                  Join SahaYatra
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-slate-700 border-2 border-slate-200 px-10 py-4 rounded-full font-label-md text-lg hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto font-bold"
              >
                Partner with Us
              </motion.button>
            </div>
          </motion.div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
