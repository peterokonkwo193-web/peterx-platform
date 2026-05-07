import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  // North America
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.37 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 16.8 },
  { code: 'BBD', symbol: '$', name: 'Barbadian Dollar', rate: 2.02 },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar', rate: 2.02 },
  { code: 'BMD', symbol: '$', name: 'Bermudian Dollar', rate: 1.00 },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', rate: 512 },
  { code: 'CUP', symbol: '$', name: 'Cuban Peso', rate: 24.0 },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', rate: 59.2 },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', rate: 7.78 },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', rate: 24.7 },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', rate: 156 },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', rate: 36.8 },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', rate: 1.00 },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar', rate: 6.78 },

  // South America
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.12 },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', rate: 882 },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', rate: 924 },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', rate: 3890 },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rate: 3.73 },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', rate: 38.5 },
  { code: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano', rate: 6.91 },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani', rate: 7420 },
  { code: 'GYD', symbol: '$', name: 'Guyanese Dollar', rate: 211 },
  { code: 'SRD', symbol: '$', name: 'Surinamese Dollar', rate: 35.8 },
  { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar', rate: 36.4 },

  // Europe
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.91 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 10.8 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 10.7 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rate: 6.88 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 3.96 },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rate: 360 },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rate: 23.1 },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', rate: 4.58 },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', rate: 1.80 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 32.2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 91.5 },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Krona', rate: 139 },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek', rate: 93.4 },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram', rate: 388 },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', rate: 1.70 },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark', rate: 1.80 },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble', rate: 3.26 },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari', rate: 2.70 },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu', rate: 17.7 },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', rate: 56.6 },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar', rate: 107 },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', rate: 39.5 },

  // Asia
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.23 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.82 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1365 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 16000 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rate: 36.7 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.74 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rate: 57.1 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rate: 25400 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', rate: 32.3 },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 278 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 110 },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rate: 300 },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', rate: 440 },
  { code: 'UZS', symbol: 'лв', name: 'Uzbekistani Som', rate: 12600 },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', rate: 72.1 },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', rate: 1.35 },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', rate: 4070 },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip', rate: 21300 },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', rate: 2100 },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tögrög', rate: 3380 },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', rate: 15.4 },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee', rate: 133 },

  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 3.75 },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rate: 3.71 },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Rial', rate: 3.64 },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', rate: 0.31 },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', rate: 0.377 },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', rate: 0.38 },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', rate: 0.71 },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 47.4 },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', rate: 1310 },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', rate: 42000 },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', rate: 89500 },
  { code: 'SYP', symbol: '£S', name: 'Syrian Pound', rate: 13000 },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', rate: 250 },

  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.4 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1450 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 131 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 14.2 },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rate: 10.1 },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar', rate: 134 },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', rate: 3.12 },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rate: 3780 },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', rate: 57.2 },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', rate: 46.2 },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', rate: 835 },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula', rate: 13.6 },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc', rate: 2780 },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', rate: 178 },
  { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa', rate: 15.0 },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi', rate: 68.0 },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', rate: 8600 },
  { code: 'LSL', symbol: 'L', name: 'Lesotho Loti', rate: 18.4 },
  { code: 'LYD', symbol: 'LD', name: 'Libyan Dinar', rate: 4.84 },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', rate: 1730 },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', rate: 63.8 },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', rate: 18.4 },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', rate: 1290 },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee', rate: 13.5 },
  { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone', rate: 22500 },
  { code: 'SOS', symbol: 'Sh.So.', name: 'Somali Shilling', rate: 570 },
  { code: 'SSP', symbol: '£', name: 'South Sudanese Pound', rate: 130 },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2590 },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', rate: 26.8 },

  // Oceania
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.51 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.66 },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar', rate: 2.25 },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina', rate: 3.84 },
  { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar', rate: 8.48 },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga', rate: 2.36 },
  { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu', rate: 120 },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tālā', rate: 2.76 },

  // Crypto
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', rate: 0.000015 },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', rate: 0.00032 },
  { code: 'USDT', symbol: '₮', name: 'Tether', rate: 1 },
  { code: 'BNB', symbol: 'BNB', name: 'Binance Coin', rate: 0.0017 },
  { code: 'SOL', symbol: 'SOL', name: 'Solana', rate: 0.0068 },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('equity_citadel_currency');
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem('equity_citadel_currency', currency.code);
  }, [currency]);

  const formatPrice = (priceInUsd) => {
    const converted = priceInUsd * currency.rate;
    
    // Handle very small numbers (like BTC rates)
    const isCrypto = currency.code === 'BTC' || currency.code === 'ETH' || currency.code === 'BNB' || currency.code === 'SOL';
    const minDigits = isCrypto ? 8 : 2;
    const maxDigits = isCrypto ? 8 : 2;

    // Standard currencies
    if (!isCrypto && ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD'].includes(currency.code)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(converted);
    }

    // Others or crypto: format as decimal and add symbol manually
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(converted);

    return `${currency.symbol}${formatted}`;
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
