import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <span className="hamburger-icon"></span>
        </button>
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <Building2 size={20} strokeWidth={1.75} />
          </div>
          <span className="navbar-brand-title">Room Booking</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* User Role Badge */}
        <div className="role-badge">
          <Shield size={14} strokeWidth={2} />
          <span>{role || 'USER'}</span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="navbar-logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
