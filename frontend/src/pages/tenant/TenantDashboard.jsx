import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/complaints/my')
      .then((res) => setComplaints(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Here's a summary of your maintenance requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
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
        <Link to="/tenant/create" className="btn btn-primary">
          + Submit New Complaint
        </Link>
        <Link to="/tenant/complaints" className="btn btn-secondary">
          View All Complaints
        </Link>
      </div>

      {loading ? (
        <p className="loading-text">Loading complaints...</p>
      ) : (
        <div className="section">
          <h2>Recent Activity</h2>
          {complaints.length === 0 ? (
            <div className="empty-state">
              <p>No complaints submitted yet.</p>
              <Link to="/tenant/create" className="btn btn-primary">
                Submit your first complaint
              </Link>
            </div>
          ) : (
            complaints.slice(0, 4).map((c) => (
              <div key={c._id} className="complaint-card">
                <div className="complaint-top">
                  <strong>{c.title}</strong>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>
                <div className="complaint-meta">
                  <span className="badge badge-cat">{c.category}</span>
                  <span className={`badge badge-priority-${c.priority.toLowerCase()}`}>
                    {c.priority} Priority
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
