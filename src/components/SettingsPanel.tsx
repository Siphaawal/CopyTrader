import { useState } from 'react';
import { Settings } from '../types';
import { MIN_POLL_INTERVAL, MAX_POLL_INTERVAL } from '../constants';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateInterval: (interval: number) => void;
  onUpdateRpcEndpoint: (endpoint: string) => void;
  onClearActivities: () => void;
  onClearAll: () => void;
}

export function SettingsPanel({
  settings,
  onUpdateInterval,
  onUpdateRpcEndpoint,
  onClearActivities,
  onClearAll,
}: SettingsPanelProps) {
  const [rpcInput, setRpcInput] = useState(settings.rpcEndpoint);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRpcSave = () => {
    if (rpcInput.trim()) {
      onUpdateRpcEndpoint(rpcInput.trim());
    }
  };

  const handleClearAll = () => {
    if (showConfirm) {
      onClearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Poll Interval (seconds)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_POLL_INTERVAL}
              max={MAX_POLL_INTERVAL}
              value={settings.pollInterval}
              onChange={(e) => onUpdateInterval(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-white font-mono w-12 text-right">
              {settings.pollInterval}s
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Range: {MIN_POLL_INTERVAL}s - {MAX_POLL_INTERVAL}s
          </p>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <label className="block text-sm text-gray-400 mb-2">
            Solana RPC Endpoint
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={rpcInput}
              onChange={(e) => setRpcInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleRpcSave}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Save
            </button>
          </div>
          <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/30 rounded text-xs text-blue-300">
            <p className="font-semibold mb-1">Get a free RPC:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a href="https://www.helius.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
                  Helius
                </a> - Free tier available
              </li>
              <li>
                <a href="https://www.quicknode.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
                  QuickNode
                </a> - Free tier available
              </li>
              <li>
                <a href="https://www.alchemy.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
                  Alchemy
                </a> - Free Solana RPC
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-2">
          <button
            onClick={onClearActivities}
            className="w-full px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
          >
            Clear Activity History
          </button>

          <button
            onClick={handleClearAll}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              showConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
            }`}
          >
            {showConfirm ? 'Click again to confirm' : 'Clear All Data & Reset'}
          </button>

          {showConfirm && (
            <p className="text-xs text-red-400 text-center">
              This will delete all wallets, activities, and settings!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
