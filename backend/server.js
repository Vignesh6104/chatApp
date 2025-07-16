// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');
const { usersConnection, feedbackConnection } = require('./db'); // ✅ IMPORT HERE

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://feedback-64kwb82ti-vignesh6104s-projects.vercel.app'
];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);

// Start server after DBs connected
Promise.all([
  usersConnection.asPromise(),
  feedbackConnection.asPromise()
]).then(() => {
  console.log('MongoDB databases connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Error connecting to databases:', err);
});
