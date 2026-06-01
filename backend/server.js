// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const rideRoutes = require('./routes/rideRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();
const app = express();

// Allowed origins: localhost for dev, FRONTEND_URL env var for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Set this to your Vercel URL in Render's env vars
].filter(Boolean); // Remove undefined values

// Middleware
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Health check endpoint for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/reviews', reviewRoutes);

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
