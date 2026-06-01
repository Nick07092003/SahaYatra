// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const rideRoutes = require('./routes/rideRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Allowed origins: localhost for dev, Vercel for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sahayatra.vercel.app',
    'http://sahayatra.vercel.app',
    process.env.FRONTEND_URL, // Extra override if needed
].filter(Boolean);

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
app.use('/api/chat', chatRoutes);

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

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a unique room for a ride's private chat between two users
    socket.on('join_room', ({ rideId, userId1, userId2 }) => {
        // Create a consistent room name regardless of who joins first
        const users = [userId1, userId2].sort();
        const room = `${rideId}_${users[0]}_${users[1]}`;
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
        try {
            const { rideId, senderId, receiverId, text } = data;
            
            // Save to database
            const newMessage = new Message({
                rideId,
                sender: senderId,
                receiver: receiverId,
                text
            });
            await newMessage.save();

            // Emit to the room
            const users = [senderId, receiverId].sort();
            const room = `${rideId}_${users[0]}_${users[1]}`;
            io.to(room).emit('receive_message', newMessage);
            
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
