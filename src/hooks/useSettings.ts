import { useState, useCallback, useEffect } from 'react';
import { Settings } from '../types';
import { storage } from '../services/storage';
import { MIN_POLL_INTERVAL, MAX_POLL_INTERVAL } from '../constants';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(storage.getSettings());

  // Save settings to storage when they change
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  const updatePollInterval = useCallback((interval: number) => {
    const clamped = Math.min(Math.max(interval, MIN_POLL_INTERVAL), MAX_POLL_INTERVAL);
    setSettings((prev) => ({ ...prev, pollInterval: clamped }));
  }, []);

  const updateRpcEndpoint = useCallback((endpoint: string) => {
    setSettings((prev) => ({ ...prev, rpcEndpoint: endpoint }));
  }, []);

  return {
    settings,
    updatePollInterval,
    updateRpcEndpoint,
  };
}
