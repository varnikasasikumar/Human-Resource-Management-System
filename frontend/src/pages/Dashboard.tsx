import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Welcome, {user?.loginId}!</h2>
        <p><strong>Role:</strong> {user?.role}</p>
        <button 
          onClick={logout} 
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1rem', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
