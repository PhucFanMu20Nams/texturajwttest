import React from 'react';
import Toolbar from './Toolbar';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-root">
      <Toolbar />
      <main className="dashboard-content">
        {/* Main dashboard content goes here */}
      </main>
    </div>
  );
}

export default Dashboard;