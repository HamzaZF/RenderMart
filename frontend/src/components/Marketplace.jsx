import React, { useState, useEffect } from "react";
import Card from "./CardMarketPlace";
import { Toast } from "flowbite-react";
import { HiCheck } from "react-icons/hi";

function Marketplace() {
  const [cards, setCards] = useState([]); // État pour stocker les images
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const [loading, setLoading] = useState(true); // État de chargement
  const [showToast, setShowToast] = useState(false); // État pour afficher/cacher le toast
  const [toastMessage, setToastMessage] = useState(""); // Message pour le toast

  const fetchMarketplaceImages = async () => {
    setLoading(true); // Montre le spinner lors du rafraîchissement
    try {
      setError(null); // Réinitialise les erreurs avant le fetch
      const response = await fetch(`http://${API_URL}:8090/api/marketplace`, {
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
    } finally {
      setLoading(false); // Arrête le chargement après le fetch
    }
  };

  useEffect(() => {
    fetchMarketplaceImages(); // Récupère les données au montage
  }, []); // Dépendances vides : s'exécute uniquement au montage

  const handleShowToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000); // Le toast disparaît après 5 secondes
  };

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
            fetching images from the marketplace...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-center">
          An error occurred
        </p>
        {/* //Bouton de rafraîchissement dans la vue d'erreur
        <button
          onClick={fetchMarketplaceImages}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        >
          Refresh
        </button> */}
      </main>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Marketplace
        </h2>
        {/* Bouton Rafraîchir */}
        <button
          onClick={fetchMarketplaceImages}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        >
          Refresh
        </button>
      </div>

      {/* Affichage des cartes ou un message si aucune image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
        {cards.length > 0 ? (
          cards.map((card) => (
            <Card
              key={card.id} // ID unique de l'image
              imageUrl={card.image_url} // URL de l'image
              price={card.price || "0"} // Affiche le prix ou "Gratuit"
              imageId={card.id} // Ajoutez l'ID ici
              onBuySuccess={(price) => {
                handleShowToast(`Achat réussi pour $${price} !`);
                fetchMarketplaceImages(); // Rafraîchir après l'achat
              }}
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {/* Aucune image disponible dans la marketplace. */}
          </p>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
          </Toast>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
