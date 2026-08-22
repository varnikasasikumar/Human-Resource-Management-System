import React from 'react';
import type { Employee } from '../types/employee';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--df-error)' }}>
            <AlertTriangle size={20} />
            Confirm Delete
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Are you sure you want to delete employee <strong>{employee.firstName} {employee.lastName}</strong> ({employee.employeeId})?
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--df-text-muted)' }}>
            This action cannot be undone. All associated records may be permanently removed.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
