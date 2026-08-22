import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/leaveService';
import type { Leave, LeaveType, LeaveRequestFormData } from '../types/leave';

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  // Form State
  const [employeeId, setEmployeeId] = useState<string>(user?.loginId || 'EMP001');
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  // Data States
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch personal/employee leaves
      if (employeeId.trim()) {
        const empLeaves = await leaveService.getEmployeeLeaves(employeeId.trim());
        setMyLeaves(empLeaves);
      }

      // If HR/Admin, fetch pending leaves
      if (isHrOrAdmin) {
        const pending = await leaveService.getPendingLeaves();
        setPendingLeaves(pending);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  }, [employeeId, isHrOrAdmin]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (!reason.trim()) errs.reason = 'Reason for leave is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      const requestPayload: LeaveRequestFormData = {
        employeeId: employeeId.trim(),
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      };

      await leaveService.applyForLeave(requestPayload);
      setSuccessMessage('Leave application submitted successfully (Status: PENDING)');
      setReason('');
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await leaveService.approveLeave(id);
      setSuccessMessage('Leave request APPROVED successfully');
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await leaveService.rejectLeave(id);
      setSuccessMessage('Leave request REJECTED');
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'status-active';
      case 'REJECTED':
        return 'status-inactive';
      case 'PENDING':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Leave Management</h2>
          <p className="subtitle">
            {isHrOrAdmin
              ? 'Review pending requests and manage staff leaves'
              : 'Apply for time off and view leave request status'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLeaves} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* HR / Admin Pending Requests Section */}
      {isHrOrAdmin && (
        <div className="table-card">
          <div className="modal-header" style={{ padding: '1rem 1.5rem', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#92400e' }}>⏳ Pending Leave Requests (HR / Admin Approvals)</h3>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading pending leave requests...</p>
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>No Pending Requests</h3>
              <p>All leave applications have been processed.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <span className="badge badge-id">{leave.employeeId}</span>
                      </td>
                      <td>
                        <span className="leave-type-tag">{leave.leaveType}</span>
                      </td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`status-pill ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => leave.id && handleApprove(leave.id)}
                            disabled={actionLoading}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => leave.id && handleReject(leave.id)}
                            disabled={actionLoading}
                          >
                            ❌ Reject
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
      )}

      {/* Apply Leave Form */}
      <div className="card shadow-sm">
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          📝 Apply for Time Off
        </h3>

        <form onSubmit={handleApplyLeave}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="leaveEmpId">
                Employee ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="leaveEmpId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={formErrors.employeeId ? 'input-error' : ''}
              />
              {formErrors.employeeId && <span className="error-text">{formErrors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="leaveType">
                Leave Type <span className="required">*</span>
              </label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={formErrors.startDate ? 'input-error' : ''}
              />
              {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={formErrors.endDate ? 'input-error' : ''}
              />
              {formErrors.endDate && <span className="error-text">{formErrors.endDate}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="reason">
                Reason <span className="required">*</span>
              </label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason for leave application..."
                className={formErrors.reason ? 'input-error' : ''}
              />
              {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </div>
        </form>
      </div>

      {/* Employee Leave History */}
      <div className="table-card">
        <div className="modal-header" style={{ padding: '1rem 1.5rem' }}>
          <h3>Leave History ({employeeId})</h3>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading leave applications...</p>
          </div>
        ) : myLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏖️</div>
            <h3>No Leave Records</h3>
            <p>No leave requests found for employee ID "{employeeId}".</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied At</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave, idx) => (
                  <tr key={leave.id || idx}>
                    <td>
                      <span className="leave-type-tag">{leave.leaveType}</span>
                    </td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span className={`status-pill ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{leave.appliedAt ? new Date(leave.appliedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
