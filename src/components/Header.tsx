export function Header() {
  return (
    <header className="glass border-b border-purple-500/20 px-6 py-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 animate-pulse" />

      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer opacity-30" />

      <div className="relative flex items-center gap-4">
        {/* Animated logo */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 glow-purple">
            <span className="text-white font-bold text-2xl tracking-tight">CT</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold gradient-text tracking-tight">
            CopyTrader
          </h1>
          <p className="text-sm text-purple-300/70 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full status-pulse" />
            Solana Wallet Monitor
          </p>
        </div>

        {/* Decorative elements */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full status-pulse" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
