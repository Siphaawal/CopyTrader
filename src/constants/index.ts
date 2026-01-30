// Jupiter Labs Perpetuals Vault Authority
export const JUPITER_PERP_VAULT_AUTHORITY = 'AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49';

// Default RPC endpoints (browser-friendly, no auth required)
export const DEFAULT_RPC_ENDPOINT = 'https://rpc.ankr.com/solana';
export const BACKUP_RPC_ENDPOINTS = [
  'https://rpc.ankr.com/solana',
  'https://api.mainnet-beta.solana.com',
];

// Default settings
export const DEFAULT_POLL_INTERVAL = 60; // seconds
export const MIN_POLL_INTERVAL = 10; // seconds
export const MAX_POLL_INTERVAL = 300; // seconds

// Storage keys
export const STORAGE_KEYS = {
  WALLETS: 'copytrader_wallets',
  SETTINGS: 'copytrader_settings',
  ACTIVITIES: 'copytrader_activities',
} as const;

// Transaction fetch limit
export const TRANSACTION_FETCH_LIMIT = 20;

// Known token mints for display
export const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number; name?: string }> = {
  // Native SOL
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9, name: 'Solana' },

  // Stablecoins
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6, name: 'Tether USD' },
  'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA': { symbol: 'USDS', decimals: 6, name: 'USDS' },

  // LSTs (Liquid Staking Tokens)
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', decimals: 9, name: 'Marinade SOL' },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': { symbol: 'jitoSOL', decimals: 9, name: 'Jito SOL' },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { symbol: 'bSOL', decimals: 9, name: 'BlazeStake SOL' },

  // Major tokens
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', decimals: 6, name: 'Jupiter' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', decimals: 5, name: 'Bonk' },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF', decimals: 6, name: 'dogwifhat' },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH', decimals: 6, name: 'Pyth Network' },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': { symbol: 'RENDER', decimals: 8, name: 'Render' },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'WETH', decimals: 8, name: 'Wrapped ETH' },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': { symbol: 'WBTC', decimals: 8, name: 'Wrapped BTC' },
  'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': { symbol: 'HNT', decimals: 8, name: 'Helium' },
  'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y': { symbol: 'SHDW', decimals: 9, name: 'Shadow Token' },
  'RAYdGMVVLRxLnPpX7n4Rf85Xa3tWg5L5EB9Bp3RD7HB': { symbol: 'RAY', decimals: 6, name: 'Raydium' },
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE': { symbol: 'ORCA', decimals: 6, name: 'Orca' },

  // Jupiter Perp LP tokens
  '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4': { symbol: 'JLP', decimals: 6, name: 'Jupiter LP' },
};
