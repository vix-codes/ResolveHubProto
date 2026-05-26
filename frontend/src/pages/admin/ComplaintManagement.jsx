import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';

const STATUSES = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'];

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Fetch complaints and technicians list at the same time
    Promise.all([API.get('/complaints'), API.get('/users/technicians')])
      .then(([complaintsRes, techRes]) => {
        setComplaints(complaintsRes.data);
        setTechnicians(techRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async (complaintId, technicianId) => {
    if (!technicianId) return;
    try {
      const res = await API.put(`/complaints/${complaintId}/assign`, { technicianId });
      setComplaints((prev) => prev.map((c) => (c._id === complaintId ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  const handlePriorityChange = async (complaintId, priority) => {
    try {
      const res = await API.put(`/complaints/${complaintId}/priority`, { priority });
      setComplaints((prev) => prev.map((c) => (c._id === complaintId ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority');
    }
  };

  const filtered =
    filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Complaint Management</h1>
        <p>Assign technicians and adjust priorities</p>
      </div>

      <div className="filter-bar">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== 'All' && (
              <span className="filter-count">
                {complaints.filter((c) => c.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="complaints-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No complaints found for this filter.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c._id} className={`complaint-card admin-card pri-${c.priority.toLowerCase()}`}>
                <div className="complaint-top">
                  <strong>{c.title}</strong>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>

                <p className="complaint-desc">{c.description}</p>

                <p className="meta-text">
                  <strong>Tenant:</strong> {c.tenant?.name} ({c.tenant?.email})
                </p>

                <div className="admin-controls">
                  <div className="control-item">
                    <label>Priority</label>
                    <select
                      value={c.priority}
                      onChange={(e) => handlePriorityChange(c._id, e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="control-item">
                    <label>Assign Technician</label>
                    <select
                      value={c.assignedTechnician?._id || ''}
                      onChange={(e) => handleAssign(c._id, e.target.value)}
                    >
                      <option value="">-- Select Technician --</option>
                      {technicians.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

export default ComplaintManagement;
