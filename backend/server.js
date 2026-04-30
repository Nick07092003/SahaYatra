// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const rideRoutes = require('./routes/rideRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

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
// Trigger nodemon restart

// Trigger nodemon restart 2
