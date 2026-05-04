import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.78 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1450 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155 },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', rate: 0.000015 },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('Equity Citadel Associates_currency');
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem('Equity Citadel Associates_currency', currency.code);
  }, [currency]);

  const formatPrice = (priceInUsd) => {
    const converted = priceInUsd * currency.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code === 'BTC' ? 'USD' : currency.code, // BTC format helper
      minimumFractionDigits: currency.code === 'BTC' ? 8 : 2,
      maximumFractionDigits: currency.code === 'BTC' ? 8 : 2,
    }).format(converted).replace('USD', '₿');
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
