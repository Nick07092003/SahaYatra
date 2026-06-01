const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, phone, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ 
            message: "User Registered Successfully!",
            token: generateToken(user._id, user.role, user.name) // <--- UPDATED
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role, user.name) // <--- UPDATED
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. TOKEN GENERATOR
const generateToken = (id, role, name) => {
    return jwt.sign({ id, role, name }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Get all users (for testing only)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}); // Get everyone
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/auth/:id
// @desc    Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// @route   POST /api/auth/google-login
// @desc    Login or Register with Google
router.post('/google-login', async (req, res) => {
    const { token, role } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        });
        const payload = ticket.getPayload();
        
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            // Register new user
            user = new User({
                name: payload.name,
                email: payload.email,
                profilePicture: payload.picture,
                role: role || 'passenger'
            });
            await user.save();
        }
        
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id, user.role, user.name)
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid Google Token" });
    }
});

// @route   GET /api/auth/me/:id
// @desc    Get current user profile
router.get('/me/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/auth/update/:id
// @desc    Update user profile details and picture
router.put('/update/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (req.file) updateData.profilePicture = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/auth/switch-role/:id
// @desc    Toggle user role between passenger and driver
router.put('/switch-role/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = user.role === 'passenger' ? 'driver' : 'passenger';
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id, user.role, user.name)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;