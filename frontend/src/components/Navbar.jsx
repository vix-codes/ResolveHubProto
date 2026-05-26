import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
  tenant: [
    { to: '/tenant/dashboard', label: 'Dashboard' },
    { to: '/tenant/create', label: 'New Complaint' },
    { to: '/tenant/complaints', label: 'My Complaints' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/analytics', label: 'Analytics' },
  ],
  technician: [
    { to: '/technician/complaints', label: 'My Tasks' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ResolveHub</Link>
      </div>

      {user && (
        <>
          <div className="navbar-links">
            {(navLinks[user.role] || []).map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="navbar-user">
            <span className="user-info">
              {user.name}
              <span className="role-badge">{user.role}</span>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
