import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  ParsedInstruction,
} from '@solana/web3.js';
import { Activity, TokenTransfer } from '../types';
import {
  JUPITER_PERP_VAULT_AUTHORITY,
  KNOWN_TOKENS,
  DEFAULT_RPC_ENDPOINT,
} from '../constants';

let connection: Connection | null = null;
let currentEndpoint: string = DEFAULT_RPC_ENDPOINT;

// Rate limiting - fetch fewer transactions to avoid 429 errors
const FETCH_LIMIT = 5;

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function getConnection(rpcEndpoint: string = DEFAULT_RPC_ENDPOINT): Connection {
  if (!connection || currentEndpoint !== rpcEndpoint) {
    currentEndpoint = rpcEndpoint;
    connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
  }
  return connection;
}

export function resetConnection(): void {
  connection = null;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

function isJupiterPerpTransaction(tx: ParsedTransactionWithMeta): boolean {
  // Check 1: Account keys in transaction message
  if (tx.transaction?.message?.accountKeys) {
    const found = tx.transaction.message.accountKeys.some(
      (key) => key.pubkey.toString() === JUPITER_PERP_VAULT_AUTHORITY
    );
    if (found) return true;
  }

  // Check 2: Loaded addresses from address lookup tables (versioned transactions)
  if (tx.meta?.loadedAddresses) {
    const writable = tx.meta.loadedAddresses.writable || [];
    const readonly = tx.meta.loadedAddresses.readonly || [];
    const allLoaded = [...writable, ...readonly];
    const found = allLoaded.some(
      (key) => key.toString() === JUPITER_PERP_VAULT_AUTHORITY
    );
    if (found) return true;
  }

  // Check 3: Token balance owners (transfers to/from vault authority)
  const preBalances = tx.meta?.preTokenBalances || [];
  const postBalances = tx.meta?.postTokenBalances || [];
  const allBalances = [...preBalances, ...postBalances];
  const foundInBalances = allBalances.some(
    (balance) => balance.owner === JUPITER_PERP_VAULT_AUTHORITY
  );
  if (foundInBalances) return true;

  // Check 4: Inner instructions (CPI calls)
  if (tx.meta?.innerInstructions) {
    for (const inner of tx.meta.innerInstructions) {
      for (const ix of inner.instructions) {
        const accounts = (ix as { accounts?: string[] }).accounts || [];
        if (accounts.some((acc) => acc === JUPITER_PERP_VAULT_AUTHORITY)) {
          return true;
        }
      }
    }
  }

  return false;
}

function parseTokenTransfers(
  tx: ParsedTransactionWithMeta,
  walletAddress: string
): TokenTransfer[] {
  const transfers: TokenTransfer[] = [];

  if (!tx.meta?.postTokenBalances || !tx.meta?.preTokenBalances) {
    return transfers;
  }

  const pre = tx.meta.preTokenBalances;
  const post = tx.meta.postTokenBalances;

  const balanceChanges = new Map<number, { pre: number; post: number; mint: string; decimals: number }>();

  for (const preBalance of pre) {
    if (preBalance.owner === walletAddress) {
      balanceChanges.set(preBalance.accountIndex, {
        pre: preBalance.uiTokenAmount.uiAmount || 0,
        post: 0,
        mint: preBalance.mint,
        decimals: preBalance.uiTokenAmount.decimals,
      });
    }
  }

  for (const postBalance of post) {
    if (postBalance.owner === walletAddress) {
      const existing = balanceChanges.get(postBalance.accountIndex);
      if (existing) {
        existing.post = postBalance.uiTokenAmount.uiAmount || 0;
      } else {
        balanceChanges.set(postBalance.accountIndex, {
          pre: 0,
          post: postBalance.uiTokenAmount.uiAmount || 0,
          mint: postBalance.mint,
          decimals: postBalance.uiTokenAmount.decimals,
        });
      }
    }
  }

  for (const [, change] of balanceChanges) {
    const diff = change.post - change.pre;
    if (Math.abs(diff) > 0.000001) {
      const tokenInfo = KNOWN_TOKENS[change.mint];
      transfers.push({
        mint: change.mint,
        amount: Math.abs(diff),
        decimals: change.decimals,
        symbol: tokenInfo?.symbol,
        direction: diff > 0 ? 'in' : 'out',
      });
    }
  }

  // Check for SOL transfers
  if (tx.meta?.preBalances && tx.meta?.postBalances) {
    const accountKeys = tx.transaction?.message?.accountKeys || [];
    const walletIndex = accountKeys.findIndex(
      (key) => key.pubkey.toString() === walletAddress
    );

    if (walletIndex !== -1) {
      const preSol = tx.meta.preBalances[walletIndex] / 1e9;
      const postSol = tx.meta.postBalances[walletIndex] / 1e9;
      const fee = (tx.meta.fee || 0) / 1e9;
      const diff = postSol - preSol + fee;

      if (Math.abs(diff) > 0.000001) {
        transfers.push({
          mint: 'So11111111111111111111111111111111111111112',
          amount: Math.abs(diff),
          decimals: 9,
          symbol: 'SOL',
          direction: diff > 0 ? 'in' : 'out',
        });
      }
    }
  }

  return transfers;
}

function determineActivityType(
  tx: ParsedTransactionWithMeta,
  isJupPerp: boolean
): Activity['type'] {
  if (isJupPerp) return 'jupiter_perp';

  const instructions = tx.transaction?.message?.instructions || [];

  const swapPrograms = [
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
    '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  ];

  for (const ix of instructions) {
    const programId = (ix as ParsedInstruction).programId?.toString();
    if (programId && swapPrograms.includes(programId)) {
      return 'swap';
    }
  }

  return 'transfer';
}

export async function fetchWalletActivities(
  walletAddress: string,
  walletLabel: string,
  rpcEndpoint: string = DEFAULT_RPC_ENDPOINT,
  existingSignatures: Set<string> = new Set()
): Promise<Activity[]> {
  const conn = getConnection(rpcEndpoint);
  const pubkey = new PublicKey(walletAddress);

  // Get signatures with rate limit protection
  let signatures;
  try {
    signatures = await conn.getSignaturesForAddress(pubkey, {
      limit: FETCH_LIMIT,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (error.message?.includes('429')) {
      console.log('Rate limited on getSignatures, waiting 5s...');
      await delay(5000);
      signatures = await conn.getSignaturesForAddress(pubkey, {
        limit: FETCH_LIMIT,
      });
    } else {
      throw err;
    }
  }

  const newSignatures = signatures.filter(
    (sig) => !existingSignatures.has(sig.signature)
  );

  if (newSignatures.length === 0) {
    return [];
  }

  const activities: Activity[] = [];

  // Fetch transactions ONE AT A TIME with delays to avoid rate limiting
  for (const sigInfo of newSignatures) {
    try {
      // Add delay between requests
      await delay(500);

      const tx = await conn.getParsedTransaction(sigInfo.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) continue;

      const isJupPerp = isJupiterPerpTransaction(tx);
      const transfers = parseTokenTransfers(tx, walletAddress);
      const type = determineActivityType(tx, isJupPerp);

      activities.push({
        id: `${sigInfo.signature}-${walletAddress}`,
        signature: sigInfo.signature,
        walletAddress,
        walletLabel,
        timestamp: (sigInfo.blockTime || 0) * 1000,
        type,
        transfers,
        isJupiterPerp: isJupPerp,
        fee: (tx.meta?.fee || 0) / 1e9,
        success: tx.meta?.err === null,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error.message?.includes('429')) {
        console.log('Rate limited, waiting 3s before retry...');
        await delay(3000);
        // Skip this transaction, will get it next poll
        continue;
      }
      console.error(`Error fetching tx ${sigInfo.signature}:`, err);
    }
  }

  return activities;
}
