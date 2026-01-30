import { useState, useCallback, useEffect, useRef } from 'react';
import { Wallet } from '../types';
import { storage } from '../services/storage';
import { isValidSolanaAddress } from '../services/solana';

export function useWallets() {
  // Initialize directly from storage to avoid race condition
  const [wallets, setWallets] = useState<Wallet[]>(() => storage.getWallets());
  const [error, setError] = useState<string | null>(null);
  // Track if user has made changes (not just initial load)
  const hasUserChanges = useRef(false);

  // Save wallets to storage only when user makes changes
  useEffect(() => {
    if (hasUserChanges.current) {
      storage.saveWallets(wallets);
    }
  }, [wallets]);

  const addWallet = useCallback((address: string, label?: string) => {
    setError(null);

    // Validate address
    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana address');
      return false;
    }

    // Check for duplicates
    if (wallets.some((w) => w.address === address)) {
      setError('Wallet already exists');
      return false;
    }

    const newWallet: Wallet = {
      address,
      label: label || `Wallet ${wallets.length + 1}`,
      addedAt: Date.now(),
    };

    hasUserChanges.current = true;
    setWallets((prev) => [...prev, newWallet]);
    return true;
  }, [wallets]);

  const removeWallet = useCallback((address: string) => {
    hasUserChanges.current = true;
    setWallets((prev) => prev.filter((w) => w.address !== address));
  }, []);

  const updateWalletLabel = useCallback((address: string, label: string) => {
    hasUserChanges.current = true;
    setWallets((prev) =>
      prev.map((w) => (w.address === address ? { ...w, label } : w))
    );
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportWallets = useCallback(() => {
    const data = JSON.stringify(wallets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copytrader-wallets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [wallets]);

  const importWallets = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Wallet[];
        if (!Array.isArray(imported)) {
          setError('Invalid file format: expected an array of wallets');
          return;
        }
        // Validate and merge wallets
        let addedCount = 0;
        for (const wallet of imported) {
          if (wallet.address && typeof wallet.address === 'string') {
            if (!wallets.some((w) => w.address === wallet.address)) {
              if (isValidSolanaAddress(wallet.address)) {
                addedCount++;
              }
            }
          }
        }
        if (addedCount > 0) {
          hasUserChanges.current = true;
          setWallets((prev) => {
            const existingAddresses = new Set(prev.map((w) => w.address));
            const newWallets = imported.filter(
              (w) => w.address &&
                     typeof w.address === 'string' &&
                     !existingAddresses.has(w.address) &&
                     isValidSolanaAddress(w.address)
            ).map((w) => ({
              address: w.address,
              label: w.label || `Imported Wallet`,
              addedAt: w.addedAt || Date.now(),
            }));
            return [...prev, ...newWallets];
          });
        }
        setError(addedCount > 0 ? null : 'No new valid wallets found in file');
      } catch {
        setError('Failed to parse wallet file');
      }
    };
    reader.readAsText(file);
  }, [wallets]);

  return {
    wallets,
    addWallet,
    removeWallet,
    updateWalletLabel,
    error,
    clearError,
    exportWallets,
    importWallets,
  };
}
