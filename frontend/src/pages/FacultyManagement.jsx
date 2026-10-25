import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, AlertCircle, Mail, Phone, Building2 } from 'lucide-react';
import facultyService from '../services/facultyService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
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
    facultyId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    designation: '',
    status: 'ACTIVE'
  });

  const loadFaculty = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await facultyService.getAllFaculty();
      if (res.success && res.data) {
        setFaculties(res.data);
      } else {
        setError(res.message || 'Failed to fetch faculty list.');
      }
    } catch (err) {
      console.error('Error loading faculty:', err);
      setError(err.response?.data?.message || 'Error loading faculty data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      facultyId: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      department: '',
      designation: '',
      status: 'ACTIVE'
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      facultyId: item.facultyId,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phoneNumber: item.phoneNumber || '',
      department: item.department,
      designation: item.designation || '',
      status: item.status || 'ACTIVE'
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.facultyId.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.department.trim()) {
      setModalError('Faculty ID, First Name, Last Name, Email, and Department are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setModalError('Email must contain "@" and "." in a valid email format.');
      return;
    }

    if (formData.phoneNumber && formData.phoneNumber.trim() && !/^\d{10}$/.test(formData.phoneNumber.trim())) {
      setModalError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const payload = {
        facultyId: formData.facultyId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
        department: formData.department.trim(),
        designation: formData.designation ? formData.designation.trim() : null,
        status: formData.status
      };

      if (editingItem) {
        const res = await facultyService.updateFaculty(editingItem.id, payload);
        if (res.success) {
          setSuccess('Faculty record updated successfully!');
          setIsFormOpen(false);
          loadFaculty();
        }
      } else {
        const res = await facultyService.createFaculty(payload);
        if (res.success) {
          setSuccess('Faculty record created successfully!');
          setIsFormOpen(false);
          loadFaculty();
        }
      }
    } catch (err) {
      console.error('Save faculty error:', err);
      setModalError(err.response?.data?.message || 'Failed to save faculty record.');
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await facultyService.deleteFaculty(deletingId);
      if (res.success) {
        setSuccess('Faculty member deleted successfully!');
        setIsDeleteOpen(false);
        setDeletingId(null);
        loadFaculty();
      }
    } catch (err) {
      console.error('Delete faculty error:', err);
      setError(err.response?.data?.message || 'Failed to delete faculty member.');
    }
  };

  const columns = [
    {
      header: 'Faculty ID',
      accessor: 'facultyId',
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--bg-banner)' }}>
          {row.facultyId}
        </div>
      )
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => <strong>Prof. {row.firstName} {row.lastName}</strong>
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
          <Mail size={14} />
          <span>{row.email}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Building2 size={14} style={{ color: 'var(--text-secondary)' }} />
          <span>{row.department}</span>
        </div>
      )
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => row.designation || 'Faculty'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => openEditModal(row)}
            title="Edit Faculty Member"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => openDeleteModal(row.id)}
            title="Delete Faculty Member"
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
          <h1 className="page-header-title">Faculty Management</h1>
          <span className="page-header-subtitle">
            Create, view, update, and manage faculty member accounts.
          </span>
        </div>

        <button
          type="button"
          className="custom-submit-btn"
          onClick={openCreateModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} strokeWidth={2} />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {error && (
        <div className="custom-error-banner" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={faculties}
        isLoading={loading}
        emptyMessage="No faculty accounts registered."
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? `Edit Faculty: ${editingItem.firstName} ${editingItem.lastName}` : 'Add New Faculty Member'}
      >
        {modalError && (
          <div className="custom-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} strokeWidth={2} />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Faculty ID *</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. FAC-2026-01"
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Robert"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Vance"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="custom-input"
                placeholder="faculty@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength="10"
                className="custom-input"
                placeholder="10-digit mobile number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Department *</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Associate Professor"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
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
            </select>
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
              {editingItem ? 'Save Changes' : 'Create Faculty Member'}
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
          Are you sure you want to delete this faculty member account? This action cannot be undone.
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
            Delete Faculty
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyManagement;
