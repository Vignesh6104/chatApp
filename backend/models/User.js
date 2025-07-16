const mongoose = require('mongoose');
const { usersConnection } = require('../server');

// Define schema using global mongoose instance
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// Register model using usersConnection
module.exports = usersConnection.model('User', userSchema);
