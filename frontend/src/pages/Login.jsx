import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      const { role } = res.data.user;
      if (role === 'tenant') navigate('/tenant/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/technician/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* Left panel — branding */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <h1>ResolveHub</h1>
          <p>Apartment Maintenance Made Simple</p>
        </div>
        <ul className="auth-features">
          <li><span>✓</span> Submit complaints in seconds</li>
          <li><span>✓</span> AI auto-detects category & priority</li>
          <li><span>✓</span> Track status in real-time</li>
          <li><span>✓</span> Technician assigned automatically</li>
        </ul>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your account</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
