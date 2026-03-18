import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Job Tracker Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button style={styles.button} onClick={handleSubmit}>Login</button>
        <p style={styles.link}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', width: '360px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '12px', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '14px' }
};

export default Login;