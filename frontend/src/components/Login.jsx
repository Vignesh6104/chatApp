import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);

      // Store token and user name in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', res.data.user);

      setIsLoggedIn(true);
      Swal.fire('Success', 'Login successful!', 'success');
      navigate('/chat');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Login failed', 'error');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <div className="text-center mt-4">
            <span style={{color: 'var(--text-primary)', marginRight: '10px'}}>Don't have an account?</span>
            <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                navigate('/register');
            }}
            className="register-btn"
            style={{background: 'transparent', color: 'var(--accent-color)', padding: 0, boxShadow: 'none'}}
            >
            Register
            </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
