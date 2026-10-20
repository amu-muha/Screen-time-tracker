import { useState } from 'react';
import { useDeviceId } from './hooks/useDeviceId';
import DeviceSetupPage from './pages/DeviceSetupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { deviceId, setDeviceId } = useDeviceId();
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' | 'settings'

  if (!deviceId) {
    return <DeviceSetupPage onRegistered={setDeviceId} />;
  }

  if (screen === 'settings') {
    return (
      <SettingsPage
        deviceId={deviceId}
        onSelectDevice={setDeviceId}
        onRegisterNew={() => { setDeviceId(null); setScreen('dashboard'); }}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  return <DashboardPage deviceId={deviceId} onOpenSettings={() => setScreen('settings')} />;
}