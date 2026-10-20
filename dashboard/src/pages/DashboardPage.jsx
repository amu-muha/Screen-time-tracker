import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchUsage,
  fetchInsights,
  fetchActiveEvent,
  fetchDevices
} from '../api/client';
import TopHeader from '../components/TopHeader';
import SummaryCards from '../components/SummaryCards';
import ScreenTimeRing from '../components/ScreenTimeRing';
import ActiveAppPanel from '../components/ActiveAppPanel';
import ActivityTimeline from '../components/ActivityTimeline';
import AppUsageGrid from '../components/AppUsageGrid';
import WeeklyAnalyticsChart from '../components/WeeklyAnalyticsChart';
import InsightPanel from '../components/InsightPanel';
import AppDetailModal from '../components/AppDetailModal';
import GoalModal from '../components/GoalModal';
import './DashboardPage.css';

const DEFAULT_GOAL_SECONDS = 8 * 3600;

export default function DashboardPage({
  deviceId,
  onSelectDevice,
  onOpenSettings,
  activeTab = 'overview'
}) {
  const [range, setRange] = useState('daily');
  const [usage, setUsage] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [insight, setInsight] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Daily screen time goal (seconds)
  const [goalSeconds, setGoalSeconds] = useState(() => {
    const saved = localStorage.getItem('daily_goal_seconds');
    return saved ? parseInt(saved, 10) : DEFAULT_GOAL_SECONDS;
  });

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Save goal handler
  const handleSaveGoal = (newGoal) => {
    setGoalSeconds(newGoal);
    localStorage.setItem('daily_goal_seconds', newGoal.toString());
  };

  // Fetch device list
  useEffect(() => {
    fetchDevices()
      .then(setDevices)
      .catch(() => {});
  }, []);

  // Primary data loader
  const loadData = useCallback(async (isInitial = false) => {
    if (!deviceId) return;
    if (isInitial) setLoading(true);

    try {
      const [usageData, insightData, activeData] = await Promise.all([
        fetchUsage(range, deviceId),
        fetchInsights(range, deviceId).catch(() => null),
        fetchActiveEvent(deviceId).catch(() => null)
      ]);

      setUsage(usageData || []);
      setInsight(insightData);
      setActiveEvent(activeData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  }, [range, deviceId]);

  // Polling loop for real-time updates
  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
      loadData(false);
    }, 4000); // 4-second refresh for foreground app & session tracking

    return () => clearInterval(interval);
  }, [loadData]);

  // Manual refresh button
  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // Aggregations
  const totalActiveSeconds = usage.reduce((sum, row) => sum + row.total_seconds, 0);
  const isTracking = Boolean(activeEvent?.is_active);

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* 1. Header with Controls */}
      <TopHeader
        range={range}
        onRangeChange={setRange}
        devices={devices}
        activeDeviceId={deviceId}
        onSelectDevice={onSelectDevice}
        onOpenSettings={onOpenSettings}
        isTracking={isTracking}
        onManualRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {error ? (
        <div className="dashboard-error-banner">
          <p>Unable to connect to the Screen Time Tracker API. Please verify the backend service is running.</p>
        </div>
      ) : (
        <>
          {/* 2. Top Summary Metric Cards Strip */}
          <SummaryCards
            usage={usage}
            activeEvent={activeEvent}
            goalSeconds={goalSeconds}
          />

          {/* Conditional rendering depending on sidebar tab */}
          {activeTab === 'overview' && (
            <>
              {/* 3. Top Main Grid: Ring & Active App (Left) + Timeline (Right) */}
              <div className="dashboard-main-grid">
                <div className="dashboard-left-col">
                  {/* Large Circular Screen-Time Visualization */}
                  <ScreenTimeRing
                    totalSeconds={totalActiveSeconds}
                    goalSeconds={goalSeconds}
                    onOpenGoalModal={() => setIsGoalModalOpen(true)}
                    isTracking={isTracking}
                  />

                  {/* Prominent Currently Active Application Panel */}
                  <ActiveAppPanel
                    activeEvent={activeEvent}
                    todaySeconds={
                      activeEvent?.app_name
                        ? usage.find(u => u.app_name === activeEvent.app_name)?.total_seconds || activeEvent.session_duration_seconds
                        : 0
                    }
                    totalActiveSeconds={totalActiveSeconds}
                    onViewDetails={(appName) => {
                      const matched = usage.find(u => u.app_name === appName);
                      if (matched) setSelectedApp(matched);
                    }}
                  />
                </div>

                {/* Right: Continuous Activity Timeline */}
                <div className="dashboard-right-col">
                  <ActivityTimeline
                    deviceId={deviceId}
                    onSelectSession={(session) => {
                      const matched = usage.find(u => u.app_name === session.app_name);
                      if (matched) setSelectedApp(matched);
                    }}
                  />
                </div>
              </div>

              {/* 4. Bottom Main Grid: App Usage Grid with Semicircles (Left) + 7-Day Chart (Right) */}
              <div className="dashboard-secondary-grid">
                <div className="dashboard-secondary-main">
                  {/* Application Usage Cards with Distinctive Semicircular Gauges */}
                  <AppUsageGrid
                    usage={usage}
                    activeAppName={activeEvent?.app_name || ''}
                    totalActiveSeconds={totalActiveSeconds}
                    goalSeconds={goalSeconds}
                    onSelectApp={(app) => setSelectedApp(app)}
                  />
                </div>

                <div className="dashboard-secondary-side">
                  {/* 7-Day Stacked Activity Chart */}
                  <WeeklyAnalyticsChart deviceId={deviceId} />
                </div>
              </div>

              {/* 5. Productivity Insights Banner */}
              <InsightPanel
                insight={insight}
                usage={usage}
                loading={loading}
                goalSeconds={goalSeconds}
              />
            </>
          )}

          {activeTab === 'apps' && (
            <div className="tab-view-container">
              <AppUsageGrid
                usage={usage}
                activeAppName={activeEvent?.app_name || ''}
                totalActiveSeconds={totalActiveSeconds}
                goalSeconds={goalSeconds}
                onSelectApp={(app) => setSelectedApp(app)}
              />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tab-view-container tab-view-container--full">
              <ActivityTimeline
                deviceId={deviceId}
                onSelectSession={(session) => {
                  const matched = usage.find(u => u.app_name === session.app_name);
                  if (matched) setSelectedApp(matched);
                }}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-view-container">
              <div className="analytics-view-grid">
                <WeeklyAnalyticsChart deviceId={deviceId} />
                <InsightPanel
                  insight={insight}
                  usage={usage}
                  loading={loading}
                  goalSeconds={goalSeconds}
                />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="tab-view-container">
              <InsightPanel
                insight={insight}
                usage={usage}
                loading={loading}
                goalSeconds={goalSeconds}
              />
            </div>
          )}
        </>
      )}

      {/* Detail Modal for Selected App */}
      <AppDetailModal
        app={selectedApp}
        deviceId={deviceId}
        totalActiveSeconds={totalActiveSeconds}
        goalSeconds={goalSeconds}
        onClose={() => setSelectedApp(null)}
      />

      {/* Goal Setting Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoalSeconds={goalSeconds}
        onSave={handleSaveGoal}
      />
    </div>
  );
}