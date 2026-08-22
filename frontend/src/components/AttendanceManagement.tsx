import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceService } from '../services/attendanceService';
import type { Attendance } from '../types/attendance';

export const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<string>(user?.loginId || 'EMP001');
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchAttendanceData = useCallback(async () => {
    if (!employeeId.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch today's record
      const todayRecord = await attendanceService.getEmployeeAttendanceByDate(employeeId.trim(), todayStr);
      setTodayAttendance(todayRecord);

      // Fetch entire history
      const historyRecords = await attendanceService.getEmployeeAttendanceHistory(employeeId.trim());
      setHistory(historyRecords);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [employeeId, todayStr]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handleCheckIn = async () => {
    if (!employeeId.trim()) {
      setError('Please enter a valid Employee ID.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const record = await attendanceService.checkIn(employeeId.trim());
      setSuccessMessage(`Check-in successful at ${record.checkInTime || new Date().toLocaleTimeString()}`);
      fetchAttendanceData();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId.trim()) {
      setError('Please enter a valid Employee ID.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const record = await attendanceService.checkOut(employeeId.trim());
      setSuccessMessage(`Check-out successful at ${record.checkOutTime || new Date().toLocaleTimeString()}`);
      fetchAttendanceData();
    } catch (err: any) {
      setError(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    try {
      if (timeStr.includes('T')) {
        return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Attendance Management</h2>
          <p className="subtitle">Check in, check out, and view daily attendance history</p>
        </div>
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

      {/* Employee ID Action Bar */}
      <div className="card shadow-sm">
        <div className="form-grid" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="attendanceEmpId">
              Employee ID <span className="required">*</span>
            </label>
            <input
              type="text"
              id="attendanceEmpId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP001"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '2px' }}>
            <button
              className="btn btn-primary"
              onClick={handleCheckIn}
              disabled={actionLoading || !!todayAttendance?.checkInTime}
            >
              ⏱️ Check In
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCheckOut}
              disabled={actionLoading || !todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime}
            >
              🏁 Check Out
            </button>
            <button className="btn btn-secondary" onClick={fetchAttendanceData} disabled={loading}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Today's Status Summary Card */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-icon blue">📅</div>
            <div>
              <h3>Today's Date</h3>
              <p className="bold-text">{todayStr}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon green">📊</div>
            <div>
              <h3>Today's Status</h3>
              <p>
                <span
                  className={`status-pill ${
                    todayAttendance?.status === 'PRESENT' || todayAttendance?.status === 'CHECKED_OUT' || todayAttendance?.status === 'CHECKED_IN'
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {todayAttendance?.status || 'NOT_CHECKED_IN'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon purple">⏰</div>
            <div>
              <h3>Check-In / Out Times</h3>
              <p className="bold-text" style={{ fontSize: '0.9rem' }}>
                In: {formatTime(todayAttendance?.checkInTime)} | Out: {formatTime(todayAttendance?.checkOutTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="table-card">
        <div className="modal-header" style={{ padding: '1rem 1.5rem' }}>
          <h3>Attendance History ({employeeId})</h3>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading attendance history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No Attendance Records Found</h3>
            <p>No check-in or check-out entries recorded for employee ID "{employeeId}".</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={record.id || index}>
                    <td>
                      <span className="badge badge-id">{record.date}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          record.status === 'PRESENT' || record.status === 'CHECKED_OUT' || record.status === 'CHECKED_IN'
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{formatTime(record.checkOutTime)}</td>
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
