const express = require('express');
const ChatMessage = require('../models/ChatMessage');

const router = express.Router();

// GET all chat messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// DELETE all chat messages
router.delete('/messages', async (req, res) => {
  try {
    await ChatMessage.deleteMany({});
    res.status(200).json({ message: 'All messages cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = router;
