const mongoose = require('mongoose');
const { feedbackConnection } = require('../db');

const feedbackSchema = new mongoose.Schema({
  name: String,
  feedback: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = feedbackConnection.model('Feedback', feedbackSchema);
