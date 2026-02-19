import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  let username = localStorage.getItem('user');
  try {
    username = JSON.parse(username)?.name || username;
  } catch (err) { }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="chat-container">
      {/* Sidebar - Online Users */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Online Users ({onlineUsers.length})</h3>
        </div>
        <ul className="user-list">
          {onlineUsers.map((userObj, index) => (
            <li
              key={index}
              onClick={() => {
                setSelectedUser(userObj.username);
                setRecipientSocketId(userObj.socketId);
              }}
              className={`user-item ${selectedUser === userObj.username ? 'active' : ''}`}
            >
              <div className="user-status"></div>
              {userObj.username} {userObj.username === username && '(You)'}
            </li>
          ))}
        </ul>
        <div style={{ padding: '1rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', backgroundColor: '#ff6b6b' }}>Logout</button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h2>{selectedUser ? `Chatting with ${selectedUser}` : 'Global Chat Room'}</h2>
          <button onClick={handleClearChat} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>Clear History</button>
        </div>

        <div className="messages-list">
          {messages.map((msg, index) => {
            const isMe = msg.user === username;
            return (
              <div key={index} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '2px' }}>
                  {msg.private && <span style={{ color: '#ffdd57', marginRight: '5px' }}>🔒</span>}
                  {isMe ? 'You' : msg.user}
                </div>
                {msg.message}
                {msg.createdAt && (
                  <span className="message-meta">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })}
          {typingUser && (
            <div style={{ fontStyle: 'italic', color: 'gray', fontSize: '0.9rem', padding: '0 1rem' }}>
              {typingUser} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-area">
          <input
            type="text"
            placeholder={recipientSocketId ? `Message ${selectedUser}...` : "Type a message..."}
            value={message}
            onChange={handleTyping}
            required
            autoFocus
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
