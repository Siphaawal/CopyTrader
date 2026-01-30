import { useEffect, useRef, useState, useCallback } from 'react';

export function usePolling(
  callback: () => Promise<void>,
  intervalSeconds: number,
  enabled: boolean
) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<number | null>(null);
  const [nextPollIn, setNextPollIn] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const poll = useCallback(async () => {
    setIsPolling(true);
    try {
      await callback();
      setLastPollTime(Date.now());
    } finally {
      setIsPolling(false);
    }
  }, [callback]);

  // Start polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    // Initial poll
    poll();

    // Set up interval
    const intervalMs = intervalSeconds * 1000;
    intervalRef.current = window.setInterval(poll, intervalMs);

    // Set up countdown
    setNextPollIn(intervalSeconds);
    countdownRef.current = window.setInterval(() => {
      setNextPollIn((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [enabled, intervalSeconds, poll]);

  // Reset countdown when interval changes or poll completes
  useEffect(() => {
    if (lastPollTime && enabled) {
      setNextPollIn(intervalSeconds);
    }
  }, [lastPollTime, intervalSeconds, enabled]);

  const manualPoll = useCallback(async () => {
    await poll();
    setNextPollIn(intervalSeconds);
  }, [poll, intervalSeconds]);

  return {
    isPolling,
    lastPollTime,
    nextPollIn,
    manualPoll,
  };
}
