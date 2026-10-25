import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DoorClosed, AlertCircle, Eye } from 'lucide-react';
import classroomService from '../services/classroomService';
import facultyService from '../services/facultyService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const ClassroomScheduleView = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Schedule Modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await classroomService.getAllClassrooms();
        if (res.success && res.data) {
          setClassrooms(res.data);
        } else {
          setError(res.message || 'Failed to load classrooms.');
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Could not load classroom list.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const loadSchedule = async (roomId, dateStr) => {
    setScheduleLoading(true);
    setError('');
    try {
      const res = await facultyService.getClassroomSchedule(roomId, dateStr);
      if (res.success && res.data) {
        setScheduleData(res.data);
      } else {
        setError(res.message || 'Could not load classroom timetable.');
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.response?.data?.message || 'Error loading classroom schedule.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const openScheduleModal = (room) => {
    setSelectedRoom(room);
    setIsScheduleOpen(true);
    loadSchedule(room.id, selectedDate);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (selectedRoom) {
      loadSchedule(selectedRoom.id, newDate);
    }
  };

  return (
    <div className="dashboard-page-container">
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Classrooms & Timetables</h1>
          <span className="page-header-subtitle">
            View room capacities and check period availability schedules by date.
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
          Loading classrooms...
        </div>
      ) : (
        <div className="modules-grid">
          {classrooms.map((room) => (
            <div key={room.id} className="module-preview-card">
              <div className="module-card-header">
                <div className="module-icon-box">
                  <DoorClosed size={20} strokeWidth={1.75} />
                </div>
                <StatusBadge status={room.classroomType} />
              </div>
              <div>
                <h3 className="module-card-title">Room {room.roomNumber}</h3>
                <p className="module-card-desc">
                  Building: {room.building} {room.floor ? `(Floor ${room.floor})` : ''}
                </p>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Capacity: <strong>{room.capacity}</strong> | Projector: <strong>{room.hasProjector ? 'Yes' : 'No'}</strong>
                </p>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => openScheduleModal(room)}
                style={{ marginTop: 'auto', justifyContent: 'center' }}
              >
                <Eye size={16} />
                <span>View Day Schedule</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title={selectedRoom ? `Schedule: Room ${selectedRoom.roomNumber} (${selectedRoom.building})` : 'Classroom Schedule'}
        maxWidth="680px"
      >
        <div className="schedule-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} strokeWidth={1.75} style={{ color: 'var(--bg-banner)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Select Schedule Date:</span>
            </div>
            <input
              type="date"
              className="custom-input"
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          {scheduleLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading schedule for {selectedDate}...
            </div>
          ) : scheduleData && scheduleData.periods ? (
            <div className="schedule-grid">
              {scheduleData.periods.map((period, idx) => {
                const isBooked = period.availability === 'BOOKED';
                return (
                  <div
                    key={idx}
                    className={`schedule-slot-card ${isBooked ? 'booked' : 'available'}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84375rem', color: 'var(--bg-banner)' }}>
                        Period {period.periodNumber}: {period.periodLabel}
                      </span>
                      <StatusBadge status={period.availability} />
                    </div>

                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={12} />
                      <span>{period.startTime?.slice(0, 5)} - {period.endTime?.slice(0, 5)}</span>
                    </div>

                    {isBooked && (
                      <div style={{ fontSize: '0.78125rem', marginTop: '0.25rem', background: '#FDF2F7', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #FBCFE8' }}>
                        <div><strong>Class:</strong> {period.bookedForClass || 'Reserved'}</div>
                        <div><strong>Purpose:</strong> {period.purpose || 'N/A'}</div>
                        {period.bookedByUsername && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By: {period.bookedByUsername}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No period information available for this date.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClassroomScheduleView;
