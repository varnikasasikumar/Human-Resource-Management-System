import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  Search, 
  Bell, 
  Menu, 
  LogOut,
  Hexagon
} from 'lucide-react';
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
    : <Navigate to="/login" replace />; // Redirect to /login
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/employees': return 'Employees';
      case '/attendance': return 'Attendance';
      case '/leave': return 'Leave Management';
      default: return 'Dayflow HRMS';
    }
  };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Hexagon className="sidebar-logo-icon" />
          <h2 className="sidebar-brand">Dayflow HRMS</h2>
        </div>

        <div className="sidebar-content">
          <div className="nav-section">
            <span className="nav-section-title">Main Menu</span>
            
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard />
              Dashboard
            </NavLink>

            <NavLink 
              to="/employees" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Users />
              Employees
            </NavLink>

            <NavLink 
              to="/attendance" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <CalendarCheck />
              Attendance
            </NavLink>

            <NavLink 
              to="/leave" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <CalendarDays />
              Leave Management
            </NavLink>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-sm">
            <div className="user-avatar-sm">
              {user?.loginId ? user.loginId.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="user-info-sm">
              <span className="user-name-sm">{user?.loginId}</span>
              <span className="user-role-sm">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn-icon" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
          </div>

          <div className="header-right">
            <div className="header-search">
              <Search />
              <input type="text" placeholder="Search across app..." />
            </div>
            <div className="header-actions">
              <button className="action-icon-btn" title="Notifications">
                <Bell size={20} />
              </button>
            </div>
          </div>
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
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Ensure redirection to /login matches instructions */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;