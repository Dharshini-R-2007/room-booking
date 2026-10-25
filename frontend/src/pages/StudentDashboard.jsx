import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  DoorClosed,
  User,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';

import bookingService from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';

const StudentDashboard = () => {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getMyBookings();
        if (res.success && res.data) {
          setMyBookings(res.data);
        }
      } catch (err) {
        console.error('Error fetching student bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const studentFeatures = [
    {
      name: 'Book a Room',
      path: '/student/bookings',
      icon: CalendarCheck,
      desc: 'Check room availability, reserve slots for study sessions & view your bookings.'
    },
    {
      name: 'Classrooms View',
      path: '/student/classrooms',
      icon: DoorClosed,
      desc: 'Explore classroom facilities, capacities, and daily schedules.'
    },
    {
      name: 'Student Profile',
      path: '/student/profile',
      icon: User,
      desc: 'View personal student record details and update your password.'
    }
  ];

  return (
    <div className="dashboard-page-container">
      {/* Hero Banner */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <GraduationCap size={16} strokeWidth={2} />
            <span>Student Workspace</span>
          </div>
          <h1 className="hero-title">Student Room Booking Portal</h1>
          <p className="hero-subtitle">
            Reserve available classrooms for group studies, seminars, or student events.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Your Bookings</span>
            <CalendarCheck size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : myBookings.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Upcoming Slots</span>
            <Clock size={20} strokeWidth={1.75} style={{ color: 'var(--btn-primary)' }} />
          </div>
          <div className="stat-value">
            {loading ? '...' : myBookings.filter(b => b.status === 'CONFIRMED').length}
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      {myBookings.length > 0 && (
        <div className="filter-card" style={{ gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
              My Active Reservations
            </h3>
            <Link to="/student/bookings" className="secondary-btn" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}>
              Book Room
            </Link>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Room</th>
                  <th>Time Slot</th>
                  <th>Booked For</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.slice(0, 5).map((b) => {
                  const roomName = b.roomNumber || b.classroomRoomNumber;
                  const bld = b.building || b.classroomBuilding;
                  const slotText = b.periodLabel || b.timeSlotLabel || (b.periodNumber ? `Period ${b.periodNumber}` : (b.timeSlotPeriodNumber ? `Period ${b.timeSlotPeriodNumber}` : 'N/A'));
                  const statusVal = b.status || b.bookingStatus;
                  return (
                    <tr key={b.id || b.bookingId}>
                      <td>{b.bookingDate}</td>
                      <td><strong>Room {roomName || 'N/A'}{bld ? ` (${bld})` : ''}</strong></td>
                      <td>{slotText}</td>
                      <td>{b.bookedForClass}</td>
                      <td>{b.purpose}</td>
                      <td><StatusBadge status={statusVal} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="modules-preview-section">
        <h2 className="section-title">
          <Sparkles size={18} />
          <span>Student Workspace Actions</span>
        </h2>

        <div className="modules-grid">
          {studentFeatures.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div key={idx} className="module-preview-card">
                <div className="module-card-header">
                  <div className="module-icon-box">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="module-status-badge">Available</span>
                </div>
                <h3 className="module-card-title">{mod.name}</h3>
                <p className="module-card-desc">{mod.desc}</p>
                <Link
                  to={mod.path}
                  className="secondary-btn"
                  style={{ marginTop: 'auto', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <span>Open Feature</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
