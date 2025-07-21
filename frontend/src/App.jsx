import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import FeedbackForm from './components/FeedbackForm';
import Intro from './components/Intro';
import Chat from './components/Chat';
import Swal from 'sweetalert2';
import './App.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Inner App component using useLocation
function AppContent() {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const addFeedback = async (feedback) => {
    try {
      await axios.post(`${BASE_URL}/api/feedback`, feedback, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const res = await axios.get(`${BASE_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFeedbacks(res.data);
      Swal.fire('Success', 'Feedback sent successfully!', 'success');
    } catch (err) {
      console.error('Error submitting feedback', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        Swal.fire('Session expired', 'Please log in again.', 'warning');
      } else {
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem('token')) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/feedback`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFeedbacks(res.data);
      } catch (err) {
        console.error('Error fetching feedbacks', err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    Swal.fire('Logged out', '', 'info');
  };

  return (
    <div className="App">
      {/* ✅ Conditionally show heading */}
      {location.pathname !== '/chat' && (
        <h1>
          <span>FEEDBACK</span> APPLICATION
        </h1>
      )}

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/feedback" /> : <Intro />}
        />
        <Route
          path="/feedback"
          element={
            isLoggedIn ? (
              <>
                <FeedbackForm onSubmit={addFeedback} />
                <button
                  onClick={handleLogout}
                  style={{ marginTop: '20px', width: '20%' }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

// ✅ Outer App that wraps with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
