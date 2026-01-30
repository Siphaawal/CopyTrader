import { Wallet, WalletPositions, JupiterPosition } from '../types';
import { getTokenSymbol } from '../services/jupiter';
import { sounds, initAudio } from '../services/sounds';

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

  const handleFetch = () => {
    initAudio();
    sounds.fetch();
    onFetchPositions();
  };

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

  const longRatio = totalSize > 0 ? (stats.totalLongSize / totalSize) * 100 : 50;
  const shortRatio = 100 - longRatio;

  return (
    <div className="space-y-6 fade-in">
      {/* Header with Fetch Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Positions Analytics</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time SOL perpetual positions</p>
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoading || wallets.length === 0}
          className="btn-fancy px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center gap-3 glow-purple"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Fetch Positions</span>
            </>
          )}
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">Add wallets to view position analytics</p>
        </div>
      ) : positions.size === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center float">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg mb-4">Click "Fetch Positions" to load position data</p>
          <p className="text-gray-500 text-sm">Positions will be fetched from Jupiter Perps API</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 card-hover" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Total Positions</p>
              </div>
              <p className="text-3xl font-bold text-white count-up">{stats.totalPositions}</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-green-400">{stats.longCount} Long</span> / <span className="text-red-400">{stats.shortCount} Short</span>
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 card-hover" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Total Exposure</p>
              </div>
              <p className="text-3xl font-bold text-white count-up">{formatCompact(totalSize)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Collateral: {formatCompact(stats.totalCollateral)}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 card-hover" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${totalPnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={totalPnl >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Total PnL</p>
              </div>
              <p className={`text-3xl font-bold count-up ${totalPnl >= 0 ? 'gradient-text-green' : 'gradient-text-red'}`}>
                {formatUsd(totalPnl)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalCollateral > 0 ? formatPercent((totalPnl / stats.totalCollateral) * 100) : '0%'} of collateral
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 card-hover" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${stats.totalLongSize > stats.totalShortSize ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${stats.totalLongSize > stats.totalShortSize ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Net Bias</p>
              </div>
              <p className={`text-3xl font-bold count-up ${stats.totalLongSize > stats.totalShortSize ? 'text-green-400 neon-text' : 'text-red-400 neon-text'}`}>
                {stats.totalLongSize > stats.totalShortSize ? 'LONG' : 'SHORT'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCompact(Math.abs(stats.totalLongSize - stats.totalShortSize))} net
              </p>
            </div>
          </div>

          {/* Long vs Short Bar */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full glow-green" />
                <span className="text-green-400 font-semibold">Long</span>
                <span className="text-gray-400">{formatCompact(stats.totalLongSize)}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${stats.totalLongPnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {formatUsd(stats.totalLongPnl)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-2 py-0.5 rounded-full ${stats.totalShortPnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {formatUsd(stats.totalShortPnl)}
                </span>
                <span className="text-gray-400">{formatCompact(stats.totalShortSize)}</span>
                <span className="text-red-400 font-semibold">Short</span>
                <div className="w-3 h-3 bg-red-500 rounded-full glow-red" />
              </div>
            </div>
            <div className="h-8 rounded-full overflow-hidden flex bg-gray-700/50 relative">
              <div
                className="bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${longRatio}%` }}
              >
                <div className="absolute inset-0 shimmer" />
              </div>
              <div
                className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${shortRatio}%` }}
              >
                <div className="absolute inset-0 shimmer" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm font-medium">
              <span className="text-green-400">{longRatio.toFixed(1)}%</span>
              <span className="text-red-400">{shortRatio.toFixed(1)}%</span>
            </div>
          </div>

          {/* By Token Breakdown */}
          {Object.keys(stats.byToken).length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
                By Token
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.byToken)
                  .sort((a, b) => (b[1].long + b[1].short) - (a[1].long + a[1].short))
                  .map(([token, data], index) => {
                    const tokenTotal = data.long + data.short;
                    const tokenLongRatio = tokenTotal > 0 ? (data.long / tokenTotal) * 100 : 0;
                    return (
                      <div key={token} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-white text-lg">{token}</span>
                          <div className="flex gap-4 items-center">
                            <span className="text-green-400 text-sm font-medium">L: {formatCompact(data.long)}</span>
                            <span className="text-red-400 text-sm font-medium">S: {formatCompact(data.short)}</span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${data.pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {formatUsd(data.pnl)}
                            </span>
                          </div>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden flex bg-gray-700/50">
                          <div className="bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500" style={{ width: `${tokenLongRatio}%` }} />
                          <div className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500" style={{ width: `${100 - tokenLongRatio}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Position List */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Positions
              <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                {allPositions.length}
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-purple-500/20">
                    <th className="text-left py-3 px-3 font-semibold">Wallet</th>
                    <th className="text-left py-3 px-3 font-semibold">Token</th>
                    <th className="text-left py-3 px-3 font-semibold">Side</th>
                    <th className="text-right py-3 px-3 font-semibold">Size</th>
                    <th className="text-right py-3 px-3 font-semibold">Leverage</th>
                    <th className="text-right py-3 px-3 font-semibold">Entry</th>
                    <th className="text-right py-3 px-3 font-semibold">Mark</th>
                    <th className="text-right py-3 px-3 font-semibold">Liq.</th>
                    <th className="text-right py-3 px-3 font-semibold">PnL</th>
                    <th className="text-right py-3 px-3 font-semibold">PnL %</th>
                  </tr>
                </thead>
                <tbody>
                  {allPositions.map((pos, index) => (
                    <tr
                      key={pos.positionPubkey}
                      className="border-b border-gray-700/30 table-row-hover"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="py-3 px-3 text-purple-400 font-medium">{pos.walletLabel}</td>
                      <td className="py-3 px-3 text-white font-bold">{getTokenSymbol(pos.token)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pos.side === 'long'
                            ? 'bg-green-500/20 text-green-400 glow-green'
                            : 'bg-red-500/20 text-red-400 glow-red'
                        }`}>
                          {pos.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-white font-semibold">{formatCompact(pos.sizeUsd)}</td>
                      <td className="py-3 px-3 text-right text-gray-300">{pos.leverage.toFixed(2)}x</td>
                      <td className="py-3 px-3 text-right text-gray-300">${pos.entryPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-gray-300">${pos.markPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-orange-400 font-medium">${pos.liquidationPrice.toFixed(2)}</td>
                      <td className={`py-3 px-3 text-right font-bold ${pos.pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatUsd(pos.pnlUsd)}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold ${pos.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full status-pulse" />
        Data from Jupiter Perps API (perps-api.jup.ag)
      </p>
    </div>
  );
}
