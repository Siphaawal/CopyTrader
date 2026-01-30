import { useState, useCallback } from 'react';
import { JupiterPosition, WalletPositions } from '../types';
import { fetchJupiterPositions } from '../services/jupiter';

export function usePositions() {
  const [positions, setPositions] = useState<Map<string, WalletPositions>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchPositionsForWallet = useCallback(
    async (walletAddress: string): Promise<JupiterPosition[]> => {
      setIsLoading(true);
      try {
        const walletPositions = await fetchJupiterPositions(walletAddress);
        setPositions((prev) => {
          const newMap = new Map(prev);
          newMap.set(walletAddress, {
            walletAddress,
            positions: walletPositions,
            lastFetched: Date.now(),
          });
          return newMap;
        });
        return walletPositions;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch positions';
        setPositions((prev) => {
          const newMap = new Map(prev);
          newMap.set(walletAddress, {
            walletAddress,
            positions: [],
            lastFetched: Date.now(),
            error: errorMessage,
          });
          return newMap;
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchAllPositions = useCallback(
    async (walletAddresses: string[]) => {
      setIsLoading(true);
      const results: Map<string, WalletPositions> = new Map();

      for (const address of walletAddresses) {
        try {
          const walletPositions = await fetchJupiterPositions(address);
          results.set(address, {
            walletAddress: address,
            positions: walletPositions,
            lastFetched: Date.now(),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch';
          results.set(address, {
            walletAddress: address,
            positions: [],
            lastFetched: Date.now(),
            error: errorMessage,
          });
        }
        // Small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setPositions(results);
      setIsLoading(false);
    },
    []
  );

  const getPositionsForWallet = useCallback(
    (walletAddress: string): WalletPositions | undefined => {
      return positions.get(walletAddress);
    },
    [positions]
  );

  const clearPositions = useCallback(() => {
    setPositions(new Map());
  }, []);

  return {
    positions,
    isLoading,
    fetchPositionsForWallet,
    fetchAllPositions,
    getPositionsForWallet,
    clearPositions,
  };
}
