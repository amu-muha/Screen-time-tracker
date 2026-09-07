import { useState, useCallback } from 'react';

const STORAGE_KEY = 'screen-time-tracker:device_id';

export function useDeviceId() {
  const [deviceId, setDeviceIdState] = useState(() => localStorage.getItem(STORAGE_KEY));

  const setDeviceId = useCallback((id) => {
    localStorage.setItem(STORAGE_KEY, id);
    setDeviceIdState(id);
  }, []);

  const clearDeviceId = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDeviceIdState(null);
  }, []);

  return { deviceId, setDeviceId, clearDeviceId };
}