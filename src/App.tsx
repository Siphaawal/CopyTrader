import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { WalletManager } from './components/WalletManager';
import { ActivityFeed } from './components/ActivityFeed';
import { SettingsPanel } from './components/SettingsPanel';
import { TabNavigation } from './components/TabNavigation';
import { PositionsTab } from './components/PositionsTab';
import { useWallets } from './hooks/useWallets';
import { useSettings } from './hooks/useSettings';
import { useActivities } from './hooks/useActivities';
import { usePolling } from './hooks/usePolling';
import { usePositions } from './hooks/usePositions';
import { storage } from './services/storage';

const TABS = [
  {
    id: 'activity',
    label: 'Activity Feed',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'positions',
    label: 'Positions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('positions');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    wallets,
    addWallet,
    removeWallet,
    updateWalletLabel,
    error: walletError,
    clearError: clearWalletError,
    exportWallets,
    importWallets,
  } = useWallets();

  const { settings, updatePollInterval, updateRpcEndpoint } = useSettings();

  const {
    activities,
    isLoading,
    fetchAllActivities,
    clearActivities,
  } = useActivities(wallets, settings.rpcEndpoint);

  const { isPolling, lastPollTime, nextPollIn, manualPoll } = usePolling(
    fetchAllActivities,
    settings.pollInterval,
    pollingEnabled && wallets.length > 0
  );

  const {
    positions,
    isLoading: isLoadingPositions,
    fetchAllPositions,
  } = usePositions();

  const handleFetchPositions = useCallback(() => {
    fetchAllPositions(wallets.map((w) => w.address));
  }, [fetchAllPositions, wallets]);

  const handleClearAll = useCallback(() => {
    storage.clearAll();
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen animated-bg text-white relative">
      {/* Aurora background effect */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />

      <Header />

      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
          } transition-all duration-500 ease-out border-r border-purple-500/20 glass flex-shrink-0`}
        >
          <div className="p-4 space-y-4 h-[calc(100vh-73px)] overflow-y-auto">
            <WalletManager
              wallets={wallets}
              onAddWallet={addWallet}
              onRemoveWallet={removeWallet}
              onUpdateLabel={updateWalletLabel}
              error={walletError}
              onClearError={clearWalletError}
              onExport={exportWallets}
              onImport={importWallets}
            />
            <SettingsPanel
              settings={settings}
              onUpdateInterval={updatePollInterval}
              onUpdateRpcEndpoint={updateRpcEndpoint}
              onClearActivities={clearActivities}
              onClearAll={handleClearAll}
            />

            {/* Jupiter Perp Info Box */}
            <div className="glass-card rounded-2xl p-5 border-orange-500/20 glow-orange">
              <h3 className="text-orange-400 font-bold mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Jupiter Perpetuals
              </h3>
              <p className="text-xs text-gray-400 mb-2">
                Monitoring vault authority:
              </p>
              <code className="text-xs text-orange-300/80 bg-orange-500/10 px-3 py-2 rounded-lg block break-all font-mono border border-orange-500/20">
                AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49
              </code>
            </div>
          </div>
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 transform -translate-y-1/2 z-10 glass hover:bg-purple-500/20 p-2 rounded-r-xl transition-all duration-300 border border-purple-500/30 border-l-0"
          style={{ left: sidebarCollapsed ? 0 : '320px' }}
        >
          <svg
            className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <TabNavigation
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {activeTab === 'activity' && (
              <ActivityFeed
                activities={activities}
                isLoading={isLoading || isPolling}
                wallets={wallets}
                isPolling={isPolling || isLoading}
                lastPollTime={lastPollTime}
                nextPollIn={nextPollIn}
                onManualPoll={manualPoll}
                pollingEnabled={pollingEnabled}
                onTogglePolling={() => setPollingEnabled((prev) => !prev)}
              />
            )}

            {activeTab === 'positions' && (
              <PositionsTab
                wallets={wallets}
                positions={positions}
                isLoading={isLoadingPositions}
                onFetchPositions={handleFetchPositions}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
