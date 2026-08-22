import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Clock, CheckCircle, FileText, Check, X } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { useAuth } from '../contexts/AuthContext';
import type { Leave, LeaveType } from '../types/leave';

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  
  // States
  const [employeeId, setEmployeeId] = useState(user?.loginId || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Data
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leavesData = await leaveService.getEmployeeLeaves(employeeId).catch(() => []);
      setMyLeaves(leavesData);

      if (isAdminOrHr) {
        const pendingData = await leaveService.getPendingLeaves().catch(() => []);
        setPendingLeaves(pendingData);
      }
    } catch (err: any) {
      setError('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  }, [employeeId, isAdminOrHr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!employeeId.trim()) errors.employeeId = 'Employee ID is required';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (!reason.trim()) errors.reason = 'Reason is required';

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.endDate = 'End date cannot be before start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await leaveService.applyForLeave({
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason,
      });

      setSuccessMessage('Leave application submitted successfully.');
      setLeaveType('CASUAL');
      setStartDate('');
      setEndDate('');
      setReason('');
      setFormErrors({});
      fetchData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to apply for leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await leaveService.approveLeave(id);
      setSuccessMessage('Leave request approved.');
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      await leaveService.rejectLeave(id);
      setSuccessMessage('Leave request rejected.');
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'status-active';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };

  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h2>Leave Management</h2>
          <p className="subtitle">Manage time-off requests and approvals</p>
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

      {/* Admin View: Pending Approvals */}
      {isAdminOrHr && (
        <div className="table-card" style={{ marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--df-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--df-warning)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Pending Approvals</h3>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--df-text-muted)' }}>Loading requests...</div>
          ) : pendingLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 2rem' }}>
              <div className="empty-icon"><CheckCircle size={48} color="var(--df-success)" /></div>
              <h3>You're all caught up!</h3>
              <p>No pending leave applications require your approval.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Applied On</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td style={{ fontWeight: 500 }}>{leave.employeeId}</td>
                      <td><span className="status-pill status-pending" style={{ background: 'var(--df-accent-light)', color: 'var(--df-accent)' }}>{leave.leaveType}</span></td>
                      <td>{leave.startDate} to {leave.endDate} <br/><span style={{ fontSize: '0.75rem', color: 'var(--df-text-muted)' }}>({calculateDuration(leave.startDate, leave.endDate)} days)</span></td>
                      <td>{leave.reason}</td>
                      <td>{leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ color: 'var(--df-success-text)', borderColor: 'var(--df-success-bg)' }}
                            onClick={() => leave.id && handleApprove(leave.id)}
                            disabled={actionLoading}
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ color: 'var(--df-error-text)', borderColor: 'var(--df-error-bg)' }}
                            onClick={() => leave.id && handleReject(leave.id)}
                            disabled={actionLoading}
                            title="Reject"
                          >
                            <X size={18} />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Apply Leave Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FileText size={20} color="var(--df-accent)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Apply for Time Off</h3>
          </div>

          <form onSubmit={handleApplyLeave}>
            <div className="form-group">
              <label htmlFor="leaveEmpId">Employee ID <span className="required">*</span></label>
              <input
                type="text"
                id="leaveEmpId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={formErrors.employeeId ? 'input-error' : ''}
                disabled={!isAdminOrHr} // Lock to logged-in user unless Admin
              />
              {formErrors.employeeId && <span className="error-text">{formErrors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="leaveType">Leave Type <span className="required">*</span></label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="startDate">Start Date <span className="required">*</span></label>
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
                <label htmlFor="endDate">End Date <span className="required">*</span></label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={formErrors.endDate ? 'input-error' : ''}
                />
                {formErrors.endDate && <span className="error-text">{formErrors.endDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason <span className="required">*</span></label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly state the reason for your leave..."
                className={formErrors.reason ? 'input-error' : ''}
              />
              {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* My Leave History */}
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--df-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={20} color="var(--df-text-muted)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>My Leave History</h3>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--df-text-muted)' }}>Loading history...</div>
          ) : myLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 2rem' }}>
              <div className="empty-icon"><CalendarDays size={48} /></div>
              <h3>No Leave Records</h3>
              <p>You have not submitted any leave requests.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave, idx) => (
                    <tr key={leave.id || idx}>
                      <td>
                        <span style={{ fontWeight: 500 }}>{leave.leaveType}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--df-text-muted)', marginTop: '0.25rem' }}>{leave.reason}</div>
                      </td>
                      <td>
                        {leave.startDate} <br/>
                        <span style={{ fontSize: '0.75rem', color: 'var(--df-text-muted)' }}>to {leave.endDate}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
