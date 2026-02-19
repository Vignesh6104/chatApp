const express = require('express');
const ChatMessage = require('../models/ChatMessage');

// We need IO instance to emit deletion event.
// Since router is separate, typically you'd pass IO or trigger it from controller
// For simplicity in this structure, we'll keep the basic router but we might need
// to adjust server.js to pass io, or just emit from client (less secure) or
// require the io instance if exported (circular dep possible).
// A common pattern is to export a function that accepts io, or use app.set/get.
// Let's rely on server.js requiring this. Wait, server.js uses the router.
// Hack: We will look for individual message deletion by ID.

const router = express.Router();

// GET all chat messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// DELETE single message
router.delete('/message/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // In a real app, verify req.user via middleware owns this message
    await ChatMessage.destroy({ where: { id } });

    // Emitting event needs the IO instance. 
    // We can't easily access the IO instance created in server.js here without restructuring.
    // Quick fix: The client will handle the UI update optimistcally or we rely on page refresh?
    // No, we need the socket event to notify OTHER users.
    // Let's assume we can attach io to req (middleware in server.js) or just return success and let client emit 'message_deleted' (less secure but works for this demo).
    // A better approach for this files structure:
    // Use req.app.get('io') if we set it in server.js

    const io = req.app.get('io');
    if (io) {
      io.emit('message_deleted', parseInt(id));
    }

    res.status(200).json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// DELETE all chat messages
router.delete('/messages', async (req, res) => {
  try {
    await ChatMessage.destroy({
      where: {},
      truncate: true
    });
    const io = req.app.get('io');
    if (io) io.emit('messages_cleared'); // Optional: nice to have

    res.status(200).json({ message: 'All messages cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = router;
