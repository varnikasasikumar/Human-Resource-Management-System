import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserCheck, Palmtree, Clock } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [presentToday, setPresentToday] = useState<number | null>(null);
  const [onLeaveToday, setOnLeaveToday] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const todayStr = new Date().toISOString().split('T')[0];
        
        const [empData, attendanceData, pendingData] = await Promise.all([
          employeeService.getAllEmployees().catch(() => []),
          attendanceService.getAttendanceByDate(todayStr).catch(() => []),
          leaveService.getPendingLeaves().catch(() => [])
        ]);

        setTotalEmployees(empData.length);
        
        const presentCount = attendanceData.filter((a: any) => a.status === 'PRESENT' || a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
        const leaveCount = attendanceData.filter((a: any) => a.status === 'LEAVE').length;
        
        setPresentToday(presentCount);
        setOnLeaveToday(leaveCount);
        setPendingRequests(pendingData.length);
        setRecentLeaves(pendingData.slice(0, 5)); // Just take top 5 pending
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h2>Welcome back, {user?.loginId}</h2>
          <p className="subtitle">Here's what's happening across your organization today.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--df-text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Total Employees</p>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--df-text-main)' }}>
                {loading ? '...' : totalEmployees}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--df-accent-light)', color: 'var(--df-accent)', borderRadius: 'var(--radius-md)' }}>
              <Users size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--df-text-light)', margin: 0 }}>Active across all departments</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--df-text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Present Today</p>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--df-text-main)' }}>
                {loading ? '...' : presentToday}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--df-success-bg)', color: 'var(--df-success-text)', borderRadius: 'var(--radius-md)' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--df-text-light)', margin: 0 }}>Checked in successfully</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--df-text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>On Leave</p>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--df-text-main)' }}>
                {loading ? '...' : onLeaveToday}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--df-warning-bg)', color: 'var(--df-warning-text)', borderRadius: 'var(--radius-md)' }}>
              <Palmtree size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--df-text-light)', margin: 0 }}>Scheduled time off today</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--df-text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Pending Requests</p>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--df-text-main)' }}>
                {loading ? '...' : pendingRequests}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--df-error-bg)', color: 'var(--df-error-text)', borderRadius: 'var(--radius-md)' }}>
              <Clock size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--df-text-light)', margin: 0 }}>Awaiting approval</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Recent Leave Requests Section */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Recent Leave Requests</h3>
          
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--df-text-muted)' }}>Loading records...</div>
          ) : recentLeaves.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Clock style={{ color: 'var(--df-border)', width: '48px', height: '48px', marginBottom: '1rem' }} />
              <p style={{ margin: 0, color: 'var(--df-text-muted)' }}>No recent leave requests found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((leave: any) => (
                    <tr key={leave.id}>
                      <td><span style={{ fontWeight: 500 }}>{leave.employeeId}</span></td>
                      <td>{leave.leaveType}</td>
                      <td>{leave.startDate} to {leave.endDate}</td>
                      <td>
                        <span className="status-pill status-pending">{leave.status}</span>
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

export default Dashboard;
