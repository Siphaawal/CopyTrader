export interface Wallet {
  address: string;
  label: string;
  addedAt: number;
}

export interface TokenTransfer {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  direction: 'in' | 'out';
}

export interface Activity {
  id: string;
  signature: string;
  walletAddress: string;
  walletLabel: string;
  timestamp: number;
  type: 'transfer' | 'swap' | 'jupiter_perp' | 'unknown';
  transfers: TokenTransfer[];
  isJupiterPerp: boolean;
  fee: number;
  success: boolean;
}

export interface Settings {
  pollInterval: number; // in seconds
  rpcEndpoint: string;
}

export interface JupiterPosition {
  positionPubkey: string;
  owner: string;
  pool: string;
  custody: string;
  collateralCustody: string;
  side: 'long' | 'short';
  sizeUsd: number;
  collateralUsd: number;
  entryPrice: number;
  markPrice: number;
  pnlUsd: number;
  pnlPercent: number;
  leverage: number;
  liquidationPrice: number;
  token: string;
  collateralToken: string;
  updatedAt: number;
}

export interface WalletPositions {
  walletAddress: string;
  positions: JupiterPosition[];
  lastFetched: number;
  error?: string;
}

export interface AppState {
  wallets: Wallet[];
  activities: Activity[];
  settings: Settings;
  isPolling: boolean;
  lastPollTime: number | null;
  error: string | null;
}
