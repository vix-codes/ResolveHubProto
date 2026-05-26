import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'tenant' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);

      const { role } = res.data.user;
      if (role === 'tenant')     navigate('/tenant/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else                       navigate('/technician/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create an account</h2>
        <p className="sub">Join ResolveHub</p>

        {error && <div className="alert alert-error">{error}</div>}

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
              placeholder="Create a password"
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
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
