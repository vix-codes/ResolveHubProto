import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track resolution notes per complaint by their _id
  const [notes, setNotes] = useState({});

  useEffect(() => {
    API.get('/complaints/assigned')
      .then((res) => {
        setComplaints(res.data);
        // Pre-fill notes from existing resolution notes
        const initialNotes = {};
        res.data.forEach((c) => {
          if (c.resolutionNotes) initialNotes[c._id] = c.resolutionNotes;
        });
        setNotes(initialNotes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await API.put(`/complaints/${id}/status`, {
        status,
        resolutionNotes: notes[id] || '',
      });
      setComplaints((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Assigned Complaints</h1>
        <p>Update status and add resolution notes for your tasks</p>
      </div>

      {loading ? (
        <p className="loading-text">Loading your tasks...</p>
      ) : (
        <div className="complaints-list">
          {complaints.length === 0 ? (
            <div className="empty-state">
              <p>No complaints assigned to you yet.</p>
              <p>Check back later or contact the admin.</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className={`complaint-card tech-card pri-${c.priority.toLowerCase()}`}>
                <div className="complaint-top">
                  <strong>{c.title}</strong>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>

                <p className="complaint-desc">{c.description}</p>

                <div className="complaint-meta">
                  <span className="meta-text">
                    Tenant: <strong>{c.tenant?.name}</strong>
                  </span>
                  <span className="badge badge-cat">{c.category}</span>
                  <span className={`badge badge-priority-${c.priority.toLowerCase()}`}>
                    {c.priority} Priority
                  </span>
                </div>

                {c.status !== 'Resolved' && (
                  <div className="tech-controls">
                    <div className="form-group">
                      <label>Resolution Notes</label>
                      <textarea
                        placeholder="Describe what was done to fix the issue..."
                        rows={3}
                        value={notes[c._id] || ''}
                        onChange={(e) =>
                          setNotes({ ...notes, [c._id]: e.target.value })
                        }
                      />
                    </div>

                    <div className="btn-row">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusUpdate(c._id, 'In Progress')}
                        disabled={c.status === 'In Progress'}
                      >
                        Mark In Progress
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                )}

                {c.status === 'Resolved' && c.resolutionNotes && (
                  <div className="resolution-box">
                    <strong>Resolution:</strong> {c.resolutionNotes}
                  </div>
                )}

                <p className="complaint-date">
                  Assigned:{' '}
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

export default AssignedComplaints;
