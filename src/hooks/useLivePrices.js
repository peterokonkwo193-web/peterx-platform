import { useState, useEffect, useRef } from 'react';
import { getLivePrices } from '../lib/prices';

/**
 * useLivePrices Hook
 * Fetches real market data every 30s but simulates live ticking every 1s
 * for a high-frequency trading feel without hitting API rate limits.
 */
export const useLivePrices = (realUpdateInterval = 30000) => {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const basePricesRef = useRef(null);

  // Fetch real data from API
  useEffect(() => {
    const fetchRealPrices = async () => {
      const data = await getLivePrices();
      if (data) {
        basePricesRef.current = data;
        setPrices(data);
      }
      setLoading(false);
    };

    fetchRealPrices();
    const realTimer = setInterval(fetchRealPrices, realUpdateInterval);
    return () => clearInterval(realTimer);
  }, [realUpdateInterval]);

  // High-frequency "Ticking" simulation (1s)
  useEffect(() => {
    if (!prices) return;

    const tickTimer = setInterval(() => {
      if (!basePricesRef.current) return;

      setPrices(prevPrices => {
        if (!prevPrices) return prevPrices;
        
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach(id => {
          const coin = { ...newPrices[id] };
          // Add a tiny random fluctuation (0.01% - 0.05%)
          const fluctuation = 1 + (Math.random() * 0.0004 - 0.0002);
          coin.usd = coin.usd * fluctuation;
          newPrices[id] = coin;
        });
        return newPrices;
      });
    }, 1000);

    return () => clearInterval(tickTimer);
  }, [prices !== null]);

  return { prices, loading };
};
