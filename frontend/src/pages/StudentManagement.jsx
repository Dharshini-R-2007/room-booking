import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, AlertCircle, Mail, Phone, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const StudentManagement = () => {
  const { role } = useAuth();
  const isFaculty = role === 'FACULTY';
  const isAdmin = role === 'ADMIN';

  const [students, setStudents] = useState([]);
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
    rollNumber: '',
    dob: '01-01-2005',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    year: '1',
    section: 'A'
  });

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentService.getStudents();
      if (res.success && res.data) {
        setStudents(res.data);
      } else {
        setError(res.message || 'Failed to fetch student list.');
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err.response?.data?.message || 'Error loading student data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      rollNumber: '',
      dob: '01-01-2005',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      department: '',
      year: '1',
      section: 'A'
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      rollNumber: item.rollNumber,
      dob: item.dob || '01-01-2005',
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phoneNumber: item.phoneNumber || '',
      department: item.department,
      year: String(item.year || 1),
      section: item.section || ''
    });
    setError('');
    setModalError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.department.trim()) {
      setModalError('First Name, Last Name, Email, and Department are required.');
      return;
    }

    if (!editingItem && (!formData.rollNumber.trim() || !formData.dob.trim())) {
      setModalError('Roll Number and Date of Birth are required for new student.');
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
      if (editingItem) {
        const updatePayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
          department: formData.department.trim(),
          year: Number(formData.year),
          section: formData.section ? formData.section.trim() : null
        };
        const res = await studentService.updateStudent(editingItem.id, updatePayload);
        if (res.success) {
          setSuccess('Student record updated successfully!');
          setIsFormOpen(false);
          loadStudents();
        }
      } else {
        const createPayload = {
          rollNumber: formData.rollNumber.trim(),
          dob: formData.dob.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
          department: formData.department.trim(),
          year: Number(formData.year),
          section: formData.section ? formData.section.trim() : null
        };
        const res = await studentService.createStudent(createPayload);
        if (res.success) {
          setSuccess('Student record created successfully!');
          setIsFormOpen(false);
          loadStudents();
        }
      }
    } catch (err) {
      console.error('Save student error:', err);
      setModalError(err.response?.data?.message || 'Failed to save student record.');
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await studentService.deleteStudent(deletingId);
      if (res.success) {
        setSuccess('Student deleted successfully!');
        setIsDeleteOpen(false);
        setDeletingId(null);
        loadStudents();
      }
    } catch (err) {
      console.error('Delete student error:', err);
      setError(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const columns = [
    {
      header: 'Roll #',
      accessor: 'rollNumber',
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--bg-banner)' }}>
          {row.rollNumber}
        </div>
      )
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => <strong>{row.firstName} {row.lastName}</strong>
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
      header: 'Dept & Year',
      accessor: 'department',
      render: (row) => (
        <div>
          <span>{row.department}</span>
          <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
            (Year {row.year} - Sec {row.section || 'A'})
          </span>
        </div>
      )
    },
    ...(isAdmin ? [{
      header: 'Faculty Sponsor',
      accessor: 'facultySponsorName',
      render: (row) => row.facultySponsorName ? `Prof. ${row.facultySponsorName}` : 'N/A'
    }] : []),
    ...(isFaculty ? [{
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => openEditModal(row)}
            title="Edit Student"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => openDeleteModal(row.id)}
            title="Delete Student"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="dashboard-page-container">
      <div className="page-header-bar">
        <div className="page-header-title-group">
          <h1 className="page-header-title">Student Directory</h1>
          <span className="page-header-subtitle">
            {isFaculty ? 'Manage students sponsored under your faculty account.' : 'View all registered student records in the system.'}
          </span>
        </div>

        {isFaculty && (
          <button
            type="button"
            className="custom-submit-btn"
            onClick={openCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={18} strokeWidth={2} />
            <span>Add Student</span>
          </button>
        )}
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
        data={students}
        isLoading={loading}
        emptyMessage="No student records found."
      />

      {/* Add / Edit Form Modal (Faculty only) */}
      {isFaculty && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingItem ? `Edit Student: ${editingItem.rollNumber}` : 'Add New Student'}
        >
          {modalError && (
            <div className="custom-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} strokeWidth={2} />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editingItem && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. CS2026001"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">DOB (DD-MM-YYYY) *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="01-01-2005"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. John"
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
                  placeholder="e.g. Smith"
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
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
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
                <label className="form-label">Year *</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="custom-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Section</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </div>
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
                {editingItem ? 'Save Changes' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isFaculty && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Confirm Delete"
        >
          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            Are you sure you want to delete this student record? This action cannot be undone.
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
              Delete Student
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentManagement;
