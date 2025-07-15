const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const authMiddleware = require('../middleware/auth');

// POST feedback (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, feedback } = req.body;
    const newFeedback = new Feedback({
      name,
      feedback,
      user: req.user.id
    });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all feedbacks (public)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
