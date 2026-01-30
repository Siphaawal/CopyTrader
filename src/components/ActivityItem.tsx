import { Activity, TokenTransfer } from '../types';
import { KNOWN_TOKENS } from '../constants';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  const getTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'jupiter_perp':
        return 'Jupiter Perp';
      case 'swap':
        return 'Swap';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'jupiter_perp':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'swap':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'transfer':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Determine position type for perp trades
  const getPerpPositionInfo = () => {
    if (!activity.isJupiterPerp) return null;

    const outTransfer = activity.transfers.find(t => t.direction === 'out');
    const inTransfer = activity.transfers.find(t => t.direction === 'in');

    if (outTransfer && !inTransfer) {
      return { action: 'OPEN', direction: 'LONG/SHORT', collateral: outTransfer };
    } else if (inTransfer && !outTransfer) {
      return { action: 'CLOSE', direction: 'POSITION', collateral: inTransfer };
    } else if (outTransfer && inTransfer) {
      return { action: 'MODIFY', direction: 'POSITION', collateral: outTransfer };
    }
    return null;
  };

  const perpInfo = getPerpPositionInfo();

  // Get token info from KNOWN_TOKENS or use what we have
  const getTokenInfo = (transfer: TokenTransfer) => {
    const knownToken = KNOWN_TOKENS[transfer.mint];
    if (knownToken) {
      return {
        symbol: knownToken.symbol,
        name: knownToken.name || knownToken.symbol,
        isKnown: true,
      };
    }
    return {
      symbol: transfer.symbol || truncateAddress(transfer.mint),
      name: transfer.symbol || 'Unknown Token',
      isKnown: !!transfer.symbol,
    };
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        activity.isJupiterPerp
          ? 'bg-orange-900/20 border-orange-500/30'
          : 'bg-gray-800 border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(
              activity.type
            )}`}
          >
            {getTypeLabel(activity.type)}
          </span>
          {activity.isJupiterPerp && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500 text-white">
              PERP TRADE
            </span>
          )}
          {perpInfo && (
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              perpInfo.action === 'OPEN' ? 'bg-green-600 text-white' :
              perpInfo.action === 'CLOSE' ? 'bg-red-600 text-white' :
              'bg-yellow-600 text-white'
            }`}>
              {perpInfo.action}
            </span>
          )}
          {!activity.success && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-400 border border-red-500/50">
              Failed
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400">
          {formatTime(activity.timestamp)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-400">
          Wallet:{' '}
          <span className="text-purple-400 font-medium">
            {activity.walletLabel}
          </span>
        </p>
      </div>

      {/* Token Transfers with enhanced display */}
      {activity.transfers.length > 0 && (
        <div className="space-y-3 mb-3 bg-gray-900/50 rounded p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Token Movements</p>
          {activity.transfers.map((transfer, idx) => {
            const tokenInfo = getTokenInfo(transfer);
            return (
              <div
                key={idx}
                className={`flex items-center justify-between ${
                  transfer.direction === 'in' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-5">
                    {transfer.direction === 'in' ? '+' : '-'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base">
                        {transfer.amount.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </span>
                      <a
                        href={`https://solscan.io/token/${transfer.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold hover:underline"
                      >
                        {tokenInfo.symbol}
                      </a>
                    </div>
                    <div className="text-xs text-gray-400">
                      {tokenInfo.name}
                      {!tokenInfo.isKnown && (
                        <span className="ml-1 text-gray-500">
                          ({truncateAddress(transfer.mint)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://birdeye.so/token/${transfer.mint}?chain=solana`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded"
                >
                  Chart
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Perp-specific details */}
      {activity.isJupiterPerp && (
        <div className="mb-3 p-2 bg-orange-900/30 rounded text-xs">
          <p className="text-orange-300">
            Jupiter Perpetuals - Check{' '}
            <a
              href={`https://solscan.io/tx/${activity.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-200"
            >
              transaction details
            </a>
            {' '}for full position info (leverage, size, entry price)
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <a
            href={`https://solscan.io/tx/${activity.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-blue-400 transition-colors"
          >
            {truncateSignature(activity.signature)}
          </a>
          <a
            href={`https://solscan.io/tx/${activity.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on Solscan
          </a>
        </div>
        <span>Fee: {activity.fee.toFixed(6)} SOL</span>
      </div>
    </div>
  );
}
