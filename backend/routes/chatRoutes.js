const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// @route   GET /api/chat/:rideId/:otherUserId
// @desc    Get chat history between current user and other user for a specific ride
// @access  Private
router.get('/:rideId/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const { rideId, otherUserId } = req.params;
        const userId = req.user.id;

        // Fetch messages where the ride matches and participants are the current user and the other user
        const messages = await Message.find({
            rideId: rideId,
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 }); // Oldest to newest

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/chat/read/:rideId/:senderId
// @desc    Mark messages from a sender as read in a specific ride
// @access  Private
router.put('/read/:rideId/:senderId', authMiddleware, async (req, res) => {
    try {
        const { rideId, senderId } = req.params;
        const receiverId = req.user.id;

        await Message.updateMany(
            { rideId, sender: senderId, receiver: receiverId, read: false },
            { $set: { read: true } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
