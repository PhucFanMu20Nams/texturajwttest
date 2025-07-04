/**
 * Cache Statistics Component for Admin Dashboard
 * Shows cache performance and allows manual cache management
 */

import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService.js';
import './CacheStats.css';

function CacheStats() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    expiredEntries: 0,
    activeEntries: 0,
    totalSizeKB: 0
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshStats = () => {
    const cacheStats = apiService.getCacheStats();
    setStats(cacheStats);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    refreshStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cache? This will affect website performance until cache is rebuilt.')) {
      apiService.clearAllCaches();
      refreshStats();
    }
  };

  const getCacheHealthColor = () => {
    const expiredPercentage = stats.totalEntries > 0 ? (stats.expiredEntries / stats.totalEntries) * 100 : 0;
    if (expiredPercentage > 50) return '#ff4444'; // Red
    if (expiredPercentage > 25) return '#ff8800'; // Orange
    return '#44aa44'; // Green
  };

  return (
    <div className="cache-stats">
      <h3 className="cache-stats-title">Cache Performance</h3>
      
      <div className="cache-stats-grid">
        <div className="cache-stat-card">
          <div className="cache-stat-value">{stats.activeEntries}</div>
          <div className="cache-stat-label">Active Entries</div>
        </div>
        
        <div className="cache-stat-card">
          <div className="cache-stat-value">{stats.expiredEntries}</div>
          <div className="cache-stat-label">Expired Entries</div>
        </div>
        
        <div className="cache-stat-card">
          <div className="cache-stat-value">{stats.totalSizeKB} KB</div>
          <div className="cache-stat-label">Cache Size</div>
        </div>
        
        <div className="cache-stat-card">
          <div 
            className="cache-stat-value"
            style={{ color: getCacheHealthColor() }}
          >
            {stats.totalEntries > 0 ? Math.round((stats.activeEntries / stats.totalEntries) * 100) : 100}%
          </div>
          <div className="cache-stat-label">Cache Health</div>
        </div>
      </div>

      <div className="cache-actions">
        <button 
          className="cache-action-btn refresh"
          onClick={refreshStats}
        >
          Refresh Stats
        </button>
        
        <button 
          className="cache-action-btn clear"
          onClick={handleClearCache}
        >
          Clear All Cache
        </button>
      </div>

      <div className="cache-info">
        <p className="cache-last-refresh">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
        <div className="cache-tips">
          <h4>Cache Strategy:</h4>
          <ul>
            <li>Product listings: 1 hour</li>
            <li>Product details: 30 minutes</li>
            <li>Search results: 15 minutes</li>
            <li>Categories: 2 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CacheStats;
