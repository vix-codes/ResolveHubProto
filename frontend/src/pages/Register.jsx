import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' });
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
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      const { role } = res.data.user;
      if (role === 'tenant') navigate('/tenant/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/technician/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    tenant: 'Submit and track your maintenance complaints',
    admin: 'Manage complaints and assign technicians',
    technician: 'View and resolve assigned complaints',
  };

  return (
    <div className="auth-wrapper">

      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <h1>ResolveHub</h1>
          <p>Get started today — it's free</p>
        </div>
        <ul className="auth-features">
          <li><span>✓</span> Three roles: Tenant, Admin, Technician</li>
          <li><span>✓</span> Gemini AI auto-categorizes every complaint</li>
          <li><span>✓</span> Full complaint lifecycle tracking</li>
          <li><span>✓</span> Analytics dashboard for admins</li>
        </ul>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create an account</h2>
          <p className="sub">Join ResolveHub in seconds</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
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
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>I am a</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="tenant">Tenant</option>
                <option value="admin">Admin</option>
                <option value="technician">Technician</option>
              </select>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>
                {roleDescriptions[form.role]}
              </p>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
