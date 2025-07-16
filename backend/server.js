const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup for local & Vercel frontend
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

// ✅ Create separate MongoDB connections
const usersConnection = mongoose.createConnection(process.env.MONGO_URI_USERS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const feedbackConnection = mongoose.createConnection(process.env.MONGO_URI_FEEDBACK, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ✅ Export connections so models can use them
module.exports = {
  usersConnection,
  feedbackConnection
};

// ✅ Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);

// ✅ Only start server after both DBs are connected
Promise.all([
  usersConnection.asPromise(),
  feedbackConnection.asPromise()
]).then(() => {
  console.log('Both MongoDB databases connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Error connecting to databases:', err);
});
