import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { EmployeeManagement } from './components/EmployeeManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { LeaveManagement } from './components/LeaveManagement';
import './App.css';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-icon">🏢</div>

          <div>
            <h1 className="brand-title">Dayflow HRMS</h1>
            <span className="brand-subtitle">Human Resource Management</span>
          </div>
        </div>

        <nav className="header-nav">
          <Link
            to="/dashboard"
            className="nav-tab"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/employees"
            className="nav-tab"
          >
            👥 Employees
          </Link>

          <Link
            to="/attendance"
            className="nav-tab"
          >
            ⏱️ Attendance
          </Link>

          <Link
            to="/leave"
            className="nav-tab"
          >
            📅 Leave
          </Link>

          <span className="user-info" style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0.5rem', display: 'inline-flex', alignItems: 'center' }}>
            👤 {user?.loginId} ({user?.role})
          </span>

          <button
            className="nav-tab logout-button"
            onClick={logout}
          >
            🚪 Logout
          </button>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected application */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;