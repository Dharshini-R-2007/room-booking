import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';

const DashboardPlaceholder = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="placeholder-container">
      <div className="placeholder-card">
        <div className="brand-icon-wrapper" style={{ margin: '0 auto 1rem' }}>
          <LayoutDashboard size={22} strokeWidth={1.75} />
        </div>
        <h1 className="placeholder-title">Authenticated Area</h1>
        <p className="placeholder-text">Dashboard coming in the next module</p>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleSignOut}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
