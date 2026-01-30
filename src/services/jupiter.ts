import { JupiterPosition } from '../types';

const JUPITER_PERPS_API = 'https://perps-api.jup.ag/v1';

interface JupiterApiPosition {
  positionPubkey: string;
  owner: string;
  pool: string;
  custody: string;
  collateralCustody: string;
  createdTime: number;
  updatedTime: number;
  side: 'long' | 'short';
  asset: string;
  assetMint: string;
  collateralToken: string;
  collateralMint: string;
  leverage: number;
  // USD values (raw, need scaling)
  sizeUsd: number;
  collateralUsd: number;
  valueUsd: number;
  entryPriceUsd: number;
  markPriceUsd: number;
  liquidationPriceUsd: number;
  // PnL fields
  pnlBeforeFeesUsd: number;
  pnlBeforeFeesPct: number;
  pnlAfterFeesUsd: number;
  pnlAfterFeesPct: number;
  // Fees
  openFeesUsd: number;
  closeFeesUsd: number;
  borrowFeesUsd: number;
  totalFeesUsd: number;
}

interface JupiterApiResponse {
  dataList: JupiterApiPosition[];
  count: number;
}

export async function fetchJupiterPositions(
  walletAddress: string
): Promise<JupiterPosition[]> {
  try {
    const response = await fetch(
      `${JUPITER_PERPS_API}/positions?walletAddress=${walletAddress}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: JupiterApiResponse = await response.json();

    if (!data.dataList || data.dataList.length === 0) {
      return [];
    }

    // Only collateralUsd and sizeUsd are in micro-USD (10^6)
    // Other USD fields (pnlAfterFeesUsd, prices) are already in USD as strings
    const USD_SCALE = 1_000_000;

    return data.dataList.map((position) => {
      const pos = position as unknown as Record<string, unknown>;
      // size field is already in USD (e.g., "154702.89")
      const sizeUsd = Number(pos.size || 0);
      // collateralUsd is in micro-USD, needs scaling
      const collateralUsd = Number(pos.collateralUsd || 0) / USD_SCALE;

      // pnlAfterFeesUsd is already in USD (e.g., "-3048.87")
      const pnlUsd = Number(pos.pnlAfterFeesUsd || 0);

      // pnlChangePctAfterFees is the percentage (e.g., "-23.47")
      const pnlPercent = Number(pos.pnlChangePctAfterFees || 0);

      // Prices are already in USD as strings (e.g., "126.27")
      const entryPrice = Number(pos.entryPrice || 0);
      const markPrice = Number(pos.markPrice || 0);
      const liquidationPrice = Number(pos.liquidationPrice || 0);

      // Get market/token from marketMint or derive from position
      const marketMint = String(pos.marketMint || '');
      let token = 'Unknown';
      if (marketMint.includes('So1111111111111111111111111111111')) {
        token = 'SOL';
      } else if (pos.asset) {
        token = String(pos.asset);
      }

      return {
        positionPubkey: String(pos.positionPubkey || ''),
        owner: String(pos.owner || ''),
        pool: String(pos.pool || ''),
        custody: String(pos.custody || ''),
        collateralCustody: String(pos.collateralCustody || ''),
        side: (pos.side as 'long' | 'short') || 'long',
        sizeUsd,
        collateralUsd,
        entryPrice,
        markPrice,
        pnlUsd,
        pnlPercent,
        leverage: Number(pos.leverage || 0),
        liquidationPrice,
        token,
        collateralToken: String(pos.collateralToken || 'USDC'),
        updatedAt: Number(pos.updatedTime || pos.updateTime || 0) * 1000,
      };
    }).filter(pos => {
      // Only include SOL positions
      const symbol = getTokenSymbol(pos.token).toUpperCase();
      return symbol === 'SOL';
    });
  } catch (error) {
    console.error('Error fetching Jupiter positions:', error);
    throw error;
  }
}

// Token symbol mapping for common Jupiter Perps tokens
export const PERP_TOKEN_SYMBOLS: Record<string, string> = {
  SOL: 'SOL',
  BTC: 'BTC',
  ETH: 'ETH',
  wSOL: 'SOL',
  WBTC: 'BTC',
  WETH: 'ETH',
};

export function getTokenSymbol(token: string): string {
  return PERP_TOKEN_SYMBOLS[token] || token;
}
