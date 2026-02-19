import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, form);
      Swal.fire('Success', 'Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      Swal.fire('Error', error.response?.data?.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Register</button>
        <div className="text-center mt-4">
          <span style={{ color: 'var(--text-primary)', marginRight: '10px' }}>Already have an account?</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            style={{ background: 'transparent', color: 'var(--accent-color)', padding: 0, boxShadow: 'none' }}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
