import React from 'react';
import {
  LayoutDashboard,
  Grid,
  Clock,
  BarChart3,
  Sparkles,
  Settings,
  Laptop,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  activeTab = 'overview',
  onTabChange,
  deviceName = 'Device',
  isTracking = true,
  theme = 'light',
  onToggleTheme,
  collapsed = false,
  onToggleCollapse
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'apps', label: 'Applications', icon: Grid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`app-sidebar ${collapsed ? 'app-sidebar--collapsed' : ''}`}>
      {/* Brand & Logo */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-logo__ring" />
          <div className="brand-logo__dot" />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-title">ScreenTime</span>
            <span className="brand-badge">Tracker</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'nav-btn--active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className="nav-btn__icon" />
              {!collapsed && <span className="nav-btn__label">{item.label}</span>}
              {isActive && <span className="nav-btn__indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Footer / Device Status & Theme */}
      <div className="sidebar-footer">
        {/* Device Status */}
        <div className="sidebar-device">
          <div className="sidebar-device__icon">
            <Laptop size={16} />
          </div>
          {!collapsed && (
            <div className="sidebar-device__info">
              <span className="sidebar-device__name" title={deviceName}>{deviceName}</span>
              <span className="sidebar-device__status">
                <span className={`status-dot ${isTracking ? 'status-dot--live' : ''}`} />
                {isTracking ? 'Tracking Live' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Theme Toggle & Collapse Button */}
        <div className="sidebar-actions">
          <button
            className="sidebar-icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="sidebar-icon-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
