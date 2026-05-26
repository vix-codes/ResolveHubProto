import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';

const STATUSES = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'];

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/complaints/my')
      .then((res) => setComplaints(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Complaints</h1>
        <p>Track all your submitted maintenance requests</p>
      </div>

      <div className="filter-bar">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading your complaints...</p>
      ) : (
        <div className="complaints-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No complaints found for this filter.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c._id} className={`complaint-card pri-${c.priority.toLowerCase()}`}>
                <div className="complaint-top">
                  <strong>{c.title}</strong>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>

                <p className="complaint-desc">{c.description}</p>

                <div className="complaint-meta">
                  <span className="badge badge-cat">{c.category}</span>
                  <span className={`badge badge-priority-${c.priority.toLowerCase()}`}>
                    {c.priority} Priority
                  </span>
                  {c.assignedTechnician && (
                    <span className="meta-text">
                      Technician: <strong>{c.assignedTechnician.name}</strong>
                    </span>
                  )}
                </div>

                {c.resolutionNotes && (
                  <div className="resolution-box">
                    <strong>Resolution Notes:</strong> {c.resolutionNotes}
                  </div>
                )}

                <p className="complaint-date">
                  Submitted:{' '}
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

export default MyComplaints;
