const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');

// Helper function to calculate distance using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
}

// @route   POST /api/rides/create
// @desc    Create a new ride
router.post('/create', async (req, res) => {
    try {
        const { source, destination, date, time, price, seats, driver, waypoints } = req.body;

        const newRide = new Ride({
            source,
            destination,
            date,
            time,
            price,
            seats,
            driver,
            waypoints
        });

        const ride = await newRide.save();
        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/rides/search
// @desc    Search for rides using en-route spatial pathing
router.get('/search', async (req, res) => {
    try {
        const { source, destination, sourceLat, sourceLng, destLat, destLng, date, seats } = req.query;

        let query = {};
        
        // Exact text match (fallback for older rides without coordinates)
        if (source && destination && (!sourceLat || !destLat)) {
            query['source.address'] = { $regex: source, $options: 'i' };
            query['destination.address'] = { $regex: destination, $options: 'i' };
        }
        
        // Advanced En-Route Path Matching using waypoints
        if (sourceLat && sourceLng && destLat && destLng) {
            const radiusInKm = 10;
            const radiusInRadians = radiusInKm / 6378.1;

            query.$or = [
                {
                    $and: [
                        { "waypoints.location": { $geoWithin: { $centerSphere: [ [parseFloat(sourceLng), parseFloat(sourceLat)], radiusInRadians ] } } },
                        { "waypoints.location": { $geoWithin: { $centerSphere: [ [parseFloat(destLng), parseFloat(destLat)], radiusInRadians ] } } }
                    ]
                },
                {
                    $and: [
                        { "source.location": { $geoWithin: { $centerSphere: [ [parseFloat(sourceLng), parseFloat(sourceLat)], radiusInRadians ] } } },
                        { "destination.location": { $geoWithin: { $centerSphere: [ [parseFloat(destLng), parseFloat(destLat)], radiusInRadians ] } } }
                    ]
                }
            ];
        }

        if (date) query.date = date;
        if (seats) query.seats = { $gte: seats };

        let rides = await Ride.find(query).populate('driver', 'name phone profilePicture averageRating totalReviews');

        // Directionality Validation
        if (sourceLat && sourceLng && destLat && destLng) {
            rides = rides.filter(ride => {
                if (!ride.waypoints || ride.waypoints.length === 0) return true; // Keep direct matches

                let minSourceDist = Infinity;
                let minDestDist = Infinity;
                let sourceIndex = -1;
                let destIndex = -1;

                ride.waypoints.forEach((wp, index) => {
                    const [lng, lat] = wp.location.coordinates;
                    const distToSource = getDistanceFromLatLonInKm(lat, lng, parseFloat(sourceLat), parseFloat(sourceLng));
                    const distToDest = getDistanceFromLatLonInKm(lat, lng, parseFloat(destLat), parseFloat(destLng));

                    if (distToSource < minSourceDist && distToSource <= 10) {
                        minSourceDist = distToSource;
                        sourceIndex = index;
                    }
                    if (distToDest < minDestDist && distToDest <= 10) {
                        minDestDist = distToDest;
                        destIndex = index;
                    }
                });

                return (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex) || 
                       (minSourceDist <= 10 && minDestDist <= 10 && sourceIndex === -1 && destIndex === -1);
            });
        }

        // Filter out past rides
        const now = new Date();
        rides = rides.filter(ride => {
            const [year, month, day] = ride.date.split('-').map(Number);
            const [hours, minutes] = ride.time.split(':').map(Number);
            const rideDate = new Date(year, month - 1, day, hours, minutes);
            return rideDate > now;
        });

        res.status(200).json(rides);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/rides/update/:id
// @desc    Update ride details
router.put('/update/:id', async (req, res) => {
    try {
        const updatedRide = await Ride.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedRide) return res.status(404).json({ message: "Ride not found" });
        res.status(200).json(updatedRide);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/rides/my-bookings/:userId
// @desc    Get all rides booked or requested by a specific passenger
router.get('/my-bookings/:userId', async (req, res) => {
    try {
        const rides = await Ride.find({ 
            $or: [
                { passengers: req.params.userId },
                { "requests.passenger": req.params.userId }
            ]
        }).populate('driver', 'name phone profilePicture averageRating'); 
            
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
            .populate('passengers', 'name phone profilePicture')
            .populate('requests.passenger', 'name phone profilePicture'); 
            
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/rides/request/:id
// @desc    Request a seat on a ride
router.put('/request/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.seats <= 0) return res.status(400).json({ message: 'No seats available' });

        if (ride.passengers.includes(req.body.userId)) {
            return res.status(400).json({ message: 'You are already a passenger on this ride.' });
        }
        if (ride.requests.some(r => r.passenger.toString() === req.body.userId && r.status === 'pending')) {
            return res.status(400).json({ message: 'You already have a pending request.' });
        }

        ride.requests.push({
            passenger: req.body.userId,
            pickupLocation: req.body.pickupLocation,
            dropLocation: req.body.dropLocation,
            status: 'pending'
        });

        await ride.save();
        res.json({ message: 'Ride requested successfully! Waiting for driver approval.', ride });

    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   PUT /api/rides/:id/request/:requestId/accept
// @desc    Accept a ride request
router.put('/:id/request/:requestId/accept', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        const request = ride.requests.id(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
        if (ride.seats <= 0) return res.status(400).json({ message: 'No seats available to accept this request' });

        request.status = 'accepted';
        ride.passengers.push(request.passenger);
        ride.seats -= 1;

        await ride.save();
        res.json({ message: 'Request accepted!', ride });
    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   PUT /api/rides/:id/request/:requestId/reject
// @desc    Reject a ride request
router.put('/:id/request/:requestId/reject', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        const request = ride.requests.id(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

        request.status = 'rejected';
        await ride.save();
        res.json({ message: 'Request rejected.', ride });
    } catch (err) {
        res.status(500).json(err);
    }
});

// @route   PUT /api/rides/cancel-booking/:id
// @desc    Cancel a booked seat or request
router.put('/cancel-booking/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if user is a passenger (accepted booking)
        const isPassenger = ride.passengers.includes(req.body.userId);
        
        // Remove from passengers if they were one
        if (isPassenger) {
            ride.passengers = ride.passengers.filter(
                (passengerId) => passengerId.toString() !== req.body.userId
            );
            ride.seats += 1; 
        }

        // Also remove any requests by this user (pending or accepted)
        const requestCountBefore = ride.requests.length;
        ride.requests = ride.requests.filter(
            (reqObj) => reqObj.passenger && reqObj.passenger.toString() !== req.body.userId
        );

        if (!isPassenger && ride.requests.length === requestCountBefore) {
            return res.status(400).json({ message: "You haven't booked or requested this ride." });
        }

        await ride.save();
        res.json({ message: 'Booking/Request cancelled successfully!', ride });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/rides/delete/:id
// @desc    Delete a ride
router.delete('/delete/:id', async (req, res) => {
    try {
        const ride = await Ride.findByIdAndDelete(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        res.status(200).json({ message: 'Ride deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
