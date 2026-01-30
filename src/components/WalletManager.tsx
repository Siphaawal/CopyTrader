import { useState, useRef } from 'react';
import { Wallet } from '../types';
import { sounds, initAudio } from '../services/sounds';

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
      initAudio();
      sounds.success();
      onImport(file);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initAudio();
    if (address.trim()) {
      const success = onAddWallet(address.trim(), label.trim() || undefined);
      if (success) {
        sounds.success();
        setAddress('');
        setLabel('');
      } else {
        sounds.error();
      }
    }
  };

  const handleStartEdit = (wallet: Wallet) => {
    initAudio();
    sounds.click();
    setEditingWallet(wallet.address);
    setEditLabel(wallet.label);
  };

  const handleSaveEdit = (address: string) => {
    initAudio();
    sounds.success();
    onUpdateLabel(address, editLabel);
    setEditingWallet(null);
  };

  const handleRemove = (address: string) => {
    initAudio();
    sounds.click();
    onRemoveWallet(address);
  };

  const handleExport = () => {
    initAudio();
    sounds.click();
    onExport();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold gradient-text flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Tracked Wallets
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={wallets.length === 0}
            className="btn-fancy px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg flex items-center gap-1.5 border border-gray-600/50"
            title="Export wallets to JSON"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            onClick={() => {
              initAudio();
              sounds.click();
              fileInputRef.current?.click();
            }}
            className="btn-fancy px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg flex items-center gap-1.5 border border-gray-600/50"
            title="Import wallets from JSON"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-5 space-y-3">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onClearError();
          }}
          placeholder="Enter Solana wallet address..."
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 text-sm transition-all duration-300 hover:border-purple-500/40"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 text-sm transition-all duration-300 hover:border-purple-500/40"
        />
        <button
          type="submit"
          className="btn-fancy w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold glow-purple"
        >
          Add Wallet
        </button>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </form>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500">No wallets added yet</p>
          </div>
        ) : (
          wallets.map((wallet, index) => (
            <div
              key={wallet.address}
              className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 card-hover fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-1 min-w-0">
                {editingWallet === wallet.address ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(wallet.address);
                        if (e.key === 'Escape') setEditingWallet(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(wallet.address)}
                      className="btn-fancy px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      className="font-semibold text-white truncate cursor-pointer hover:text-purple-400 transition-colors"
                      onClick={() => handleStartEdit(wallet)}
                      title="Click to edit label"
                    >
                      {wallet.label}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                      {truncateAddress(wallet.address)}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3">
                <a
                  href={`https://solscan.io/account/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  title="View on Solscan"
                  onClick={() => {
                    initAudio();
                    sounds.click();
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => handleRemove(wallet.address)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
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
