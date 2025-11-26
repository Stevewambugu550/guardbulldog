import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ChatWidget from './components/Chat/ChatWidget';

// Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ReportPhishing from './pages/Reports/ReportPhishing';
import MyReports from './pages/Reports/MyReports';
import ReportDetails from './pages/Reports/ReportDetails';
import Profile from './pages/Profile/Profile';
import Education from './pages/Education/Education';
import ModuleDetails from './pages/Education/ModuleDetails';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminReports from './pages/Admin/AdminReports';
import AdminUsers from './pages/Admin/AdminUsers';
import SystemSettings from './pages/Admin/SystemSettings';
import SecurityLogs from './pages/Admin/SecurityLogs';
import GuestReport from './pages/Guest/GuestReport';
import TrackReport from './pages/Guest/TrackReport';
import Messages from './pages/Messages/Messages';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
            
            <ChatWidget />
            <Routes>
              {/* Public Home Route */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Guest Reporting Routes (No Auth Required) */}
              <Route path="/guest-report" element={<GuestReport />} />
              <Route path="/track-report" element={<TrackReport />} />
              
              {/* Public Auth Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected Routes with Layout */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="report-phishing" element={<ReportPhishing />} />
                <Route path="my-reports" element={<MyReports />} />
                <Route path="reports/:id" element={<ReportDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="education" element={<Education />} />
                <Route path="education/modules/:id" element={<ModuleDetails />} />
                <Route path="messages" element={<Messages />} />
                
                {/* Admin Routes */}
                <Route path="admin/dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReports />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } />

                {/* Super Admin Routes */}
                <Route path="admin/settings" element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SystemSettings />
                  </ProtectedRoute>
                } />
                <Route path="admin/security" element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SecurityLogs />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/report-phishing" element={<Navigate to="/app/report-phishing" replace />} />
              <Route path="/my-reports" element={<Navigate to="/app/my-reports" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              <Route path="/education" element={<Navigate to="/app/education" replace />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
