import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, CheckCircle2, Mail, Phone, GraduationCap, Building2 } from 'lucide-react';
import studentService from '../services/studentService';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await studentService.getMyProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message || 'Failed to load profile.');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || 'Error loading profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New password and confirm new password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await studentService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword
      });

      if (res.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setPasswordError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboard-page-container">
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Student Profile & Settings</h1>
          <span className="page-header-subtitle">
            View your academic details and manage your account password.
          </span>
        </div>
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading profile...
        </div>
      ) : profile ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div className="filter-card" style={{ gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'var(--bg-banner)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={28} strokeWidth={1.75} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
                  {profile.firstName} {profile.lastName}
                </h3>
                <span style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Roll #: {profile.rollNumber}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
                  <strong>{profile.email}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Phone Number</span>
                  <strong>{profile.phoneNumber || 'Not provided'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building2 size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Department</span>
                  <strong>{profile.department}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Year & Section</span>
                  <strong>Year {profile.year} - Section {profile.section || 'A'}</strong>
                </div>
              </div>

              {profile.facultySponsorName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <User size={16} style={{ color: 'var(--bg-banner)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Faculty Sponsor</span>
                    <strong>Prof. {profile.facultySponsorName}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="filter-card" style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
              <Lock size={18} style={{ color: 'var(--bg-banner)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
                Change Account Password
              </h3>
            </div>

            {passwordError && (
              <div className="custom-error-banner" role="alert" style={{ marginBottom: '0.5rem' }}>
                <AlertCircle size={18} strokeWidth={2} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  className="custom-input"
                  placeholder="Enter current password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="custom-input"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="custom-input"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="custom-submit-btn"
                  style={{ width: '100%' }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentProfile;
