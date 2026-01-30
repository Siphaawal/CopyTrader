import { Wallet, WalletPositions } from '../types';
import { getTokenSymbol } from '../services/jupiter';

interface PositionsPanelProps {
  wallets: Wallet[];
  positions: Map<string, WalletPositions>;
  isLoading: boolean;
  onFetchPositions: () => void;
}

export function PositionsPanel({
  wallets,
  positions,
  isLoading,
  onFetchPositions,
}: PositionsPanelProps) {
  const totalPositions = Array.from(positions.values()).reduce(
    (acc, wp) => acc + wp.positions.length,
    0
  );

  const formatUsd = (value: number | string | null | undefined) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPrice = (value: number | string | null | undefined) => {
    const num = Number(value) || 0;
    if (num >= 1000) {
      return formatUsd(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatPercent = (value: number | string | null | undefined) => {
    const num = Number(value) || 0;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const formatLeverage = (value: number | string | null | undefined) => {
    const num = Number(value) || 0;
    return `${num.toFixed(2)}x`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Open Positions
          {totalPositions > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              ({totalPositions})
            </span>
          )}
        </h2>
        <button
          onClick={onFetchPositions}
          disabled={isLoading || wallets.length === 0}
          className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Fetch Positions
            </>
          )}
        </button>
      </div>

      {wallets.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          Add wallets to view positions
        </p>
      ) : positions.size === 0 ? (
        <p className="text-gray-400 text-center py-4">
          Click "Fetch Positions" to load open perp positions
        </p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {wallets.map((wallet) => {
            const walletPos = positions.get(wallet.address);
            if (!walletPos) return null;

            return (
              <div key={wallet.address} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-400">
                    {wallet.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                  </span>
                </div>

                {walletPos.error ? (
                  <p className="text-red-400 text-sm">{walletPos.error}</p>
                ) : walletPos.positions.length === 0 ? (
                  <p className="text-gray-500 text-sm pl-2">
                    No open positions
                  </p>
                ) : (
                  walletPos.positions.map((pos) => (
                    <div
                      key={pos.positionPubkey}
                      className="bg-gray-700 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {getTokenSymbol(pos.token)}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded font-medium ${
                              pos.side === 'long'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {pos.side.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatLeverage(pos.leverage)}
                          </span>
                        </div>
                        <span
                          className={`font-medium ${
                            pos.pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatUsd(pos.pnlUsd)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white">
                            {formatUsd(pos.sizeUsd)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Collateral:</span>
                          <span className="text-white">
                            {formatUsd(pos.collateralUsd)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry:</span>
                          <span className="text-white">
                            {formatPrice(pos.entryPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mark:</span>
                          <span className="text-white">
                            {formatPrice(pos.markPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Liq. Price:</span>
                          <span className="text-orange-400">
                            {formatPrice(pos.liquidationPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">PnL %:</span>
                          <span
                            className={
                              pos.pnlPercent >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {formatPercent(pos.pnlPercent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Data from Jupiter Perps API (perps-api.jup.ag)
      </p>
    </div>
  );
}
