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

// Redirect "/" to the right dashboard based on the user's role
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'tenant') return <Navigate to="/tenant/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'technician') return <Navigate to="/technician/complaints" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-container">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Tenant routes */}
            <Route
              path="/tenant/dashboard"
              element={
                <ProtectedRoute role="tenant">
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/create"
              element={
                <ProtectedRoute role="tenant">
                  <CreateComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/complaints"
              element={
                <ProtectedRoute role="tenant">
                  <MyComplaints />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute role="admin">
                  <ComplaintManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute role="admin">
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* Technician routes */}
            <Route
              path="/technician/complaints"
              element={
                <ProtectedRoute role="technician">
                  <AssignedComplaints />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
