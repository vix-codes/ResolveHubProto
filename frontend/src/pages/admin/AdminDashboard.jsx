import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/complaints')
      .then((res) => setComplaints(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    assigned: complaints.filter((c) => c.status === 'Assigned').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  // High priority unresolved complaints need attention
  const urgent = complaints.filter(
    (c) => c.priority === 'High' && c.status !== 'Resolved'
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System-wide overview of all complaints</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-assigned">
          <div className="stat-number">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="action-row">
        <Link to="/admin/complaints" className="btn btn-primary">
          Manage Complaints
        </Link>
        <Link to="/admin/analytics" className="btn btn-secondary">
          View Analytics
        </Link>
      </div>

      {urgent.length > 0 && (
        <div className="section">
          <h2>Urgent — High Priority ({urgent.length})</h2>
          {urgent.slice(0, 3).map((c) => (
            <div key={c._id} className="complaint-card complaint-urgent">
              <div className="complaint-top">
                <strong>{c.title}</strong>
                <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                  {c.status}
                </span>
              </div>
              <p className="meta-text">
                Tenant: {c.tenant?.name} | Category: {c.category}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading complaints...</p>
      ) : (
        <div className="section">
          <h2>Recent Complaints</h2>
          {complaints.slice(0, 5).map((c) => (
            <div key={c._id} className="complaint-card">
              <div className="complaint-top">
                <strong>{c.title}</strong>
                <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                  {c.status}
                </span>
              </div>
              <div className="complaint-meta">
                <span className="meta-text">By: {c.tenant?.name}</span>
                <span className="badge badge-cat">{c.category}</span>
                <span className={`badge badge-priority-${c.priority.toLowerCase()}`}>
                  {c.priority}
                </span>
              </div>
              <p className="complaint-date">
                {new Date(c.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
