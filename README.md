# CopyTrader

A real-time Solana wallet monitor focused on Jupiter Perpetuals trading activity. Track multiple wallets, view their open positions, and monitor trading activity.

## Features

- **Wallet Tracking**: Monitor multiple Solana wallet addresses simultaneously
- **Jupiter Perps Detection**: Automatically identifies Jupiter Perpetuals transactions via vault authority detection
- **Position Analytics**: View open SOL perpetual positions with detailed metrics:
  - Position size, leverage, and collateral
  - Entry price, mark price, and liquidation price
  - PnL (profit/loss) in USD and percentage
  - Long/Short breakdown with visual indicators
- **Activity Feed**: Real-time transaction monitoring with filtering by wallet or transaction type
- **Auto-Polling**: Configurable automatic scanning interval (10-300 seconds)
- **Data Persistence**: Wallets, settings, and activities persist in localStorage
- **Export/Import**: Backup and restore your tracked wallets as JSON

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js
- **APIs**: Jupiter Perps API (perps-api.jup.ag)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Siphaawal/CopyTrader.git
cd CopyTrader

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Adding Wallets

1. Enter a Solana wallet address in the input field
2. Optionally add a label for easy identification
3. Click "Add Wallet"

### Monitoring Activity

1. Go to the **Activity Feed** tab
2. Click "Scan Now" for manual refresh, or enable "Auto: ON" for automatic polling
3. Use the filters to view specific transaction types (Jupiter Perp, Swaps, Transfers)

### Viewing Positions

1. Go to the **Positions** tab
2. Click "Fetch Positions" to load open perpetual positions
3. View analytics including:
   - Total positions and exposure
   - Long vs Short breakdown
   - Individual position details with liquidation prices

### Settings

- **Poll Interval**: Adjust automatic scanning frequency (10-300 seconds)
- **RPC Endpoint**: Configure a custom Solana RPC endpoint
- **Clear Activity History**: Remove all stored transaction history
- **Clear All Data & Reset**: Factory reset the application

## Project Structure

```
src/
├── components/          # React components
│   ├── ActivityFeed.tsx    # Transaction feed with filters
│   ├── ActivityItem.tsx    # Individual transaction display
│   ├── Header.tsx          # App header
│   ├── PositionsTab.tsx    # Position analytics dashboard
│   ├── SettingsPanel.tsx   # Settings configuration
│   ├── TabNavigation.tsx   # Tab navigation
│   └── WalletManager.tsx   # Wallet CRUD operations
├── hooks/               # Custom React hooks
│   ├── useActivities.ts    # Activity fetching & storage
│   ├── usePolling.ts       # Auto-polling logic
│   ├── usePositions.ts     # Jupiter positions fetching
│   ├── useSettings.ts      # Settings management
│   └── useWallets.ts       # Wallet management
├── services/            # External service integrations
│   ├── jupiter.ts          # Jupiter Perps API client
│   ├── solana.ts           # Solana RPC interactions
│   └── storage.ts          # localStorage wrapper
├── constants/           # App constants
│   └── index.ts            # RPC endpoints, token mappings
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main application component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Key Technical Details

### Jupiter Perps Detection

The app detects Jupiter Perpetuals transactions by checking for the vault authority address:
```
AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49
```

Detection checks multiple locations:
1. Transaction account keys
2. Address lookup table loaded addresses
3. Token balance owners
4. Inner instruction accounts (CPI calls)

### API Field Mapping

Jupiter Perps API returns fields with different scaling:
- `size`: Already in USD (use directly)
- `collateralUsd`: In micro-USD (divide by 1,000,000)
- `pnlAfterFeesUsd`: Already in USD
- `entryPrice`, `markPrice`, `liquidationPrice`: Already in USD

### Rate Limiting

The app implements rate limiting protection:
- 500ms delay between RPC requests
- Automatic retry on 429 errors
- Fetch limit of 5 transactions per wallet per poll

## Configuration

### RPC Endpoints

Default endpoint: `https://rpc.ankr.com/solana`

For better performance, consider using a dedicated RPC provider:
- [Helius](https://helius.dev) - Free tier available
- [QuickNode](https://quicknode.com) - Free tier available
- [Alchemy](https://alchemy.com) - Free tier available

### Storage

Data is stored in localStorage with the following keys:
- `copytrader_wallets`: Tracked wallet addresses
- `copytrader_settings`: User settings
- `copytrader_activities`: Transaction history (limited to 500 entries)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This tool is for informational purposes only. It is not financial advice. Always do your own research before making trading decisions. The developers are not responsible for any losses incurred from using this tool.
