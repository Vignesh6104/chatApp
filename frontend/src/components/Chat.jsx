import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../Socket';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipientSocketId, setRecipientSocketId] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  let username = localStorage.getItem('user');
  try {
    username = JSON.parse(username)?.name || username;
  } catch (err) {}

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !username) {
      Swal.fire('Unauthorized', 'Please login to access chat.', 'warning');
      navigate('/login');
      return;
    }

    // Register user on server
    socket.emit('register_user', username);

    // Load chat history
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error('❌ Failed to load chat history', err);
      });

    // Event listeners
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('receive_private_message', (data) => {
      setMessages((prev) => [...prev, { ...data, private: true }]);
    });

    socket.on('user_typing', (typingName) => {
      if (typingName !== username) setTypingUser(typingName);
    });

    socket.on('user_stopped_typing', (typingName) => {
      if (typingName === typingUser) setTypingUser('');
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_private_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('online_users');
      socket.emit('logout', username);
    };
  }, [navigate, username, typingUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (recipientSocketId) {
      socket.emit('private_message', {
        sender: username,
        recipientSocketId,
        message,
      });
      setMessages((prev) => [...prev, { user: username, message, private: true }]);
    } else {
      socket.emit('send_message', { user: username, message });
    }

    setMessage('');
    socket.emit('stop_typing', username);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', username);
    setTimeout(() => socket.emit('stop_typing', username), 1000);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    socket.emit('logout', username);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleClearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      Swal.fire('Success', 'Chat history cleared!', 'success');
    } catch (err) {
      console.error('❌ Failed to clear chat', err);
      Swal.fire('Error', 'Failed to clear chat', 'error');
    }
  };

  return (
    <div className="auth-container">
      <h1><span>CHAT</span> ROOM</h1>

      <div>
        <strong><h2>ONLINE USERS :</h2></strong>
        <ul>
          {onlineUsers.map((userObj, index) => (
            <li
              key={index}
              onClick={() => {
                setSelectedUser(userObj.username);
                setRecipientSocketId(userObj.socketId);
              }}
              style={{
                cursor: 'pointer',
                color: selectedUser === userObj.username ? 'blue' : 'black',
              }}
            >
              {userObj.username} {userObj.username === username && '(You)'}
            </li>
          ))}
        </ul>
      </div>

      {typingUser && (
        <div style={{ fontStyle: 'italic', color: 'gray' }}>
          {typingUser} is typing...
        </div>
      )}

      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '50px',
          marginTop: '50px',
          border: '1px solid crimson',
          borderRadius: '5px',
          padding: '10px',
          color: 'white',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.private ? '(Private) ' : ''}{msg.user}:</strong> {msg.message}
            {msg.createdAt && (
              <span style={{ fontSize: '0.8em', color: 'gray', marginLeft: '10px' }}>
                ({new Date(msg.createdAt).toLocaleTimeString()})
              </span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          required
        />
        <button type="submit">Send</button>
        <button style={{ marginLeft: '10px', marginBottom: '10px' }} onClick={handleClearChat} type="button">
          Clear Chat
        </button>
        <button style={{ marginLeft: '10px' }} onClick={handleLogout}>
          Logout
        </button>
      </form>
    </div>
  );
};

export default Chat;
