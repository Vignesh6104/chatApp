import React from 'react';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-page">
      <h1>Welcome to the <span>FEEDBACK</span> App</h1>
      <p>Please login or register to continue.</p>
      <div className="intro-buttons">
        <button style={{marginRight:'30px'}} onClick={() => navigate('/login')} className="intro-btn">Login</button>
        <button onClick={() => navigate('/register')} className="intro-btn">Register</button>
      </div>
    </div>
  );
}

export default Intro;
