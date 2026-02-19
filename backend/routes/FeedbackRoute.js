const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const authMiddleware = require('../middleware/auth');

// POST feedback (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, feedback } = req.body;
    await Feedback.create({
      name,
      feedback,
      user: req.user.id.toString() // Ensure it's stored as string if schema expects it, or change schema
    });
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all feedbacks (public)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
