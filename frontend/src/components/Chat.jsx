import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../Socket';
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipientSocketId, setRecipientSocketId] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

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

    socket.on('message_deleted', (deletedId) => {
      setMessages(prev => prev.filter(msg => msg.id !== deletedId));
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

    // Notification Events
    socket.on('user_joined', (startName) => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: `${startName} joined the chat`
      });
    });

    socket.on('user_left', (leftName) => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "info",
        title: `${leftName} left the chat`
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_private_message');
      socket.off('message_deleted');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('online_users');
      socket.off('user_joined');
      socket.off('user_left');
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
    setShowEmojiPicker(false);
    socket.emit('stop_typing', username);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', username);
    setTimeout(() => socket.emit('stop_typing', username), 1000);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        const imageUrl = res.data.imageUrl;
        // Send message with image
        socket.emit('send_message', { user: username, message: 'Sent an image', imageUrl });
      })
      .catch(err => {
        Swal.fire('Error', 'Image upload failed', 'error');
      });
  };

  const handleDeleteMessage = (id) => {
    Swal.fire({
      title: 'Delete Message?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/chat/message/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            // Wait for socket event to update UI
          })
          .catch(err => {
            Swal.fire('Error', 'Failed to delete message', 'error');
          });
      }
    })
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

  const getAvatar = (name) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  }

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
              <div className="user-status" style={{ marginRight: '10px' }}></div>
              <img
                src={getAvatar(userObj.username)}
                alt="avatar"
                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', backgroundColor: 'white' }}
              />
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
              <div key={index} className={`message-bubble ${isMe ? 'sent' : 'received'}`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  {!isMe && <img src={getAvatar(msg.user)} alt="av" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eee' }} />}
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {msg.private && <span style={{ color: '#ffdd57', marginRight: '5px' }}>🔒</span>}
                    {isMe ? 'You' : msg.user}
                  </div>
                  {isMe && !msg.private && (
                    <span
                      onClick={() => handleDeleteMessage(msg.id)}
                      style={{ cursor: 'pointer', fontSize: '0.8rem', opacity: 0.5, marginLeft: '10px' }}
                      title="Delete Message"
                    >
                      🗑️
                    </span>
                  )}
                </div>

                {msg.imageUrl ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL}${msg.imageUrl}`} alt="uploaded" style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '5px' }} />
                ) : (
                  <div>{msg.message}</div>
                )}

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

        <form onSubmit={handleSend} className="input-area" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '80px', left: '20px', zIndex: 100 }}>
            {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
          </div>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{ background: 'transparent', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', marginRight: '5px', boxShadow: 'none', color: '#555' }}
          >
            😃
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            style={{ background: 'transparent', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', marginRight: '10px', boxShadow: 'none', color: '#555' }}
          >
            📎
          </button>
          <input
            type="text"
            placeholder={recipientSocketId ? `Message ${selectedUser}...` : "Type a message..."}
            value={message}
            onChange={handleTyping}
            required={!message} // Not required if sending image, but typically text is needed for text message
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
