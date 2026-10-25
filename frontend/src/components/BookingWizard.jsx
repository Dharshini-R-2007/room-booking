import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DoorClosed, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import timeSlotService from '../services/timeSlotService';
import bookingService from '../services/bookingService';
import facultyService from '../services/facultyService';
import classroomService from '../services/classroomService';
import StatusBadge from './StatusBadge';

const BookingWizard = ({ userRole, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [timeSlots, setTimeSlots] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1 Form state (Check Availability)
  const [availabilityForm, setAvailabilityForm] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlotId: '',
    expectedStrength: '30',
    projectorRequired: false,
    classroomType: '',
    building: ''
  });

  // Step 2 Available Classrooms
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Step 3 Booking Details Form
  const [bookingForm, setBookingForm] = useState({
    bookedForClass: '',
    purpose: 'CLASS',
    customPurpose: '',
    facultySponsorId: '',
    equipmentNeeded: ''
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const timeSlotRes = await timeSlotService.getTimeSlots(false);
        if (timeSlotRes.success && timeSlotRes.data) {
          setTimeSlots(timeSlotRes.data);
          if (timeSlotRes.data.length > 0) {
            setAvailabilityForm(prev => ({ ...prev, timeSlotId: timeSlotRes.data[0].id }));
          }
        }

        const roomRes = await classroomService.getAllClassrooms();
        if (roomRes.success && roomRes.data) {
          const uniqueBlocks = Array.from(new Set(roomRes.data.map(r => r.building))).filter(Boolean);
          setBlocksList(uniqueBlocks);
        }

        if (userRole === 'STUDENT') {
          const facRes = await facultyService.getAllFaculty();
          if (facRes.success && facRes.data) {
            setFaculties(facRes.data);
            if (facRes.data.length > 0) {
              setBookingForm(prev => ({ ...prev, facultySponsorId: facRes.data[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize booking options:', err);
      }
    };
    fetchInitialData();
  }, [userRole]);

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!availabilityForm.bookingDate || !availabilityForm.timeSlotId || !availabilityForm.expectedStrength) {
      setError('Please fill in all required search fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        bookingDate: availabilityForm.bookingDate,
        timeSlotId: Number(availabilityForm.timeSlotId),
        expectedStrength: Number(availabilityForm.expectedStrength),
        projectorRequired: Boolean(availabilityForm.projectorRequired),
        classroomType: availabilityForm.classroomType || null,
        building: availabilityForm.building ? availabilityForm.building.trim() : null
      };

      const res = await bookingService.checkAvailableClassrooms(payload);
      if (res.success && res.data) {
        setAvailableRooms(res.data);
        if (res.data.length === 0) {
          setError('No available classrooms match your requirements for this slot.');
        } else {
          setStep(2);
        }
      } else {
        setError(res.message || 'Could not fetch available classrooms.');
      }
    } catch (err) {
      console.error('Check availability error:', err);
      setError(err.response?.data?.message || 'Failed to check classroom availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setStep(3);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bookingForm.bookedForClass.trim()) {
      setError('Booked for class/group label is required.');
      return;
    }

    if (bookingForm.purpose === 'OTHER' && !bookingForm.customPurpose.trim()) {
      setError('Custom purpose description is required when purpose is OTHER.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        classroomId: selectedRoom.id,
        timeSlotId: Number(availabilityForm.timeSlotId),
        bookingDate: availabilityForm.bookingDate,
        bookedForClass: bookingForm.bookedForClass.trim(),
        purpose: bookingForm.purpose,
        customPurpose: bookingForm.purpose === 'OTHER' ? bookingForm.customPurpose.trim() : null,
        facultySponsorId: userRole === 'STUDENT' && bookingForm.facultySponsorId ? Number(bookingForm.facultySponsorId) : null,
        expectedStrength: Number(availabilityForm.expectedStrength),
        projectorRequired: Boolean(availabilityForm.projectorRequired),
        equipmentNeeded: bookingForm.equipmentNeeded ? bookingForm.equipmentNeeded.trim() : null
      };

      const res = await bookingService.createBooking(payload);
      if (res.success && res.data) {
        setConfirmedBooking(res.data);
        setSuccessMessage('Booking confirmed successfully!');
        setStep(4);
        if (onBookingSuccess) onBookingSuccess();
      } else {
        setError(res.message || 'Failed to create booking.');
      }
    } catch (err) {
      console.error('Create booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setAvailableRooms([]);
    setSelectedRoom(null);
    setConfirmedBooking(null);
    setError('');
    setSuccessMessage('');
    setBookingForm({
      bookedForClass: '',
      purpose: 'CLASS',
      customPurpose: '',
      facultySponsorId: faculties.length > 0 ? faculties[0].id : '',
      equipmentNeeded: ''
    });
  };

  const selectedSlotObj = timeSlots.find(s => String(s.id) === String(availabilityForm.timeSlotId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Wizard Progress Bar */}
      <div className="wizard-steps-bar">
        <div className={`wizard-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <span className="wizard-step-num">1</span>
          <span>Check Availability</span>
        </div>
        <div className={`wizard-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <span className="wizard-step-num">2</span>
          <span>Select Room</span>
        </div>
        <div className={`wizard-step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
          <span className="wizard-step-num">3</span>
          <span>Enter Details</span>
        </div>
        <div className={`wizard-step-item ${step === 4 ? 'active' : ''}`}>
          <span className="wizard-step-num">4</span>
          <span>Confirmation</span>
        </div>
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CHECK AVAILABILITY FORM */}
      {step === 1 && (
        <div className="filter-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)', marginBottom: '1rem' }}>
            Step 1: Check Room Availability
          </h3>
          <form onSubmit={handleAvailabilitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Booking Date *</label>
                <input
                  type="date"
                  className="custom-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={availabilityForm.bookingDate}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, bookingDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Time Slot *</label>
                <select
                  className="custom-input"
                  value={availabilityForm.timeSlotId}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, timeSlotId: e.target.value })}
                  required
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      P{slot.periodNumber}: {slot.label} ({slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Expected Capacity *</label>
                <input
                  type="number"
                  min="1"
                  className="custom-input"
                  value={availabilityForm.expectedStrength}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, expectedStrength: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Classroom Type</label>
                <select
                  className="custom-input"
                  value={availabilityForm.classroomType}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, classroomType: e.target.value })}
                >
                  <option value="">Any Type</option>
                  <option value="CLASSROOM">Classroom</option>
                  <option value="LAB">Lab</option>
                </select>
              </div>

              <div>
                <label className="form-label">Block / Building</label>
                <select
                  className="custom-input"
                  value={availabilityForm.building}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, building: e.target.value })}
                >
                  <option value="">All Blocks</option>
                  {blocksList.map((blk) => (
                    <option key={blk} value={blk}>{blk}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="wizard-projector"
                checked={availabilityForm.projectorRequired}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, projectorRequired: e.target.checked })}
              />
              <label htmlFor="wizard-projector" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Projector Required
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="custom-submit-btn"
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? 'Searching Rooms...' : (
                  <>
                    <span>Search Available Rooms</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: SELECT AVAILABLE ROOM */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
              Step 2: Select Available Classroom
            </h3>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={16} />
              <span>Modify Search</span>
            </button>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            Found <strong>{availableRooms.length}</strong> room(s) available on <strong>{availabilityForm.bookingDate}</strong> for slot <strong>{selectedSlotObj?.label}</strong>.
          </div>

          <div className="modules-grid">
            {availableRooms.map((room) => (
              <div key={room.id} className="module-preview-card" style={{ gap: '1rem' }}>
                <div className="module-card-header">
                  <div className="module-icon-box">
                    <DoorClosed size={20} strokeWidth={1.75} />
                  </div>
                  <StatusBadge status={room.classroomType} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
                    Room {room.roomNumber}
                  </h4>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)' }}>
                    Building: {room.building} {room.floor ? `(Floor ${room.floor})` : ''}
                  </p>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Capacity: <strong>{room.capacity}</strong> seats | Projector: <strong>{room.hasProjector ? 'Yes' : 'No'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className="custom-submit-btn"
                  onClick={() => handleSelectRoom(room)}
                  style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
                >
                  Select Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: BOOKING DETAILS FORM */}
      {step === 3 && selectedRoom && (
        <div className="filter-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
              Step 3: Enter Booking Details
            </h3>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setStep(2)}
            >
              <ArrowLeft size={16} />
              <span>Back to Room Selection</span>
            </button>
          </div>

          {/* Selected Summary Header */}
          <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.84375rem' }}>
            <div><strong>Room:</strong> {selectedRoom.roomNumber} ({selectedRoom.building})</div>
            <div><strong>Date:</strong> {availabilityForm.bookingDate}</div>
            <div><strong>Time Slot:</strong> {selectedSlotObj?.label}</div>
            <div><strong>Capacity:</strong> {selectedRoom.capacity} seats</div>
          </div>

          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Booked For Class / Group *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. CS 3rd Year - Sec A"
                  value={bookingForm.bookedForClass}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookedForClass: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Booking Purpose *</label>
                <select
                  className="custom-input"
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                  required
                >
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

              {bookingForm.purpose === 'OTHER' && (
                <div>
                  <label className="form-label">Custom Purpose Description *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Describe custom purpose"
                    value={bookingForm.customPurpose}
                    onChange={(e) => setBookingForm({ ...bookingForm, customPurpose: e.target.value })}
                    required
                  />
                </div>
              )}

              {userRole === 'STUDENT' && (
                <div>
                  <label className="form-label">Faculty Sponsor</label>
                  <select
                    className="custom-input"
                    value={bookingForm.facultySponsorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, facultySponsorId: e.target.value })}
                  >
                    <option value="">Select Faculty Sponsor</option>
                    {faculties.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        Prof. {fac.firstName} {fac.lastName} ({fac.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Additional Equipment Needed (Optional)</label>
              <textarea
                className="custom-input"
                rows="2"
                placeholder="e.g. Extra microphones, podium setup"
                value={bookingForm.equipmentNeeded}
                onChange={(e) => setBookingForm({ ...bookingForm, equipmentNeeded: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="custom-submit-btn"
                disabled={loading}
              >
                {loading ? 'Confirming Booking...' : 'Confirm & Create Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: CONFIRMATION */}
      {step === 4 && confirmedBooking && (
        <div className="filter-card" style={{ alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--bg-banner)' }}>
            Booking Confirmed!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '440px' }}>
            Your room booking has been successfully recorded in the system.
          </p>

          <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', width: '100%', maxWidth: '480px', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span>
              <strong>#{confirmedBooking.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Classroom:</span>
              <strong>Room {confirmedBooking.classroomRoomNumber || selectedRoom?.roomNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
              <strong>{confirmedBooking.bookingDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Time Slot:</span>
              <strong>{confirmedBooking.timeSlotLabel || selectedSlotObj?.label}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booked For:</span>
              <strong>{confirmedBooking.bookedForClass}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <StatusBadge status={confirmedBooking.status} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="custom-submit-btn"
              onClick={resetWizard}
            >
              Book Another Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWizard;
