import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const CreateComplaint = () => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // holds AI-detected info after submit

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await API.post('/complaints', form);
      setResult(res.data); // show the AI-detected category & priority

      // Redirect to complaints list after 2.5 seconds
      setTimeout(() => navigate('/tenant/complaints'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Submit a Complaint</h1>
        <p>Describe your issue — our AI will automatically categorize and prioritize it</p>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        {result && (
          <div className="alert alert-success">
            <strong>Complaint submitted successfully!</strong>
            <br />
            AI detected: <strong>{result.category}</strong> category,{' '}
            <strong>{result.priority}</strong> priority.
            <br />
            Redirecting to your complaints...
          </div>
        )}

        {!result && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Complaint Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Water leaking from bathroom ceiling"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Please describe the issue in detail — when it started, how severe it is, etc."
                rows={6}
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ai-info-box">
              <span className="ai-icon">AI</span>
              Gemini AI will automatically detect the category (Plumbing, Electrical, etc.)
              and priority (Low, Medium, High) from your description.
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Analyzing & Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateComplaint;
