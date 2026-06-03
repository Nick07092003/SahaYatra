const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['passenger', 'driver'],
        default: 'passenger'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },

    // ── Driver Bio & Experience ────────────────────────────────────────────
    driverDetails: {
        bio: { type: String, default: '' },
        experienceYears: { type: Number, default: 0 },
        languages: { type: [String], default: [] },
        // Computed / manually updated stat
        totalRides: { type: Number, default: 0 }
    },

    // ── Vehicle Info ──────────────────────────────────────────────────────
    vehicleDetails: {
        make: { type: String, default: '' },        // e.g. "Maruti"
        model: { type: String, default: '' },       // e.g. "Swift Dzire"
        year: { type: Number, default: null },       // e.g. 2021
        color: { type: String, default: '' },       // e.g. "White"
        plateNumber: { type: String, default: '' }, // e.g. "MH12AB1234"
        type: {
            type: String,
            enum: ['sedan', 'suv', 'hatchback', 'mpv', 'other'],
            default: 'sedan'
        }
    },

    // ── Identity & Verification ───────────────────────────────────────────
    verification: {
        isVerified: { type: Boolean, default: false },
        licenseNumber: { type: String, default: '' },
        licenseDocument: { type: String, default: '' }, // file path
        aadharNumber: { type: String, default: '' },
        aadharDocument: { type: String, default: '' },  // file path
        submittedAt: { type: Date, default: null }
    }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
