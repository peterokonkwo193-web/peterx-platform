import { useState, useEffect, useRef } from 'react';
import { getMarketData } from '../lib/prices';

export const useMarketData = (realInterval = 60000) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseMarketDataRef = useRef([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const data = await getMarketData();
        if (mounted) {
          setMarketData(data || []);
          baseMarketDataRef.current = data || [];
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, realInterval);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [realInterval]);

  // High-frequency "Ticking" simulation (1s)
  useEffect(() => {
    if (marketData.length === 0) return;

    const tickTimer = setInterval(() => {
      setMarketData(prevData => {
        if (!prevData || prevData.length === 0) return prevData;
        
        return prevData.map(coin => {
          const fluctuation = 1 + (Math.random() * 0.0002 - 0.0001);
          return {
            ...coin,
            current_price: coin.current_price * fluctuation
          };
        });
      });
    }, 1000);

    return () => clearInterval(tickTimer);
  }, [loading]);

  return { marketData, loading, error };
};
