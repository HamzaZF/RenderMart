import React, { createContext, useContext, useState } from "react";

// Crée le contexte
const WalletContext = createContext();

// Fournisseur du contexte
export const WalletProvider = ({ children }) => {
  const [walletCards, setWalletCards] = useState(null); // Stocke les cartes
  const [loading, setLoading] = useState(false); // Indique si les données sont en cours de chargement
  const [error, setError] = useState(null); // Indique les erreurs

  // Fonction pour récupérer les données (appelée une seule fois)
  const fetchWalletImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3300/api/wallet", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des données : ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Les données récupérées ne sont pas valides.");
      }

      setWalletCards(data); // Met à jour les cartes
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

// Hook pour utiliser le contexte
export const useWallet = () => useContext(WalletContext);
