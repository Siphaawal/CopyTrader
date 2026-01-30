import { Wallet, WalletPositions, JupiterPosition } from '../types';
import { getTokenSymbol } from '../services/jupiter';

interface PositionsTabProps {
  wallets: Wallet[];
  positions: Map<string, WalletPositions>;
  isLoading: boolean;
  onFetchPositions: () => void;
}

interface AggregatedStats {
  totalPositions: number;
  longCount: number;
  shortCount: number;
  totalLongSize: number;
  totalShortSize: number;
  totalLongPnl: number;
  totalShortPnl: number;
  totalCollateral: number;
  byToken: Record<string, { long: number; short: number; pnl: number }>;
}

function aggregatePositions(positions: Map<string, WalletPositions>): AggregatedStats {
  const stats: AggregatedStats = {
    totalPositions: 0,
    longCount: 0,
    shortCount: 0,
    totalLongSize: 0,
    totalShortSize: 0,
    totalLongPnl: 0,
    totalShortPnl: 0,
    totalCollateral: 0,
    byToken: {},
  };

  for (const [, walletPos] of positions) {
    for (const pos of walletPos.positions) {
      stats.totalPositions++;
      stats.totalCollateral += pos.collateralUsd;

      const token = getTokenSymbol(pos.token);
      if (!stats.byToken[token]) {
        stats.byToken[token] = { long: 0, short: 0, pnl: 0 };
      }

      if (pos.side === 'long') {
        stats.longCount++;
        stats.totalLongSize += pos.sizeUsd;
        stats.totalLongPnl += pos.pnlUsd;
        stats.byToken[token].long += pos.sizeUsd;
      } else {
        stats.shortCount++;
        stats.totalShortSize += pos.sizeUsd;
        stats.totalShortPnl += pos.pnlUsd;
        stats.byToken[token].short += pos.sizeUsd;
      }
      stats.byToken[token].pnl += pos.pnlUsd;
    }
  }

  return stats;
}

function getAllPositions(positions: Map<string, WalletPositions>, wallets: Wallet[]): Array<JupiterPosition & { walletLabel: string }> {
  const allPositions: Array<JupiterPosition & { walletLabel: string }> = [];

  for (const [address, walletPos] of positions) {
    const wallet = wallets.find(w => w.address === address);
    const label = wallet?.label || address.slice(0, 8);

    for (const pos of walletPos.positions) {
      allPositions.push({ ...pos, walletLabel: label });
    }
  }

  return allPositions.sort((a, b) => Math.abs(b.sizeUsd) - Math.abs(a.sizeUsd));
}

