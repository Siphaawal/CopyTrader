import { useState } from 'react';
import { Activity } from '../types';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading: boolean;
  wallets: { address: string; label: string }[];
  isPolling: boolean;
  lastPollTime: number | null;
  nextPollIn: number;
  onManualPoll: () => void;
  pollingEnabled: boolean;
  onTogglePolling: () => void;
}

type FilterType = 'all' | 'jupiter_perp' | 'swap' | 'transfer';

export function ActivityFeed({
  activities,
  isLoading,
  wallets,
  isPolling,
  lastPollTime,
  nextPollIn,
  onManualPoll,
  pollingEnabled,
  onTogglePolling,
}: ActivityFeedProps) {
  const [filterType, setFilterType] = useState<FilterType>('jupiter_perp');
  const [filterWallet, setFilterWallet] = useState<string>('all');

  const filteredActivities = activities.filter((activity) => {
    if (filterType !== 'all' && activity.type !== filterType) {
      return false;
    }
    if (filterWallet !== 'all' && activity.walletAddress !== filterWallet) {
      return false;
    }
    return true;
  });

  const jupiterPerpCount = activities.filter((a) => a.isJupiterPerp).length;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-full">
      {/* Polling Controls */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="text-sm text-gray-400">
          {lastPollTime && (
            <span>Last update: {formatTime(lastPollTime)}</span>
          )}
          {pollingEnabled && !isPolling && lastPollTime && (
            <span className="ml-3 text-gray-500">Next in {nextPollIn}s</span>
          )}
          {isPolling && (
            <span className="ml-3 text-blue-400 animate-pulse">Scanning...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onManualPoll}
            disabled={isPolling}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            {isPolling ? 'Scanning...' : 'Scan Now'}
          </button>
          <button
            onClick={onTogglePolling}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              pollingEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {pollingEnabled ? 'Auto: ON' : 'Auto: OFF'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Activity Feed
          {jupiterPerpCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded">
              {jupiterPerpCount} Perp Trades
            </span>
          )}
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="jupiter_perp">Jupiter Perp</option>
          <option value="swap">Swaps</option>
          <option value="transfer">Transfers</option>
        </select>

        <select
          value={filterWallet}
          onChange={(e) => setFilterWallet(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Wallets</option>
          {wallets.map((wallet) => (
            <option key={wallet.address} value={wallet.address}>
              {wallet.label}
            </option>
          ))}
        </select>

        <span className="px-3 py-1.5 text-gray-400 text-sm">
          {filteredActivities.length} transactions
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No activities yet</p>
            <p className="text-sm text-gray-500">
              Add wallets and wait for transactions
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
