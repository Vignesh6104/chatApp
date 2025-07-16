// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');
const { usersConnection, feedbackConnection } = require('./db'); // ✅ IMPORT HERE

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const cors = require('cors');

const allowedOrigins = ['https://feed-back-nten-x4fw6ugqj-vignesh6104s-projects.vercel.app'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
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
