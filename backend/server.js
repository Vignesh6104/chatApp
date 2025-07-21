const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');
const ChatMessage = require('./models/ChatMessage');

const ChatRoute = require('./routes/chat');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','https://chat-app-jet-rho-91.vercel.app'],
    methods: ['GET', 'POST'],
  },
});


const onlineUsers = {}; // username -> socket.id

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);
app.use('/api/chat', ChatRoute);


// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // User registers after login
  socket.on('register_user', (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;

    console.log(`✅ Registered: ${username} (${socket.id})`);

    // Send updated online user list
    io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
      username: name,
      socketId: id,
    })));
  });

  // Public message
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

  // Private message
  socket.on('private_message', ({ sender, recipientSocketId, message }) => {
    try {
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_private_message', {
          user: sender,
          message,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error('❌ Error sending private message:', err.message);
    }
  });

  // Typing indicator
  socket.on('typing', (username) => {
    socket.broadcast.emit('user_typing', username);
  });

  socket.on('stop_typing', (username) => {
    socket.broadcast.emit('user_stopped_typing', username);
  });

  // Handle disconnect
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
mongoose
  .connect(process.env.MONGO_URI, {
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
