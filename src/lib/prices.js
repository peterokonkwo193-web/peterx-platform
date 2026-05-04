const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const getLivePrices = async (ids = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 'binancecoin', 'pi-network', 'dogecoin', 'pepe', 'tether']) => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!response.ok) throw new Error('Failed to fetch prices');
    return await response.json();
  } catch (error) {
    console.error('Error fetching live prices:', error);
    return null;
  }
};

export const getMarketData = async () => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
    );
    if (!response.ok) throw new Error('Failed to fetch market data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};
