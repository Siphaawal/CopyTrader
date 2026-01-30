import { Wallet, Settings, Activity } from '../types';
import { STORAGE_KEYS, DEFAULT_POLL_INTERVAL, DEFAULT_RPC_ENDPOINT } from '../constants';

export const storage = {
  getWallets(): Wallet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWallets(wallets: Wallet[]): void {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  },

  getSettings(): Settings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fall through to default
    }
    return {
      pollInterval: DEFAULT_POLL_INTERVAL,
      rpcEndpoint: DEFAULT_RPC_ENDPOINT,
    };
  },

  saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveActivities(activities: Activity[]): void {
    // Keep only the last 500 activities to prevent storage overflow
    const trimmed = activities.slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(trimmed));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.WALLETS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  },
};
