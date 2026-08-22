<<<<<<< HEAD
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { EmployeeManagement } from './components/EmployeeManagement';
import './App.css';

type ActiveTab = 'dashboard' | 'employees';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-icon">🏢</div>
          <div>
            <h1 className="brand-title">Dayflow HRMS</h1>
            <span className="brand-subtitle">Employee Portal</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            👥 Employees
          </button>
        </nav>
      </header>

      {/* Main View Container */}
      <main className="app-main">
        {activeTab === 'dashboard' ? (
          <Dashboard onNavigateToEmployees={() => setActiveTab('employees')} />
        ) : (
          <EmployeeManagement />
        )}
      </main>
    </div>
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
>>>>>>> origin/main
  );
}

export default App;
