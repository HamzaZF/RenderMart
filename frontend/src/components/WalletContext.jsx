import React, { createContext, useContext, useState } from "react";

// Create the context
const WalletContext = createContext();

// Wallet context provider
export const WalletProvider = ({ children }) => {
  const [walletCards, setWalletCards] = useState(null); // Stores the wallet cards
  const [loading, setLoading] = useState(false); // Indicates whether data is currently loading
  const [error, setError] = useState(null); // Indicates errors

  const API_URL = import.meta.env.VITE_API_URL;

  // Function to fetch data (called once)
  const fetchWalletImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}:80/api/wallet`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching data: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("The fetched data is not valid.");
      }

      setWalletCards(data); // Update the wallet cards
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{ walletCards, loading, error, fetchWalletImages }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use the wallet context
export const useWallet = () => useContext(WalletContext);
