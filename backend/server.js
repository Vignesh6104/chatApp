// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(' MongoDB connected');
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
})
.catch((err) => {
  console.error(' MongoDB connection error:', err);
});
