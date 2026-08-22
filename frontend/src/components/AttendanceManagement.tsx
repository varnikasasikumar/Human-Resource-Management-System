import React, { useState, useEffect, useCallback } from 'react';
import { LogIn, LogOut, RotateCw, CalendarCheck, Calendar } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';
import type { Attendance } from '../types/attendance';

export const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(user?.loginId || '');
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchAttendanceData = useCallback(async () => {
    if (!employeeId.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const todayRecord = await attendanceService.getEmployeeAttendanceByDate(employeeId.trim(), todayStr);
      setTodayAttendance(todayRecord);

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
      setSuccessMessage(`Check-in successful at ${formatTime(record.checkInTime) || new Date().toLocaleTimeString()}`);
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
      setSuccessMessage(`Check-out successful at ${formatTime(record.checkOutTime) || new Date().toLocaleTimeString()}`);
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

  const calculateHours = (inTime?: string, outTime?: string) => {
    if (!inTime || !outTime) return '-';
    try {
      const start = new Date(inTime).getTime();
      const end = new Date(outTime).getTime();
      const diffMs = end - start;
      if (diffMs <= 0) return '-';
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${mins}m`;
    } catch {
      return '-';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h2>Attendance</h2>
          <p className="subtitle">Track your attendance and working hours</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Check-In Control Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
            <CalendarCheck size={20} color="var(--df-accent)" /> Today's Attendance
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--df-border-light)' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--df-text-muted)', fontSize: '0.875rem' }}>Check In</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{formatTime(todayAttendance?.checkInTime)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--df-text-muted)', fontSize: '0.875rem' }}>Check Out</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{formatTime(todayAttendance?.checkOutTime)}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, color: 'var(--df-text-muted)', fontSize: '0.875rem' }}>Working Hours</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--df-accent)', fontSize: '1.25rem' }}>
              {calculateHours(todayAttendance?.checkInTime, todayAttendance?.checkOutTime) !== '-' 
                ? calculateHours(todayAttendance?.checkInTime, todayAttendance?.checkOutTime) 
                : '--'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleCheckIn}
              disabled={actionLoading || !!todayAttendance?.checkInTime}
            >
              <LogIn size={18} /> Check In
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={handleCheckOut}
              disabled={actionLoading || !todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime}
            >
              <LogOut size={18} /> Check Out
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--df-primary)', color: 'white' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: 'white' }}>
            <Calendar size={20} /> Current Status
          </h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>Date</p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>Status</p>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.375rem 1rem', 
              backgroundColor: todayAttendance?.status === 'PRESENT' || todayAttendance?.status === 'CHECKED_IN' || todayAttendance?.status === 'CHECKED_OUT' 
                ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
              color: todayAttendance?.status === 'PRESENT' || todayAttendance?.status === 'CHECKED_IN' || todayAttendance?.status === 'CHECKED_OUT'
                ? '#34d399' : 'white',
              border: todayAttendance?.status === 'PRESENT' || todayAttendance?.status === 'CHECKED_IN' || todayAttendance?.status === 'CHECKED_OUT'
                ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              fontSize: '0.875rem'
            }}>
              {todayAttendance?.status?.replace('_', ' ') || 'NOT CHECKED IN'}
            </span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--df-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Attendance History</h3>
          
          {user?.role === 'ADMIN' || user?.role === 'HR' ? (
             <div className="header-search" style={{ width: '200px' }}>
                <input
                  type="text"
                  placeholder="View EMP ID..."
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onBlur={fetchAttendanceData}
                />
             </div>
          ) : null}
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--df-text-muted)' }}>
            <RotateCw className="spinner" size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><CalendarCheck /></div>
            <h3>No Records Found</h3>
            <p>No check-in or check-out entries recorded for {employeeId}.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={record.id || index}>
                    <td style={{ fontWeight: 500 }}>{record.date}</td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{formatTime(record.checkOutTime)}</td>
                    <td>{calculateHours(record.checkInTime, record.checkOutTime)}</td>
                    <td>
                      <span className={`status-pill ${
                        record.status === 'PRESENT' || record.status === 'CHECKED_OUT' || record.status === 'CHECKED_IN'
                          ? 'status-active'
                          : record.status === 'LEAVE'
                          ? 'status-pending'
                          : 'status-inactive'
                      }`}>
                        {record.status?.replace('_', ' ')}
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
  );
};
