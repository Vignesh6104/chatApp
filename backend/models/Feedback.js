const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user: {
    type: DataTypes.STRING, // Storing user ID or name as string
    allowNull: true
  }
});

module.exports = Feedback;
