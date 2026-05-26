import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/tenant/TenantDashboard';
import CreateComplaint from './pages/tenant/CreateComplaint';
import MyComplaints from './pages/tenant/MyComplaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import Analytics from './pages/admin/Analytics';
import AssignedComplaints from './pages/technician/AssignedComplaints';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'tenant') return <Navigate to="/tenant/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'technician') return <Navigate to="/technician/complaints" replace />;
  return <Navigate to="/login" replace />;
};

// Wraps all regular (non-auth) pages in the centered layout container
const PageLayout = ({ children }) => (
  <div className="main-container">{children}</div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          {/* Auth pages — no container wrapper, they use their own split layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tenant */}
          <Route path="/tenant/dashboard" element={
            <PageLayout>
              <ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>
            </PageLayout>
          } />
          <Route path="/tenant/create" element={
            <PageLayout>
              <ProtectedRoute role="tenant"><CreateComplaint /></ProtectedRoute>
            </PageLayout>
          } />
          <Route path="/tenant/complaints" element={
            <PageLayout>
              <ProtectedRoute role="tenant"><MyComplaints /></ProtectedRoute>
            </PageLayout>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <PageLayout>
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            </PageLayout>
          } />
          <Route path="/admin/complaints" element={
            <PageLayout>
              <ProtectedRoute role="admin"><ComplaintManagement /></ProtectedRoute>
            </PageLayout>
          } />
          <Route path="/admin/analytics" element={
            <PageLayout>
              <ProtectedRoute role="admin"><Analytics /></ProtectedRoute>
            </PageLayout>
          } />

          {/* Technician */}
          <Route path="/technician/complaints" element={
            <PageLayout>
              <ProtectedRoute role="technician"><AssignedComplaints /></ProtectedRoute>
            </PageLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
