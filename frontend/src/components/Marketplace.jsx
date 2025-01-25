import React, { useState, useEffect } from "react";
import Card from "./CardMarketPlace";

function Marketplace() {
  const [cards, setCards] = useState([]); // État pour stocker les images
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const [loading, setLoading] = useState(true); // État de chargement

  useEffect(() => {
    const fetchMarketplaceImages = async () => {
      try {
        const response = await fetch("http://localhost:3300/api/marketplace", {
          credentials: "include", // Inclure les cookies pour la session utilisateur
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des données : ${response.statusText}`
          );
        }

        const data = await response.json();
        setCards(data); // Met à jour les cartes avec les données récupérées
      } catch (err) {
        setError(err.message); // Capture et stocke les erreurs
      }
    };

    // Définir un délai minimum de chargement (500ms)
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

    // Attendre les données et le délai minimum
    Promise.all([fetchMarketplaceImages(), delayPromise]).finally(() => {
      setLoading(false); // Arrête le chargement après les deux promesses
    });
  }, []); // Dépendances vides : s'exécute uniquement au montage

  // Gestion des états : chargement, erreur ou données
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
            Chargement des images de la marketplace...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-center">
          Une erreur est survenue : {error}
        </p>
      </main>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
        Marketplace
      </h2>

      {/* Affichage des cartes ou un message si aucune image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
        {cards.length > 0 ? (
          cards.map((card) => (
            <Card
              key={card.id} // ID unique de l'image
              imageUrl={card.image_url} // URL de l'image
              price={card.price || "Gratuit"} // Affiche le prix ou "Gratuit"
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Aucune image disponible dans la marketplace.
          </p>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
