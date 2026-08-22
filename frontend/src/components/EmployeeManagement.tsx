import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeFormData } from '../types/employee';
import { employeeService } from '../services/employeeService';
import { EmployeeModal } from './EmployeeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
      <div className="page-header">
        <div>
          <h2>Employee Directory</h2>
          <p className="subtitle">Manage staff records, departments, and employment details</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchEmployees} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            ➕ Add Employee
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert-success">
          <span>✅ {successMessage}</span>
          <button className="alert-close" onClick={() => setSuccessMessage(null)}>&times;</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="alert-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by ID, name, email, department or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="stats-badge">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Main Table Area */}
      <div className="table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading employee data from http://localhost:8081...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No Employees Found</h3>
            <p>
              {searchQuery
                ? `No employees match your search query "${searchQuery}".`
                : 'There are no employee records in the system yet.'}
            </p>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id || emp.employeeId}>
                    <td>
                      <span className="badge badge-id">{emp.employeeId}</span>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="avatar">
                          {emp.firstName.charAt(0)}
                          {emp.lastName.charAt(0)}
                        </div>
                        <span className="user-name">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.dateOfJoining || '-'}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          emp.status === 'ACTIVE' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {emp.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          title="Edit Employee"
                          onClick={() => handleOpenEditModal(emp)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          title="Delete Employee"
                          onClick={() => handleOpenDeleteModal(emp)}
                        >
                          🗑️ Delete
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

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

      {/* Delete Confirmation Modal */}
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
