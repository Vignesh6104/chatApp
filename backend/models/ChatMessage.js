const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  user: {
    type: DataTypes.STRING, // Keeping as string to match existing logic where username is stored
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = ChatMessage;
