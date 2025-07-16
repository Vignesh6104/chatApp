// backend/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const usersConnection = mongoose.createConnection(process.env.MONGO_URI_USERS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const feedbackConnection = mongoose.createConnection(process.env.MONGO_URI_FEEDBACK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = { usersConnection, feedbackConnection };
