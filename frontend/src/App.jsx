import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login               from './pages/Login';
import Register            from './pages/Register';
import TenantDashboard     from './pages/tenant/TenantDashboard';
import CreateComplaint     from './pages/tenant/CreateComplaint';
import MyComplaints        from './pages/tenant/MyComplaints';
import AdminDashboard      from './pages/admin/AdminDashboard';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import Analytics           from './pages/admin/Analytics';
import AssignedComplaints  from './pages/technician/AssignedComplaints';

// Redirects to the right dashboard based on role, or /login if not authenticated
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user)                      return <Navigate to="/login" replace />;
  if (user.role === 'tenant')     return <Navigate to="/tenant/dashboard" replace />;
  if (user.role === 'admin')      return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'technician') return <Navigate to="/technician/complaints" replace />;
  return <Navigate to="/login" replace />;
};

// Blocks access if not logged in, or if the wrong role tries to visit a route
const Guard = ({ children, role }) => {
  const { user } = useAuth();
  if (!user || (role && user.role !== role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-container">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Tenant */}
            <Route path="/tenant/dashboard"  element={<Guard role="tenant"><TenantDashboard /></Guard>} />
            <Route path="/tenant/create"     element={<Guard role="tenant"><CreateComplaint /></Guard>} />
            <Route path="/tenant/complaints" element={<Guard role="tenant"><MyComplaints /></Guard>} />

            {/* Admin */}
            <Route path="/admin/dashboard"   element={<Guard role="admin"><AdminDashboard /></Guard>} />
            <Route path="/admin/complaints"  element={<Guard role="admin"><ComplaintManagement /></Guard>} />
            <Route path="/admin/analytics"   element={<Guard role="admin"><Analytics /></Guard>} />

            {/* Technician */}
            <Route path="/technician/complaints" element={<Guard role="technician"><AssignedComplaints /></Guard>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
