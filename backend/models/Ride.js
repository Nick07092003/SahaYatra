const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    source: {
        address: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
        }
    },
    destination: {
        address: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
        }
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    passengers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    waypoints: [{
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
        }
    }],
    requests: [{
        passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        pickupLocation: { type: String, required: true },
        dropLocation: { type: String, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

RideSchema.index({ "source.location": "2dsphere" });
RideSchema.index({ "destination.location": "2dsphere" });
RideSchema.index({ "waypoints.location": "2dsphere" });

module.exports = mongoose.model('Ride', RideSchema);
