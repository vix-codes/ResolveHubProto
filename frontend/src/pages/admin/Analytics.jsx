import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';

// Simple horizontal bar chart row
const BarRow = ({ label, count, total, colorClass }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div
          className={`bar-fill ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="bar-count">
        {count} ({percent}%)
      </span>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="loading-text">Loading analytics...</p></div>;
  if (!data) return <div className="page"><p>Could not load analytics.</p></div>;

  const statusColors = {
    Pending: 'bar-amber',
    Assigned: 'bar-blue',
    'In Progress': 'bar-purple',
    Resolved: 'bar-green',
  };

  const priorityColors = {
    Low: 'bar-green',
    Medium: 'bar-amber',
    High: 'bar-red',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>System-wide complaint statistics and trends</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{data.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-number">{data.recentCount}</div>
          <div className="stat-label">Last 7 Days</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">
            {data.byStatus.find((s) => s._id === 'Resolved')?.count || 0}
          </div>
          <div className="stat-label">Total Resolved</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-number">
            {data.byPriority.find((p) => p._id === 'High')?.count || 0}
          </div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>By Status</h3>
          {data.byStatus.map((item) => (
            <BarRow
              key={item._id}
              label={item._id}
              count={item.count}
              total={data.total}
              colorClass={statusColors[item._id] || 'bar-blue'}
            />
          ))}
        </div>

        <div className="analytics-card">
          <h3>By Category</h3>
          {data.byCategory.map((item) => (
            <BarRow
              key={item._id}
              label={item._id}
              count={item.count}
              total={data.total}
              colorClass="bar-indigo"
            />
          ))}
        </div>

        <div className="analytics-card">
          <h3>By Priority</h3>
          {data.byPriority.map((item) => (
            <BarRow
              key={item._id}
              label={item._id}
              count={item.count}
              total={data.total}
              colorClass={priorityColors[item._id] || 'bar-blue'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
