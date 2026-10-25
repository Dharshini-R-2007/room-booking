import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardRedirect from './pages/DashboardRedirect';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

import ClassroomManagement from './pages/ClassroomManagement';
import ClassroomScheduleView from './pages/ClassroomScheduleView';
import TimeSlotManagement from './pages/TimeSlotManagement';
import FacultyManagement from './pages/FacultyManagement';
import StudentManagement from './pages/StudentManagement';
import BookingsPage from './pages/BookingsPage';
import StudentProfile from './pages/StudentProfile';

// Public Route wrapper that redirects logged-in users away from /login
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Authenticated Layout & Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* ADMIN Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/classrooms" element={<ClassroomManagement />} />
            <Route path="/admin/time-slots" element={<TimeSlotManagement />} />
            <Route path="/admin/faculty" element={<FacultyManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
          </Route>

          {/* FACULTY Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/bookings" element={<BookingsPage />} />
            <Route path="/faculty/classrooms" element={<ClassroomScheduleView />} />
            <Route path="/faculty/students" element={<StudentManagement />} />
          </Route>

          {/* STUDENT Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/bookings" element={<BookingsPage />} />
            <Route path="/student/classrooms" element={<ClassroomScheduleView />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Default Catch-all Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
