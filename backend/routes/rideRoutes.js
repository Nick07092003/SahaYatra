// backend/routes/rideRoutes.js
const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride'); 

// @route   POST /api/rides/create
// @desc    Create a new ride (Driver only)
router.post('/create', async (req, res) => {
    try {
        const newRide = new Ride(req.body);
        const savedRide = await newRide.save();
        res.status(201).json(savedRide);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   GET /api/rides/search
// @desc    Search for rides by Source & Destination
router.get('/search', async (req, res) => {
    try {
        const { source, destination } = req.query;
        
        // Find rides where source/dest matches (case-insensitive)
        const rides = await Ride.find({
            source: { $regex: source, $options: "i" },
            destination: { $regex: destination, $options: "i" }
        }).populate('driver', 'name'); 

        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 👇 THIS WAS THE MISSING PIECE! 👇
// @route   GET /api/rides/my-bookings/:userId
// @desc    Get all rides booked by a specific passenger
router.get('/my-bookings/:userId', async (req, res) => {
    try {
        // Find rides where the passengers array contains the userId
        const rides = await Ride.find({ passengers: req.params.userId })
            .populate('driver', 'name phone'); 
            
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   GET /api/rides/driver/:driverId
// @desc    Get all rides posted by a specific driver and their passengers
router.get('/driver/:driverId', async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.params.driverId })
            .populate('passengers', 'name phone'); 
            
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/rides/book/:id
// @desc    Book a seat on a ride
router.put('/book/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.seats <= 0) {
            return res.status(400).json({ message: "No seats available" });
        }

        // Add passenger ID to the list
        ride.passengers.push(req.body.userId);
        ride.seats -= 1; // Decrease available seats

        await ride.save();
        res.json({ message: "Ride booked successfully!", ride });

    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   PUT /api/rides/cancel-booking/:id
// @desc    Cancel a booked seat
router.put('/cancel-booking/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check if the user is actually in the passengers list
        const isBooked = ride.passengers.includes(req.body.userId);
        if (!isBooked) {
            return res.status(400).json({ message: "You haven't booked this ride." });
        }

        // Remove the passenger from the array
        ride.passengers = ride.passengers.filter(
            (passengerId) => passengerId.toString() !== req.body.userId
        );
        
        // Give the seat back to the driver
        ride.seats += 1; 

        await ride.save();
        res.json({ message: "Booking cancelled successfully!", ride });

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;