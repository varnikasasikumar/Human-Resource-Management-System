import React, { useState, useEffect } from 'react';
import { Search, Plus, RotateCw, Pencil, Trash2, Users } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import type { Employee, EmployeeFormData } from '../types/employee';
import { EmployeeModal } from './EmployeeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee list from Employee Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (emp: Employee) => {
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEmployee = async (formData: EmployeeFormData) => {
    if (editingEmployee && editingEmployee.id) {
      await employeeService.updateEmployee(editingEmployee.id, formData);
      setSuccessMessage(`Employee '${formData.firstName} ${formData.lastName}' updated successfully.`);
    } else {
      await employeeService.createEmployee(formData);
      setSuccessMessage(`Employee '${formData.firstName} ${formData.lastName}' created successfully.`);
    }
    fetchEmployees();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee || !deletingEmployee.id) return;
    try {
      setIsDeleting(true);
      await employeeService.deleteEmployee(deletingEmployee.id);
      setSuccessMessage(`Employee '${deletingEmployee.firstName} ${deletingEmployee.lastName}' deleted.`);
      setIsDeleteModalOpen(false);
      setDeletingEmployee(null);
      fetchEmployees();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      emp.employeeId.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h2>Employees</h2>
          <p className="subtitle">Manage your organization's workforce.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchEmployees} disabled={loading} title="Refresh">
            <RotateCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setSuccessMessage(null)}>&times;</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="header-search" style={{ width: '320px', maxWidth: '100%' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--df-text-muted)' }}>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--df-text-muted)' }}>
            <RotateCw className="spinner" size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading employee data...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users /></div>
            <h3>No Employees Found</h3>
            <p>{searchQuery ? `No matches for "${searchQuery}".` : 'There are no employee records in the system yet.'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleOpenAddModal}>
                Create First Employee
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id || emp.employeeId}>
                    <td style={{ fontWeight: 500 }}>{emp.employeeId}</td>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div className="details">
                          <span className="name">{emp.firstName} {emp.lastName}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td><a href={`mailto:${emp.email}`} style={{ color: 'var(--df-accent)' }}>{emp.email}</a></td>
                    <td>{emp.dateOfJoining || '-'}</td>
                    <td>
                      <span className={`status-pill ${emp.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                        {emp.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="Edit" onClick={() => handleOpenEditModal(emp)}>
                          <Pencil size={18} />
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => handleOpenDeleteModal(emp)}>
                          <Trash2 size={18} style={{ color: 'var(--df-error)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        employee={deletingEmployee}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