export function PositionsTab({
  wallets,
  positions,
  isLoading,
  onFetchPositions,
}: PositionsTabProps) {
  const stats = aggregatePositions(positions);
  const allPositions = getAllPositions(positions, wallets);
  const totalPnl = stats.totalLongPnl + stats.totalShortPnl;
  const totalSize = stats.totalLongSize + stats.totalShortSize;

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return formatUsd(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Calculate long/short ratio for visualization
  const longRatio = totalSize > 0 ? (stats.totalLongSize / totalSize) * 100 : 50;
  const shortRatio = 100 - longRatio;

  return (
    <div className="space-y-6">
      {/* Header with Fetch Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Positions Analytics</h2>
        <button
          onClick={onFetchPositions}
          disabled={isLoading || wallets.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Fetch Positions
            </>
          )}
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Add wallets to view position analytics</p>
        </div>
      ) : positions.size === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Click "Fetch Positions" to load position data</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Positions</p>
              <p className="text-2xl font-bold text-white">{stats.totalPositions}</p>
              <p className="text-sm text-gray-500">
                {stats.longCount} Long / {stats.shortCount} Short
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Exposure</p>
              <p className="text-2xl font-bold text-white">{formatCompact(totalSize)}</p>
              <p className="text-sm text-gray-500">
                Collateral: {formatCompact(stats.totalCollateral)}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total PnL</p>
              <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatUsd(totalPnl)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.totalCollateral > 0 ? formatPercent((totalPnl / stats.totalCollateral) * 100) : '0%'} of collateral
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Net Bias</p>
              <p className={`text-2xl font-bold ${stats.totalLongSize > stats.totalShortSize ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalLongSize > stats.totalShortSize ? 'LONG' : 'SHORT'}
              </p>
              <p className="text-sm text-gray-500">
                {formatCompact(Math.abs(stats.totalLongSize - stats.totalShortSize))} net
              </p>
            </div>
          </div>

          {/* Long vs Short Bar */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-green-400 font-medium">Long</span>
                <span className="text-gray-400 ml-2">{formatCompact(stats.totalLongSize)}</span>
                <span className={`ml-2 text-sm ${stats.totalLongPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({formatUsd(stats.totalLongPnl)})
                </span>
              </div>
              <div>
                <span className={`mr-2 text-sm ${stats.totalShortPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({formatUsd(stats.totalShortPnl)})
                </span>
                <span className="text-gray-400 mr-2">{formatCompact(stats.totalShortSize)}</span>
                <span className="text-red-400 font-medium">Short</span>
              </div>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex bg-gray-700">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${longRatio}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${shortRatio}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{longRatio.toFixed(1)}%</span>
              <span>{shortRatio.toFixed(1)}%</span>
            </div>
          </div>

          {/* By Token Breakdown */}
          {Object.keys(stats.byToken).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">By Token</h3>
              <div className="space-y-3">
                {Object.entries(stats.byToken)
                  .sort((a, b) => (b[1].long + b[1].short) - (a[1].long + a[1].short))
                  .map(([token, data]) => {
                    const tokenTotal = data.long + data.short;
                    const tokenLongRatio = tokenTotal > 0 ? (data.long / tokenTotal) * 100 : 0;
                    return (
                      <div key={token}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-white">{token}</span>
                          <div className="flex gap-4">
                            <span className="text-green-400 text-sm">L: {formatCompact(data.long)}</span>
                            <span className="text-red-400 text-sm">S: {formatCompact(data.short)}</span>
                            <span className={`text-sm ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              PnL: {formatUsd(data.pnl)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden flex bg-gray-700">
                          <div className="bg-green-500" style={{ width: `${tokenLongRatio}%` }} />
                          <div className="bg-red-500" style={{ width: `${100 - tokenLongRatio}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Position List */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">All Positions ({allPositions.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-2">Wallet</th>
                    <th className="text-left py-2 px-2">Token</th>
                    <th className="text-left py-2 px-2">Side</th>
                    <th className="text-right py-2 px-2">Size</th>
                    <th className="text-right py-2 px-2">Leverage</th>
                    <th className="text-right py-2 px-2">Entry</th>
                    <th className="text-right py-2 px-2">Mark</th>
                    <th className="text-right py-2 px-2">Liq.</th>
                    <th className="text-right py-2 px-2">PnL</th>
                    <th className="text-right py-2 px-2">PnL %</th>
                  </tr>
                </thead>
                <tbody>
                  {allPositions.map((pos) => (
                    <tr key={pos.positionPubkey} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-2 px-2 text-purple-400">{pos.walletLabel}</td>
                      <td className="py-2 px-2 text-white font-medium">{getTokenSymbol(pos.token)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          pos.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pos.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-white">{formatCompact(pos.sizeUsd)}</td>
                      <td className="py-2 px-2 text-right text-gray-300">{pos.leverage.toFixed(2)}x</td>
                      <td className="py-2 px-2 text-right text-gray-300">${pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-gray-300">${pos.markPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-orange-400">${pos.liquidationPrice.toFixed(2)}</td>
                      <td className={`py-2 px-2 text-right font-medium ${pos.pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatUsd(pos.pnlUsd)}
                      </td>
                      <td className={`py-2 px-2 text-right ${pos.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(pos.pnlPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 text-center">
        Data from Jupiter Perps API (perps-api.jup.ag)
      </p>
    </div>
  );
}
