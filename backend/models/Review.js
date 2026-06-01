const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    roleAtTime: {
        type: String,
        enum: ['passenger', 'driver'],
        required: true
    }
}, { timestamps: true });

// Ensure a user can only review a specific ride once
ReviewSchema.index({ reviewer: 1, ride: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
