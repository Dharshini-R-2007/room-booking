import React, { useState, useEffect } from 'react';
import { CalendarCheck, Eye, PlusCircle, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import facultyService from '../services/facultyService';
import classroomService from '../services/classroomService';
import timeSlotService from '../services/timeSlotService';
import BookingWizard from '../components/BookingWizard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const BookingsPage = () => {
  const { role } = useAuth();
  const isFaculty = role === 'FACULTY';

  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard', 'myBookings', 'allBookings'
  const [myBookings, setMyBookings] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);

  // Faculty All Bookings State
  const [allBookings, setAllBookings] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 });

  // Dropdown Options for Filters
  const [classroomsList, setClassroomsList] = useState([]);
  const [timeSlotsList, setTimeSlotsList] = useState([]);

  // Faculty Filters
  const [allFilters, setAllFilters] = useState({
    bookingDate: '',
    classroomId: '',
    timeSlotId: '',
    bookedForClass: '',
    status: '',
    purpose: ''
  });

  // Selected Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [error, setError] = useState('');

  const loadMyBookings = async () => {
    setLoadingMy(true);
    setError('');
    try {
      const res = await bookingService.getMyBookings();
      if (res.success && res.data) {
        setMyBookings(res.data);
      } else {
        setError(res.message || 'Failed to load your bookings.');
      }
    } catch (err) {
      console.error('Error loading my bookings:', err);
      setError(err.response?.data?.message || 'Error fetching your bookings.');
    } finally {
      setLoadingMy(false);
    }
  };

  const loadAllBookings = async (pageIndex = 0) => {
    if (!isFaculty) return;
    setLoadingAll(true);
    setError('');
    try {
      const params = { page: pageIndex, size: 10 };
      if (allFilters.bookingDate) params.bookingDate = allFilters.bookingDate;
      if (allFilters.classroomId) params.classroomId = allFilters.classroomId;
      if (allFilters.timeSlotId) params.timeSlotId = allFilters.timeSlotId;
      if (allFilters.bookedForClass) params.bookedForClass = allFilters.bookedForClass;
      if (allFilters.status) params.status = allFilters.status;
      if (allFilters.purpose) params.purpose = allFilters.purpose;

      const res = await facultyService.getDashboardBookings(params);
      if (res.success && res.data) {
        setAllBookings(res.data.content || []);
        setPagination({
          page: res.data.number || 0,
          totalPages: res.data.totalPages || 1
        });
      } else {
        setError(res.message || 'Failed to load bookings.');
      }
    } catch (err) {
      console.error('Error loading all bookings:', err);
      setError(err.response?.data?.message || 'Error fetching bookings list.');
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'myBookings') {
      loadMyBookings();
    } else if (activeTab === 'allBookings' && isFaculty) {
      loadAllBookings(0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isFaculty) {
      classroomService.getAllClassrooms().then(res => res.data && setClassroomsList(res.data));
      timeSlotService.getTimeSlots(false).then(res => res.data && setTimeSlotsList(res.data));
    }
  }, [isFaculty]);

  const viewBookingDetails = async (id) => {
    try {
      const res = await bookingService.getBookingById(id);
      if (res.success && res.data) {
        setSelectedBooking(res.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
      setError(err.response?.data?.message || 'Failed to view booking detail.');
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadAllBookings(0);
  };

  const myColumns = [
    {
      header: 'Booking Date',
      accessor: 'bookingDate',
      render: (row) => <strong>{row.bookingDate}</strong>
    },
    {
      header: 'Classroom',
      accessor: 'roomNumber',
      render: (row) => {
        const room = row.roomNumber || row.classroomRoomNumber;
        const bld = row.building || row.classroomBuilding;
        return room ? `Room ${room}${bld ? ` (${bld})` : ''}` : 'N/A';
      }
    },
    {
      header: 'Time Slot',
      accessor: 'periodLabel',
      render: (row) => row.periodLabel || row.timeSlotLabel || (row.periodNumber ? `Period ${row.periodNumber}` : (row.timeSlotPeriodNumber ? `Period ${row.timeSlotPeriodNumber}` : 'N/A'))
    },
    {
      header: 'Booked For',
      accessor: 'bookedForClass',
      render: (row) => row.bookedForClass
    },
    {
      header: 'Purpose',
      accessor: 'purpose',
      render: (row) => row.purpose
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || row.bookingStatus} />
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (row) => (
        <button
          type="button"
          className="icon-btn"
          onClick={() => viewBookingDetails(row.id || row.bookingId)}
          title="View Details"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  const allColumns = [
    {
      header: 'Date',
      accessor: 'bookingDate',
      render: (row) => <strong>{row.bookingDate}</strong>
    },
    {
      header: 'Classroom',
      accessor: 'roomNumber',
      render: (row) => {
        const room = row.roomNumber || row.classroomRoomNumber;
        const bld = row.building || row.classroomBuilding;
        return room ? `Room ${room}${bld ? ` (${bld})` : ''}` : 'N/A';
      }
    },
    {
      header: 'Time Slot',
      accessor: 'periodLabel',
      render: (row) => row.periodLabel || row.timeSlotLabel || (row.periodNumber ? `P${row.periodNumber}` : (row.timeSlotPeriodNumber ? `P${row.timeSlotPeriodNumber}` : 'N/A'))
    },
    {
      header: 'Booked By',
      accessor: 'bookedByUsername',
      render: (row) => row.bookedByUsername || 'User'
    },
    {
      header: 'Class / Group',
      accessor: 'bookedForClass',
      render: (row) => row.bookedForClass
    },
    {
      header: 'Purpose',
      accessor: 'purpose',
      render: (row) => row.purpose
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || row.bookingStatus} />
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (row) => (
        <button
          type="button"
          className="icon-btn"
          onClick={() => viewBookingDetails(row.bookingId || row.id)}
          title="View Details"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Classroom Room Bookings</h1>
          <span className="page-header-subtitle">
            Reserve available classroom slots, view your existing bookings, and inspect schedules.
          </span>
        </div>
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-item ${activeTab === 'wizard' ? 'active' : ''}`}
          onClick={() => setActiveTab('wizard')}
        >
          Book a Room
        </button>
        <button
          type="button"
          className={`tab-item ${activeTab === 'myBookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('myBookings')}
        >
          My Bookings
        </button>
        {isFaculty && (
          <button
            type="button"
            className={`tab-item ${activeTab === 'allBookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('allBookings')}
          >
            All Faculty Bookings
          </button>
        )}
      </div>

      {/* TAB 1: BOOK A ROOM WIZARD */}
      {activeTab === 'wizard' && (
        <BookingWizard
          userRole={role}
          onBookingSuccess={() => {
            // Optional callback
          }}
        />
      )}

      {/* TAB 2: MY BOOKINGS LIST */}
      {activeTab === 'myBookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
              Your Classroom Bookings
            </h3>
            <button
              type="button"
              className="secondary-btn"
              onClick={loadMyBookings}
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>

          <DataTable
            columns={myColumns}
            data={myBookings}
            isLoading={loadingMy}
            emptyMessage="You have no classroom bookings."
          />
        </div>
      )}

      {/* TAB 3: ALL FACULTY BOOKINGS FILTER (FACULTY ONLY) */}
      {activeTab === 'allBookings' && isFaculty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div className="filter-card">
            <form onSubmit={handleFilterSubmit} className="filter-grid">
              <div>
                <label className="form-label">Booking Date</label>
                <input
                  type="date"
                  className="custom-input"
                  value={allFilters.bookingDate}
                  onChange={(e) => setAllFilters({ ...allFilters, bookingDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Classroom</label>
                <select
                  className="custom-input"
                  value={allFilters.classroomId}
                  onChange={(e) => setAllFilters({ ...allFilters, classroomId: e.target.value })}
                >
                  <option value="">All Classrooms</option>
                  {classroomsList.map((c) => (
                    <option key={c.id} value={c.id}>Room {c.roomNumber} ({c.building})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Time Slot</label>
                <select
                  className="custom-input"
                  value={allFilters.timeSlotId}
                  onChange={(e) => setAllFilters({ ...allFilters, timeSlotId: e.target.value })}
                >
                  <option value="">All Slots</option>
                  {timeSlotsList.map((s) => (
                    <option key={s.id} value={s.id}>P{s.periodNumber}: {s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Purpose</label>
                <select
                  className="custom-input"
                  value={allFilters.purpose}
                  onChange={(e) => setAllFilters({ ...allFilters, purpose: e.target.value })}
                >
                  <option value="">All Purposes</option>
                  <option value="CLASS">Class</option>
                  <option value="LAB">Lab</option>
                  <option value="EXAM">Exam</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="MEETING">Meeting</option>
                  <option value="EVENT">Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="custom-input"
                  value={allFilters.status}
                  onChange={(e) => setAllFilters({ ...allFilters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  className="secondary-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
              </div>
            </form>
          </div>

          <DataTable
            columns={allColumns}
            data={allBookings}
            isLoading={loadingAll}
            emptyMessage="No bookings found matching filters."
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="secondary-btn"
                disabled={pagination.page <= 0}
                onClick={() => loadAllBookings(pagination.page - 1)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="secondary-btn"
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() => loadAllBookings(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span>
              <strong>#{selectedBooking.id || selectedBooking.bookingId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Classroom:</span>
              <strong>
                Room {selectedBooking.roomNumber || selectedBooking.classroomRoomNumber || 'N/A'} 
                {selectedBooking.building || selectedBooking.classroomBuilding ? ` (${selectedBooking.building || selectedBooking.classroomBuilding})` : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking Date:</span>
              <strong>{selectedBooking.bookingDate}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Time Slot:</span>
              <strong>
                {selectedBooking.periodLabel || selectedBooking.timeSlotLabel || (selectedBooking.periodNumber ? `Period ${selectedBooking.periodNumber}` : 'N/A')}
                {selectedBooking.startTime || selectedBooking.timeSlotStartTime ? ` (${String(selectedBooking.startTime || selectedBooking.timeSlotStartTime).slice(0, 5)} - ${String(selectedBooking.endTime || selectedBooking.timeSlotEndTime).slice(0, 5)})` : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booked For Class:</span>
              <strong>{selectedBooking.bookedForClass}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Purpose:</span>
              <strong>{selectedBooking.purpose} {selectedBooking.customPurpose ? `(${selectedBooking.customPurpose})` : ''}</strong>
            </div>

            {selectedBooking.bookedByUsername && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Booked By:</span>
                <strong>{selectedBooking.bookedByUsername} {selectedBooking.bookedByRole ? `(${selectedBooking.bookedByRole})` : ''}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking Status:</span>
              <StatusBadge status={selectedBooking.status || selectedBooking.bookingStatus} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsPage;
