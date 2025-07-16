const { feedbackConnection } = require('../server'); // use the specific connection

const feedbackSchema = new feedbackConnection.Schema({
  name: String,
  feedback: String,
  user: {
    type: feedbackConnection.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = feedbackConnection.model('Feedback', feedbackSchema);
