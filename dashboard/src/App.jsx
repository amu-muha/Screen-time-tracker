import React, { useState, useEffect } from 'react';
import { useDeviceId } from './hooks/useDeviceId';
import DeviceSetupPage from './pages/DeviceSetupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import { fetchDevices } from './api/client';
import './App.css';

export default function App() {
  const { deviceId, setDeviceId } = useDeviceId();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'apps' | 'timeline' | 'analytics' | 'insights' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme_preference') || 'light';
  });
  const [deviceLabel, setDeviceLabel] = useState('My Device');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', next.toString());
      return next;
    });
  };

  // Fetch device label
  useEffect(() => {
    if (!deviceId) return;
    fetchDevices()
      .then(devices => {
        const d = devices.find(x => x.id === deviceId);
        if (d) setDeviceLabel(d.label);
      })
      .catch(() => {});
  }, [deviceId]);

  if (!deviceId) {
    return <DeviceSetupPage onRegistered={setDeviceId} />;
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''}`}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        deviceName={deviceLabel}
        isTracking={true}
        theme={theme}
        onToggleTheme={toggleTheme}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 2. Main Content Canvas */}
      <main className="app-main-canvas">
        {activeTab === 'settings' ? (
          <div className="settings-wrapper">
            <SettingsPage
              deviceId={deviceId}
              onSelectDevice={setDeviceId}
              onRegisterNew={() => {
                setDeviceId(null);
                setActiveTab('overview');
              }}
              onBack={() => setActiveTab('overview')}
            />
          </div>
        ) : (
          <DashboardPage
            deviceId={deviceId}
            onSelectDevice={setDeviceId}
            onOpenSettings={() => setActiveTab('settings')}
            activeTab={activeTab}
          />
        )}
      </main>
    </div>
  );
}