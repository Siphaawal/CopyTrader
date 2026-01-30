import { useState, useRef } from 'react';
import { Wallet } from '../types';

interface WalletManagerProps {
  wallets: Wallet[];
  onAddWallet: (address: string, label?: string) => boolean;
  onRemoveWallet: (address: string) => void;
  onUpdateLabel: (address: string, label: string) => void;
  error: string | null;
  onClearError: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function WalletManager({
  wallets,
  onAddWallet,
  onRemoveWallet,
  onUpdateLabel,
  error,
  onClearError,
  onExport,
  onImport,
}: WalletManagerProps) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      const success = onAddWallet(address.trim(), label.trim() || undefined);
      if (success) {
        setAddress('');
        setLabel('');
      }
    }
  };

  const handleStartEdit = (wallet: Wallet) => {
    setEditingWallet(wallet.address);
    setEditLabel(wallet.label);
  };

  const handleSaveEdit = (address: string) => {
    onUpdateLabel(address, editLabel);
    setEditingWallet(null);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Tracked Wallets</h2>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            disabled={wallets.length === 0}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded transition-colors flex items-center gap-1"
            title="Export wallets to JSON"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center gap-1"
            title="Import wallets from JSON"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onClearError();
          }}
          placeholder="Enter Solana wallet address..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          Add Wallet
        </button>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </form>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {wallets.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No wallets added yet</p>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.address}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                {editingWallet === wallet.address ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(wallet.address);
                        if (e.key === 'Escape') setEditingWallet(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(wallet.address)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      className="font-medium text-white truncate cursor-pointer hover:text-purple-400"
                      onClick={() => handleStartEdit(wallet)}
                      title="Click to edit label"
                    >
                      {wallet.label}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      {truncateAddress(wallet.address)}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <a
                  href={`https://solscan.io/account/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  title="View on Solscan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => onRemoveWallet(wallet.address)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove wallet"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
