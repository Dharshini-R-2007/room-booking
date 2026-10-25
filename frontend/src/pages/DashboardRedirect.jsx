import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { role } = useAuth();

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (role === 'FACULTY') {
    return <Navigate to="/faculty" replace />;
  }
  if (role === 'STUDENT') {
    return <Navigate to="/student" replace />;
  }

  // Fallback if role is unassigned/unknown
  return <Navigate to="/login" replace />;
};

export default DashboardRedirect;
