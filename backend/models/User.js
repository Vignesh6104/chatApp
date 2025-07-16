const mongoose = require('mongoose');
const { usersConnection } = require('../db');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

module.exports = usersConnection.model('User', userSchema);
