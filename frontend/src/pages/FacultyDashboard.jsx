import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CalendarCheck,
  DoorClosed,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';

import facultyService from '../services/facultyService';
import StatusBadge from '../components/StatusBadge';

const FacultyDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoading(true);
      try {
        const [sumRes, bookRes] = await Promise.allSettled([
          facultyService.getDashboardSummary(),
          facultyService.getDashboardBookings({ page: 0, size: 5 })
        ]);

        if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
          setSummary(sumRes.value.data);
        }

        if (bookRes.status === 'fulfilled' && bookRes.value?.data?.content) {
          setRecentBookings(bookRes.value.data.content);
        }
      } catch (err) {
        console.error('Error fetching faculty dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  const facultyFeatures = [
    {
      name: 'Room Bookings',
      path: '/faculty/bookings',
      icon: CalendarCheck,
      desc: 'Check availability, reserve classroom slots & filter all booking records.'
    },
    {
      name: 'Classrooms Directory',
      path: '/faculty/classrooms',
      icon: DoorClosed,
      desc: 'View available rooms & inspect daily period availability timetables.'
    },
    {
      name: 'Managed Students',
      path: '/faculty/students',
      icon: Users,
      desc: 'Add, update, and manage your sponsored student accounts.'
    }
  ];

  return (
    <div className="dashboard-page-container">
      {/* Hero Banner */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <UserCheck size={16} strokeWidth={2} />
            <span>Faculty Workspace</span>
          </div>
          <h1 className="hero-title">Faculty Booking Portal</h1>
          <p className="hero-subtitle">
            Manage classroom reservations, inspect day timetables, and monitor student bookings.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Bookings</span>
            <CalendarCheck size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : (summary?.totalBookings ?? 0)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Confirmed</span>
            <CheckCircle2 size={20} strokeWidth={1.75} style={{ color: '#059669' }} />
          </div>
          <div className="stat-value">{loading ? '...' : (summary?.confirmedBookings ?? 0)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Bookings Today</span>
            <Clock size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : (summary?.bookingsToday ?? 0)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Upcoming</span>
            <Sparkles size={20} strokeWidth={1.75} style={{ color: 'var(--btn-primary)' }} />
          </div>
          <div className="stat-value">{loading ? '...' : (summary?.upcomingBookings ?? 0)}</div>
        </div>
      </div>

      {/* Recent Bookings Overview */}
      {recentBookings.length > 0 && (
        <div className="filter-card" style={{ gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
              Recent Booking Activities
            </h3>
            <Link to="/faculty/bookings" className="secondary-btn" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}>
              View All
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
                {recentBookings.map((b) => {
                  const roomName = b.roomNumber || b.classroomRoomNumber;
                  const bld = b.building || b.classroomBuilding;
                  const slotText = b.periodLabel || b.timeSlotLabel || (b.periodNumber ? `Period ${b.periodNumber}` : (b.timeSlotPeriodNumber ? `P${b.timeSlotPeriodNumber}` : 'N/A'));
                  const statusVal = b.status || b.bookingStatus;
                  return (
                    <tr key={b.bookingId || b.id}>
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

      {/* Quick Action Modules Section */}
      <div className="modules-preview-section">
        <h2 className="section-title">
          <Sparkles size={18} />
          <span>Faculty Workspace Actions</span>
        </h2>

        <div className="modules-grid">
          {facultyFeatures.map((mod, idx) => {
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

export default FacultyDashboard;
