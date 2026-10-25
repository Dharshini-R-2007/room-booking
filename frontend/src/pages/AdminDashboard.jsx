import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  DoorClosed,
  Clock,
  UserCheck,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import classroomService from '../services/classroomService';
import timeSlotService from '../services/timeSlotService';
import facultyService from '../services/facultyService';
import studentService from '../services/studentService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    classroomsCount: 0,
    timeSlotsCount: 0,
    facultyCount: 0,
    studentsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [roomsRes, slotsRes, facRes, studRes] = await Promise.allSettled([
          classroomService.getAllClassrooms(),
          timeSlotService.getTimeSlots(true),
          facultyService.getAllFaculty(),
          studentService.getStudents()
        ]);

        setStats({
          classroomsCount: roomsRes.status === 'fulfilled' && roomsRes.value?.data ? roomsRes.value.data.length : 0,
          timeSlotsCount: slotsRes.status === 'fulfilled' && slotsRes.value?.data ? slotsRes.value.data.length : 0,
          facultyCount: facRes.status === 'fulfilled' && facRes.value?.data ? facRes.value.data.length : 0,
          studentsCount: studRes.status === 'fulfilled' && studRes.value?.data ? studRes.value.data.length : 0
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const adminModules = [
    {
      name: 'Classroom Management',
      path: '/admin/classrooms',
      icon: DoorClosed,
      desc: 'Configure classrooms, building locations & capacities',
      count: stats.classroomsCount,
      countLabel: 'Rooms Registered'
    },
    {
      name: 'Time Slot Management',
      path: '/admin/time-slots',
      icon: Clock,
      desc: 'Manage booking periods & active status schedules',
      count: stats.timeSlotsCount,
      countLabel: 'Periods Configured'
    },
    {
      name: 'Faculty Management',
      path: '/admin/faculty',
      icon: UserCheck,
      desc: 'Manage faculty accounts & designations',
      count: stats.facultyCount,
      countLabel: 'Faculty Accounts'
    },
    {
      name: 'Student Directory',
      path: '/admin/students',
      icon: Users,
      desc: 'View all registered student records & faculty sponsors',
      count: stats.studentsCount,
      countLabel: 'Students Registered'
    }
  ];

  return (
    <div className="dashboard-page-container">
      {/* Hero Banner */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={16} strokeWidth={2} />
            <span>Administrator Workspace</span>
          </div>
          <h1 className="hero-title">Admin Control Dashboard</h1>
          <p className="hero-subtitle">
            Overview of overall classroom inventory, booking slots, faculty accounts, and student records.
          </p>
        </div>
      </div>

      {/* Live System Stat Cards */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Classrooms</span>
            <DoorClosed size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.classroomsCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Configured Slots</span>
            <Clock size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.timeSlotsCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Faculty</span>
            <UserCheck size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.facultyCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Students</span>
            <Users size={20} strokeWidth={1.75} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.studentsCount}</div>
        </div>
      </div>

      {/* Management Submodules Section */}
      <div className="modules-preview-section">
        <h2 className="section-title">
          <Sparkles size={18} />
          <span>Management Submodules</span>
        </h2>

        <div className="modules-grid">
          {adminModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div key={idx} className="module-preview-card">
                <div className="module-card-header">
                  <div className="module-icon-box">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="module-status-badge">
                    {loading ? '...' : `${mod.count} ${mod.countLabel}`}
                  </span>
                </div>
                <h3 className="module-card-title">{mod.name}</h3>
                <p className="module-card-desc">{mod.desc}</p>
                <Link
                  to={mod.path}
                  className="secondary-btn"
                  style={{ marginTop: 'auto', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <span>Open Module</span>
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

export default AdminDashboard;
