# Modern Real-time Chat Application 💬

A full-stack real-time messaging application built with **React**, **Node.js**, **Socket.io**, and **PostgreSQL (Neon DB)**.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

-   **Real-time Communication**: Instant messaging powered by Socket.io.
-   **Authentication**: Secure User Registration & Login with JWT.
-   **Modern UI**: Beautiful, responsive interface with Dark/Light mode aesthetics.
-   **Rich Media Support**:
    -   **Emojis** 😃: Send emojis using the built-in picker.
    -   **Images** 📷: Upload and share images directly in the chat.
-   **User Experience**:
    -   **Avatars** 👤: Auto-generated unique avatars (DiceBear).
    -   **Typing Indicators**: See when others are typing...
    -   **Notifications** 🔔: Toast alerts for users joining/leaving.
    -   **Message Deletion** 🗑️: Delete your own messages instantly.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Socket.io-client, Axios, SweetAlert2, Emoji-Picker-React.
-   **Backend**: Node.js, Express, Socket.io, Multer (File Uploads).
-   **Database**: PostgreSQL (hosted on Neon), Sequelize ORM.

## 📂 Project Structure

```bash
chat/
├── backend/            # Express Server & API
│   ├── config/         # Database configuration (Sequelize)
│   ├── models/         # Database Models (User, ChatMessage, Feedback)
│   ├── routes/         # API Routes (auth, chat, upload)
│   ├── uploads/        # Directory for uploaded images
│   └── server.js       # Main entry point (Socket.io handling)
│
└── frontend/           # React Client
    ├── src/
    │   ├── components/ # Chat, Login, Register components
    │   └── ...
    └── .env            # Frontend environment variables
```

## ⚙️ Prerequisites

-   **Node.js** (v14 or higher)
-   **PostgreSQL Database** (e.g., Neon, local Postgres)

## 🔧 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd chat
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Create a .env file with your credentials (see below)
    npm start
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    # Create a .env file pointing to backend (see below)
    npm run dev
    ```

## 🔐 Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_i2vqNgIfWGe5@ep-dark-firefly-aicmxe51-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🐞 Troubleshooting

-   **`relation "ChatMessages" does not exist`**: 
    -   This means the database table hasn't been created yet.
    -   **Fix**: Restart the backend server. The code includes `sequelize.sync({ alter: true })` which creates tables automatically on startup.
-   **Images not loading (404)**:
    -   Ensure the `backend/uploads` directory exists.
    -   Check if `server.js` has the static file serving middleware: `app.use('/uploads', ...)`
-   **WebSocket Connection Failed**:
    -   Verify frontend `.env` points to `http://localhost:5000` (not HTTPS or production URL if running locally).

## 📜 License
This project is licensed under the MIT License.
