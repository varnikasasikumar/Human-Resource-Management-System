import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeFormData } from '../types/employee';
import { X } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => Promise<void>;
  initialData?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    dateOfJoining: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          employeeId: initialData.employeeId || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          department: initialData.department || '',
          designation: initialData.designation || '',
          salary: initialData.salary || '',
          dateOfJoining: initialData.dateOfJoining || '',
          status: initialData.status || 'ACTIVE',
        });
      } else {
        setFormData({
          employeeId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          designation: '',
          salary: '',
          dateOfJoining: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        });
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (formData.salary === '' || formData.salary < 0) newErrors.salary = 'Valid salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while saving employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? (value === '' ? '' : Number(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {serverError && (
            <div className="alert alert-error">
              <span>{serverError}</span>
            </div>
          )}

          <form id="employee-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="employeeId">Employee ID <span className="required">*</span></label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP001"
                  className={errors.employeeId ? 'input-error' : ''}
                />
                {errors.employeeId && <span className="error-text">{errors.employeeId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'input-error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'input-error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="email">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@company.com"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department">Department <span className="required">*</span></label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? 'input-error' : ''}
                />
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="designation">Designation <span className="required">*</span></label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={errors.designation ? 'input-error' : ''}
                />
                {errors.designation && <span className="error-text">{errors.designation}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary ($) <span className="required">*</span></label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={errors.salary ? 'input-error' : ''}
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfJoining">Date of Joining</label>
                <input
                  type="date"
                  id="dateOfJoining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="employee-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
