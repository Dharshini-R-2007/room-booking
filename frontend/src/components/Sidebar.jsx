import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorClosed,
  Clock,
  UserCheck,
  Users,
  CalendarCheck,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, isAvailable: true },
          { label: 'Classrooms', path: '/admin/classrooms', icon: DoorClosed, isAvailable: true },
          { label: 'Time Slots', path: '/admin/time-slots', icon: Clock, isAvailable: true },
          { label: 'Faculty', path: '/admin/faculty', icon: UserCheck, isAvailable: true },
          { label: 'Students', path: '/admin/students', icon: Users, isAvailable: true }
        ];
      case 'FACULTY':
        return [
          { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard, isAvailable: true },
          { label: 'Bookings', path: '/faculty/bookings', icon: CalendarCheck, isAvailable: true },
          { label: 'Classrooms', path: '/faculty/classrooms', icon: DoorClosed, isAvailable: true },
          { label: 'Students', path: '/faculty/students', icon: Users, isAvailable: true }
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', path: '/student', icon: LayoutDashboard, isAvailable: true },
          { label: 'Bookings', path: '/student/bookings', icon: CalendarCheck, isAvailable: true },
          { label: 'Classrooms', path: '/student/classrooms', icon: DoorClosed, isAvailable: true },
          { label: 'Profile', path: '/student/profile', icon: User, isAvailable: true }
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isAvailable: true }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            if (item.isAvailable) {
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              );
            } else {
              return (
                <div key={index} className="sidebar-link disabled" title="Available in future module">
                  <Icon size={18} strokeWidth={1.75} />
                  <span>{item.label}</span>
                  <span className="upcoming-badge">Soon</span>
                </div>
              );
            }
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
