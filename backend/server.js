const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');
const ChatRoute = require('./routes/chat');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://chat-app-jet-rho-91.vercel.app',
  'https://chat-ckr6j3mng-vignesh6104s-projects.vercel.app',
];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);
app.use('/api/chat', ChatRoute);

// HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO Logic
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('register_user', (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;

    console.log(`✅ Registered: ${username} (${socket.id})`);

    io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
      username: name,
      socketId: id,
    })));
  });

  socket.on('send_message', async ({ user, message }) => {
    try {
      const newMessage = new ChatMessage({ user, message });
      await newMessage.save();

      io.emit('receive_message', {
        user,
        message,
        createdAt: newMessage.createdAt,
      });
    } catch (err) {
      console.error('❌ Error saving public message:', err.message);
    }
  });

  socket.on('private_message', ({ sender, recipientSocketId, message }) => {
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_private_message', {
        user: sender,
        message,
        createdAt: new Date(),
      });
    }
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('user_typing', username);
  });

  socket.on('stop_typing', (username) => {
    socket.broadcast.emit('user_stopped_typing', username);
  });

  socket.on('disconnect', () => {
    for (const [username, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        delete onlineUsers[username];
        break;
      }
    }

    console.log('❌ Disconnected:', socket.id);

    io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
      username: name,
      socketId: id,
    })));
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
