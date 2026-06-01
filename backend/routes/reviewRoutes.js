const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// @route   POST /api/reviews/create
// @desc    Submit a new review and update user's average rating
router.post('/create', async (req, res) => {
    try {
        const { reviewer, reviewee, ride, rating, comment, roleAtTime } = req.body;

        // Ensure reviewee exists
        const userToReview = await User.findById(reviewee);
        if (!userToReview) return res.status(404).json({ message: "User not found" });

        // Check if review already exists for this ride by this reviewer
        const existingReview = await Review.findOne({ reviewer, ride });
        if (existingReview) return res.status(400).json({ message: "You have already reviewed this ride." });

        // Create the review
        const newReview = new Review({
            reviewer,
            reviewee,
            ride,
            rating,
            comment,
            roleAtTime
        });

        await newReview.save();

        // Recalculate average rating
        const allReviews = await Review.find({ reviewee });
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const newAverage = totalRating / allReviews.length;

        userToReview.averageRating = Number(newAverage.toFixed(1));
        userToReview.totalReviews = allReviews.length;
        await userToReview.save();

        res.status(201).json({ message: "Review submitted successfully!", review: newReview, newAverage: userToReview.averageRating });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this ride." });
        }
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate('reviewer', 'name profilePicture')
            .sort({ createdAt: -1 });
            
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
