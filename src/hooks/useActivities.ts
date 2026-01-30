import { useState, useCallback, useEffect, useRef } from 'react';
import { Activity, Wallet } from '../types';
import { storage } from '../services/storage';
import { fetchWalletActivities } from '../services/solana';

export function useActivities(wallets: Wallet[], rpcEndpoint: string) {
  // Initialize directly from storage to avoid race condition
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = storage.getActivities();
    return saved;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const knownSignatures = useRef<Set<string>>(new Set());
  // Track if new activities have been fetched (not just initial load)
  const hasNewActivities = useRef(false);

  // Populate known signatures on init
  useEffect(() => {
    const saved = storage.getActivities();
    for (const activity of saved) {
      knownSignatures.current.add(activity.signature);
    }
  }, []);

  // Save activities to storage only when new activities are fetched
  useEffect(() => {
    if (hasNewActivities.current && activities.length > 0) {
      storage.saveActivities(activities);
    }
  }, [activities]);

  const fetchAllActivities = useCallback(async () => {
    if (wallets.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const allNewActivities: Activity[] = [];

      for (const wallet of wallets) {
        try {
          const newActivities = await fetchWalletActivities(
            wallet.address,
            wallet.label,
            rpcEndpoint,
            knownSignatures.current
          );
          allNewActivities.push(...newActivities);

          // Add to known signatures
          for (const activity of newActivities) {
            knownSignatures.current.add(activity.signature);
          }
        } catch (err) {
          console.error(`Error fetching activities for ${wallet.label}:`, err);
        }
      }

      if (allNewActivities.length > 0) {
        hasNewActivities.current = true;
        setActivities((prev) => {
          const combined = [...allNewActivities, ...prev];
          // Sort by timestamp descending
          combined.sort((a, b) => b.timestamp - a.timestamp);
          // Keep only the latest 500
          return combined.slice(0, 500);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setIsLoading(false);
    }
  }, [wallets, rpcEndpoint]);

  const clearActivities = useCallback(() => {
    setActivities([]);
    knownSignatures.current.clear();
    hasNewActivities.current = false;
    storage.saveActivities([]);
  }, []);

  return {
    activities,
    isLoading,
    error,
    fetchAllActivities,
    clearActivities,
  };
}
