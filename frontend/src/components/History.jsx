import React, { useState, useEffect } from "react";
import SoldCardsTable from "./SoldCardsTable";

function History() {
  // État pour stocker les cartes vendues
  const [soldCards, setSoldCards] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État des erreurs

  // Appel API pour récupérer l'historique des ventes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError(null); // Réinitialiser les erreurs

        const response = await fetch(`http://${API_URL}:8090/api/history`, {
          method: "GET",
          credentials: "include", // Nécessaire pour inclure les cookies de session
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status} : ${response.statusText}`);
        }

        const data = await response.json(); // Récupérer les données de l'API
        setSoldCards(data); // Stocker les cartes vendues
      } catch (err) {
        setError(err.message); // Gérer les erreurs
      }
    };

    // Définir un délai minimum de chargement (500ms)
    //const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

    // Attendre les données et le délai minimum
    Promise.all([fetchHistory()]).finally(() => {
      setLoading(false); // Fin du chargement
    });
  }, []); // Appel uniquement au montage du composant

  // Gestion des états : chargement, erreur ou affichage des données
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <svg
            className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            fetching history...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 dark:text-red-400">
          An error occurred
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {soldCards.length > 0 ? (
        <SoldCardsTable soldCards={soldCards} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {/* Aucun historique de vente disponible. */}
        </p>
      )}
    </main>
  );
}

export default History;
