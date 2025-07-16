import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      Swal.fire('Success', 'Login successful!', 'success');
      navigate('/');
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
        <button
          style={{ marginLeft: '20px' }}
          onClick={(e) => {
            e.preventDefault();
            navigate('/register');
          }}
          className="register-btn"
        >
          Register User
        </button>
      </form>
    </div>
  );
};

export default Login;
