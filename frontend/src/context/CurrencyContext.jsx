import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  SGD: 'S$',
  AED: 'AED'
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [symbol, setSymbol] = useState(user?.currencySymbol || '₹');

  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
      setSymbol(SYMBOLS[user.currency] || user.currencySymbol || '₹');
    }
  }, [user]);

  const changeCurrency = (code) => {
    setCurrency(code);
    setSymbol(SYMBOLS[code] || '$');
  };

  const formatCurrency = (amount = 0) => {
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, changeCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
