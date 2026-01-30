export function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">CT</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">CopyTrader</h1>
          <p className="text-sm text-gray-400">Solana Wallet Monitor</p>
        </div>
      </div>
    </header>
  );
}
