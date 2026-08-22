import React from 'react';

interface DashboardProps {
  onNavigateToEmployees: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToEmployees }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dayflow HRMS Dashboard</h2>
          <p className="subtitle">Welcome to your Human Resource Management System</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card-header">
            <div className="card-icon blue">👥</div>
            <div>
              <h3>Employee Management</h3>
              <p>Directory, profiles, and staff operations</p>
            </div>
          </div>
          <p className="card-desc">
            View, onboard, update, and manage all employee records in the organization.
          </p>
          <button className="btn btn-primary" onClick={onNavigateToEmployees}>
            Go to Employee Directory &rarr;
          </button>
        </div>

        <div className="card dashboard-card disabled">
          <div className="card-header">
            <div className="card-icon green">📅</div>
            <div>
              <h3>Leave Management</h3>
              <p>Leave requests and approvals</p>
            </div>
          </div>
          <p className="card-desc">
            Leave tracking and request approvals (Module separate).
          </p>
          <span className="module-tag">Separate Service</span>
        </div>

        <div className="card dashboard-card disabled">
          <div className="card-header">
            <div className="card-icon purple">⏰</div>
            <div>
              <h3>Attendance & Payroll</h3>
              <p>Time logs and compensation</p>
            </div>
          </div>
          <p className="card-desc">
            Attendance logging and salary processing (Coming Soon).
          </p>
          <span className="module-tag">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};
