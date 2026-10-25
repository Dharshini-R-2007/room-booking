import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, DoorClosed, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import classroomService from '../services/classroomService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const ClassroomManagement = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    classroomType: '',
    minimumCapacity: '',
    hasProjector: '',
    building: '',
    status: ''
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: '',
    floor: '',
    classroomType: 'CLASSROOM',
    capacity: '40',
    hasProjector: false,
    equipmentDetails: '',
    status: 'ACTIVE'
  });

  const loadClassrooms = async () => {
    setLoading(true);
    setError('');
    try {
      // Build active search params
      const params = {};
      if (filters.classroomType) params.classroomType = filters.classroomType;
      if (filters.minimumCapacity) params.minimumCapacity = filters.minimumCapacity;
      if (filters.hasProjector !== '') params.hasProjector = filters.hasProjector === 'true';
      if (filters.building) params.building = filters.building;
      if (filters.status) params.status = filters.status;

      const hasActiveFilters = Object.keys(params).length > 0;
      const res = hasActiveFilters
        ? await classroomService.searchClassrooms(params)
        : await classroomService.getAllClassrooms();

      if (res.success && res.data) {
        setClassrooms(res.data);
      } else {
        setError(res.message || 'Failed to load classrooms.');
      }
    } catch (err) {
      console.error('Error loading classrooms:', err);
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadClassrooms();
  };

  const handleResetFilters = () => {
    setFilters({
      classroomType: '',
      minimumCapacity: '',
      hasProjector: '',
      building: '',
      status: ''
    });
    setTimeout(loadClassrooms, 50);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      roomNumber: '',
      building: '',
      floor: '',
      classroomType: 'CLASSROOM',
      capacity: '40',
      hasProjector: false,
      equipmentDetails: '',
      status: 'ACTIVE'
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      roomNumber: item.roomNumber,
      building: item.building,
      floor: item.floor || '',
      classroomType: item.classroomType,
      capacity: item.capacity,
      hasProjector: item.hasProjector,
      equipmentDetails: item.equipmentDetails || '',
      status: item.status
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.building.trim() || !formData.capacity) {
      setModalError('Building and Capacity are required fields.');
      return;
    }

    if (!editingItem && !formData.roomNumber.trim()) {
      setModalError('Room Number is required for new classroom.');
      return;
    }

    if (formData.floor && formData.floor.trim() && !/^-?\d+$/.test(formData.floor.trim())) {
      setModalError('Floor must be a valid integer (e.g. 1, 2, 3).');
      return;
    }

    try {
      if (editingItem) {
        // Update payload
        const updatePayload = {
          building: formData.building.trim(),
          floor: formData.floor ? formData.floor.trim() : null,
          classroomType: formData.classroomType,
          capacity: Number(formData.capacity),
          hasProjector: Boolean(formData.hasProjector),
          equipmentDetails: formData.equipmentDetails ? formData.equipmentDetails.trim() : null,
          status: formData.status
        };
        const res = await classroomService.updateClassroom(editingItem.id, updatePayload);
        if (res.success) {
          setSuccess('Classroom updated successfully!');
          setIsFormOpen(false);
          loadClassrooms();
        }
      } else {
        // Create payload
        const createPayload = {
          roomNumber: formData.roomNumber.trim(),
          building: formData.building.trim(),
          floor: formData.floor ? formData.floor.trim() : null,
          classroomType: formData.classroomType,
          capacity: Number(formData.capacity),
          hasProjector: Boolean(formData.hasProjector),
          equipmentDetails: formData.equipmentDetails ? formData.equipmentDetails.trim() : null,
          status: formData.status
        };
        const res = await classroomService.createClassroom(createPayload);
        if (res.success) {
          setSuccess('Classroom created successfully!');
          setIsFormOpen(false);
          loadClassrooms();
        }
      }
    } catch (err) {
      console.error('Save classroom error:', err);
      setModalError(err.response?.data?.message || 'Failed to save classroom record.');
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await classroomService.deleteClassroom(deletingId);
      if (res.success) {
        setSuccess('Classroom deleted successfully!');
        setIsDeleteOpen(false);
        setDeletingId(null);
        loadClassrooms();
      }
    } catch (err) {
      console.error('Delete classroom error:', err);
      setError(err.response?.data?.message || 'Failed to delete classroom.');
    }
  };

  const columns = [
    {
      header: 'Room #',
      accessor: 'roomNumber',
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--bg-banner)' }}>
          {row.roomNumber}
        </div>
      )
    },
    {
      header: 'Building',
      accessor: 'building',
      render: (row) => `${row.building} ${row.floor ? `(Fl ${row.floor})` : ''}`
    },
    {
      header: 'Type',
      accessor: 'classroomType',
      render: (row) => <StatusBadge status={row.classroomType} />
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      render: (row) => <span><strong>{row.capacity}</strong> seats</span>
    },
    {
      header: 'Projector',
      accessor: 'hasProjector',
      render: (row) => (
        <span style={{ color: row.hasProjector ? '#059669' : '#6B7280', fontWeight: 600 }}>
          {row.hasProjector ? 'Available' : 'None'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    ...(isAdmin ? [{
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => openEditModal(row)}
            title="Edit Classroom"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => openDeleteModal(row.id)}
            title="Delete Classroom"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="dashboard-page-container">
      {/* Page Header */}
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Classroom Directory</h1>
          <span className="page-header-subtitle">
            {isAdmin ? 'Manage classroom records, capacities, and maintenance statuses.' : 'View active classrooms and facilities available for booking.'}
          </span>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="custom-submit-btn"
            onClick={openCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={18} strokeWidth={2} />
            <span>Add Classroom</span>
          </button>
        )}
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="filter-card">
        <form onSubmit={handleFilterSubmit} className="filter-grid">
          <div>
            <label className="form-label">Building</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. Science Block"
              value={filters.building}
              onChange={(e) => setFilters({ ...filters, building: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Classroom Type</label>
            <select
              className="custom-input"
              value={filters.classroomType}
              onChange={(e) => setFilters({ ...filters, classroomType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LAB">Lab</option>
            </select>
          </div>

          <div>
            <label className="form-label">Min Capacity</label>
            <input
              type="number"
              className="custom-input"
              placeholder="e.g. 30"
              value={filters.minimumCapacity}
              onChange={(e) => setFilters({ ...filters, minimumCapacity: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Projector</label>
            <select
              className="custom-input"
              value={filters.hasProjector}
              onChange={(e) => setFilters({ ...filters, hasProjector: e.target.value })}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="form-label">Status</label>
              <select
                className="custom-input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="secondary-btn"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handleResetFilters}
              title="Reset Filters"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Classrooms Data Table */}
      <DataTable
        columns={columns}
        data={classrooms}
        isLoading={loading}
        emptyMessage="No classrooms found matching criteria."
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? `Edit Classroom: ${editingItem.roomNumber}` : 'Add New Classroom'}
      >
        {modalError && (
          <div className="custom-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} strokeWidth={2} />
            <span>{modalError}</span>
          </div>
        )}

        <form id="classroom-form" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Room Number *</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. CR-101"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              disabled={Boolean(editingItem)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Building *</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Main Block"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Floor</label>
              <input
                type="number"
                min="0"
                className="custom-input"
                placeholder="e.g. 1"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Classroom Type *</label>
              <select
                className="custom-input"
                value={formData.classroomType}
                onChange={(e) => setFormData({ ...formData, classroomType: e.target.value })}
                required
              >
                <option value="CLASSROOM">Classroom</option>
                <option value="LAB">Lab</option>
              </select>
            </div>
            <div>
              <label className="form-label">Capacity *</label>
              <input
                type="number"
                min="1"
                className="custom-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="checkbox"
                id="hasProjector"
                checked={formData.hasProjector}
                onChange={(e) => setFormData({ ...formData, hasProjector: e.target.checked })}
              />
              <label htmlFor="hasProjector" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Has Projector
              </label>
            </div>

            <div>
              <label className="form-label">Status *</label>
              <select
                className="custom-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Equipment Details</label>
            <textarea
              className="custom-input"
              rows="2"
              placeholder="e.g. Smartboard, Audio system, 60 computers"
              value={formData.equipmentDetails}
              onChange={(e) => setFormData({ ...formData, equipmentDetails: e.target.value })}
            />
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
              {editingItem ? 'Save Changes' : 'Create Classroom'}
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
          Are you sure you want to delete this classroom? This action cannot be undone.
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
            Delete Classroom
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ClassroomManagement;
