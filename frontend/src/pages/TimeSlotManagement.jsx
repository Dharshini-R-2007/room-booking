import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import timeSlotService from '../services/timeSlotService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const TimeSlotManagement = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    periodNumber: '1',
    label: 'Period 1',
    startTime: '09:00',
    endTime: '10:00',
    active: true
  });

  const loadTimeSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await timeSlotService.getTimeSlots(includeInactive);
      if (res.success && res.data) {
        // Sort by periodNumber ascending
        const sorted = [...res.data].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
        setTimeSlots(sorted);
      } else {
        setError(res.message || 'Failed to fetch time slots.');
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err.response?.data?.message || 'Error loading time slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeSlots();
  }, [includeInactive]);

  const openCreateModal = () => {
    setEditingItem(null);
    const nextPeriod = timeSlots.length > 0 ? Math.max(...timeSlots.map(s => s.periodNumber || 0)) + 1 : 1;
    setFormData({
      periodNumber: String(nextPeriod),
      label: `Period ${nextPeriod}`,
      startTime: '09:00',
      endTime: '10:00',
      active: true
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      periodNumber: item.periodNumber,
      label: item.label,
      startTime: item.startTime ? item.startTime.slice(0, 5) : '09:00',
      endTime: item.endTime ? item.endTime.slice(0, 5) : '10:00',
      active: item.active
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.periodNumber || !formData.label || !formData.startTime || !formData.endTime) {
      setModalError('All form fields are required.');
      return;
    }

    // Format HH:mm to HH:mm:ss for backend LocalTime
    const formattedStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const formattedEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    try {
      if (editingItem) {
        const payload = {
          label: formData.label.trim(),
          startTime: formattedStart,
          endTime: formattedEnd,
          active: Boolean(formData.active)
        };
        const res = await timeSlotService.updateTimeSlot(editingItem.id, payload);
        if (res.success) {
          setSuccess('Time slot updated successfully!');
          setIsFormOpen(false);
          loadTimeSlots();
        }
      } else {
        const payload = {
          periodNumber: Number(formData.periodNumber),
          label: formData.label.trim(),
          startTime: formattedStart,
          endTime: formattedEnd,
          active: Boolean(formData.active)
        };
        const res = await timeSlotService.createTimeSlot(payload);
        if (res.success) {
          setSuccess('Time slot created successfully!');
          setIsFormOpen(false);
          loadTimeSlots();
        }
      }
    } catch (err) {
      console.error('Save time slot error:', err);
      setModalError(err.response?.data?.message || 'Failed to save time slot.');
    }
  };

  const handleStatusToggle = async (id, currentActive) => {
    try {
      const res = await timeSlotService.updateTimeSlotStatus(id, !currentActive);
      if (res.success) {
        loadTimeSlots();
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await timeSlotService.deleteTimeSlot(deletingId);
      if (res.success) {
        setSuccess('Time slot deleted successfully!');
        setIsDeleteOpen(false);
        setDeletingId(null);
        loadTimeSlots();
      }
    } catch (err) {
      console.error('Delete time slot error:', err);
      setError(err.response?.data?.message || 'Failed to delete time slot.');
    }
  };

  const columns = [
    {
      header: 'Period #',
      accessor: 'periodNumber',
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--bg-banner)' }}>
          P{row.periodNumber}
        </div>
      )
    },
    {
      header: 'Label',
      accessor: 'label',
      render: (row) => <strong>{row.label}</strong>
    },
    {
      header: 'Start Time',
      accessor: 'startTime',
      render: (row) => row.startTime ? row.startTime.slice(0, 5) : '-'
    },
    {
      header: 'End Time',
      accessor: 'endTime',
      render: (row) => row.endTime ? row.endTime.slice(0, 5) : '-'
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => <StatusBadge status={row.active ? 'ACTIVE' : 'INACTIVE'} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => handleStatusToggle(row.id, row.active)}
            title={row.active ? 'Deactivate Slot' : 'Activate Slot'}
          >
            {row.active ? (
              <ToggleRight size={20} style={{ color: '#059669' }} />
            ) : (
              <ToggleLeft size={20} style={{ color: '#9CA3AF' }} />
            )}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => openEditModal(row)}
            title="Edit Time Slot"
          >
            <Edit2 size={15} />
          </button>

          <button
            type="button"
            className="icon-btn danger"
            onClick={() => openDeleteModal(row.id)}
            title="Delete Time Slot"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Time Slot Management</h1>
          <span className="page-header-subtitle">
            Configure period schedules, start/end times, and slot availability for booking.
          </span>
        </div>

        <button
          type="button"
          className="custom-submit-btn"
          onClick={openCreateModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} strokeWidth={2} />
          <span>Add Time Slot</span>
        </button>
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Options Bar */}
      <div className="filter-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--bg-banner)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Configured Periods List</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="includeInactive"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <label htmlFor="includeInactive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
            Show Inactive Periods
          </label>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={timeSlots}
        isLoading={loading}
        emptyMessage="No time slots configured."
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? `Edit Time Slot: P${editingItem.periodNumber}` : 'Add New Time Slot'}
      >
        {modalError && (
          <div className="custom-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} strokeWidth={2} />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!editingItem && (
            <div>
              <label className="form-label">Period Number *</label>
              <input
                type="number"
                min="1"
                className="custom-input"
                value={formData.periodNumber}
                onChange={(e) => setFormData({ ...formData, periodNumber: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="form-label">Period Label *</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. Morning Lecture 1"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="custom-input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="custom-input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="activeStatus"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="activeStatus" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              Period Active & Available for Booking
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="custom-submit-btn"
            >
              {editingItem ? 'Save Changes' : 'Create Time Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Delete"
      >
        <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          Are you sure you want to delete this time slot? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setIsDeleteOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={handleDeleteConfirm}
          >
            Delete Time Slot
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TimeSlotManagement;
