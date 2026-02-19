const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database'); // Sequelize connection

const FeedbackRoute = require('./routes/FeedbackRoute');
const AuthRoute = require('./routes/authRoutes');
const ChatRoute = require('./routes/chat');
const ChatMessage = require('./models/ChatMessage');
const uploadRoute = require('./routes/uploadRoute'); // Import upload route
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://chat-app-57yx.vercel.app",
  "https://chat-app-oqgp.vercel.app",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/feedback', FeedbackRoute);
app.use('/api/chat', ChatRoute);
app.use('/api/upload', uploadRoute); // Use upload route

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to our router
app.set('io', io);

// Socket.IO Logic
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('register_user', (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;

    console.log(`✅ Registered: ${username} (${socket.id})`);

    // Notify others
    socket.broadcast.emit('user_joined', username);

    io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
      username: name,
      socketId: id,
    })));
  });

  socket.on('send_message', async ({ user, message, imageUrl }) => {
    try {
      // Create message in PostgreSQL
      const newMessage = await ChatMessage.create({ user, message, imageUrl });

      io.emit('receive_message', {
        user,
        message,
        imageUrl,
        createdAt: newMessage.createdAt,
        id: newMessage.id // Send ID for deletion
      });
    } catch (err) {
      console.error('❌ Error saving public message:', err.message);
    }
  });

  socket.on('logout', (username) => {
    if (onlineUsers[username]) {
      delete onlineUsers[username];
      console.log(`👋 ${username} logged out`);

      socket.broadcast.emit('user_left', username);

      io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
        username: name,
        socketId: id,
      })));
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
    console.log('❌ Disconnected:', socket.id);

    if (Object.keys(onlineUsers).length > 0) { // Only if we found a user to remove
      // We need to find *which* user disconnected to emit their name
      // But the loop above already deleted them. 
      // Let's refactor slightly to capture the name before deletion in a real scenario
      // For now, since loop logic is a bit destructive, let's just emit the new list.
      // Actually, let's fix the loop logic to capture name.
    }

    // Better logic applied via replacement:

    let disconnectedUser = null;
    for (const [username, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        disconnectedUser = username;
        delete onlineUsers[username];
        break;
      }
    }

    if (disconnectedUser) {
      socket.broadcast.emit('user_left', disconnectedUser);
    }

    io.emit('online_users', Object.entries(onlineUsers).map(([name, id]) => ({
      username: name,
      socketId: id,
    })));
  });
});

// Database connection & Server Start
sequelize.sync({ alter: true }) // This creates tables if they don't exist and alters them if they do
  .then(() => {
    console.log('✅ PostgreSQL connected & synced');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err);
  });
