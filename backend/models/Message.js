const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries to get a chat thread
MessageSchema.index({ rideId: 1, sender: 1, receiver: 1 });
MessageSchema.index({ rideId: 1, receiver: 1, sender: 1 });

module.exports = mongoose.model('Message', MessageSchema);
