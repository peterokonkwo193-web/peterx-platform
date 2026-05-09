export const STATIC_COINS = [
  { symbol: 'USD', name: 'US Dollar', type: 'fiat', image: 'https://cdn-icons-png.flaticon.com/512/197/197374.png', color: 'from-blue-500/20' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', color: 'from-orange-500/20' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: 'from-indigo-500/20' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', color: 'from-teal-500/20' },
  { symbol: 'USDT', name: 'Tether', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/325/small/tether.png', color: 'from-success/20' },
  { symbol: 'PI', name: 'Pi Network', type: 'crypto', image: 'https://minepi.com/wp-content/uploads/2021/11/logo-pi-600.png', color: 'from-primary/20' }
];

export const NETWORKS = {
  'USD': ['Bank Transfer (ACH)', 'Wire Transfer', 'Instant Card'],
  'BTC': ['Bitcoin (BTC)', 'Lightning Network', 'BNB Smart Chain (BEP20)', 'Ethereum (ERC20)'],
  'ETH': ['Ethereum (ERC20)', 'Arbitrum One', 'Optimism', 'Polygon', 'BNB Smart Chain (BEP20)', 'Base'],
  'SOL': ['Solana (SOL)', 'BNB Smart Chain (BEP20)'],
  'USDT': ['Tron (TRC20)', 'Ethereum (ERC20)', 'BNB Smart Chain (BEP20)', 'Polygon', 'Solana', 'Arbitrum One', 'Optimism', 'Avalanche C-Chain'],
  'USDC': ['Ethereum (ERC20)', 'Solana', 'Polygon', 'Arbitrum One', 'Optimism', 'Base', 'Tron (TRC20)', 'BNB Smart Chain (BEP20)'],
  'PI': ['Pi Network Mainnet', 'BNB Smart Chain (BEP20)']
};

export const VAULT_ADDRESSES = {
  'BTC': 'bc1qnymyqha2vczd6ecqu2s4zc6xxvjgnd67c2y2cz',
  'ETH': '0x3bA724Eaa5C65B2DFd559B0D5d723F6450e0A988',
  'USDT': {
    'TRC20': 'TGbCCgoimfcx3CX3Xqr1A8pdjCtssrzHTC',
    'ERC20': '0x3bA724Eaa5C65B2DFd559B0D5d723F6450e0A988',
    'BEP20': '0x3bA724Eaa5C65B2DFd559B0D5d723F6450e0A988'
  },
  'SOL': '0x3bA724Eaa5C65B2DFd559B0D5d723F6450e0A988',
  'PI': 'bc1qnymyqha2vczd6ecqu2s4zc6xxvjgnd67c2y2cz'
};

export const getNetworkForCoin = (symbol) => {
  if (NETWORKS[symbol]) return NETWORKS[symbol];
  return [
    `${symbol} Mainnet`, 
    'BNB Smart Chain (BEP20)', 
    'Ethereum (ERC20)',
    'Tron (TRC20)',
    'Polygon',
    'Solana',
    'Arbitrum One'
  ];
};
