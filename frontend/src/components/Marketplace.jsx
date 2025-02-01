import React, { useState, useEffect } from "react";
import Card from "./CardMarketPlace";
import { Toast } from "flowbite-react";
import { HiCheck, HiExclamation } from "react-icons/hi";

function Marketplace() {
  const [cards, setCards] = useState([]); // State to store images
  const [error, setError] = useState(null); // State to handle errors from fetching data
  const [loading, setLoading] = useState(true); // Loading state
  const [showToast, setShowToast] = useState(false); // State to show/hide the toast
  const [toastMessage, setToastMessage] = useState(""); // Message for the toast
  const [toastType, setToastType] = useState("success"); // "success" or "error"

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchMarketplaceImages = async () => {
    setLoading(true); // Show the spinner during refresh
    try {
      setError(null); // Reset errors before fetching
      const response = await fetch(`${API_URL}:80/api/marketplace`, {
        credentials: "include", // Include cookies for the user session
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des données : ${response.statusText}`
        );
      }

      const data = await response.json();
      setCards(data); // Update cards with the fetched data
    } catch (err) {
      setError(err.message); // Capture and store errors
    } finally {
      setLoading(false); // Stop loading after fetch
    }
  };

  useEffect(() => {
    fetchMarketplaceImages(); // Fetch data on mount
  }, []); // Empty dependencies: runs only on mount

  // Updated handleShowToast now accepts a type parameter
  const handleShowToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000); // Toast disappears after 5 seconds
  };

  // Handling loading state
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
        {/* Refresh button (commented out) */}
      </main>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Marketplace
        </h2>
        {/* Refresh Button */}
        <button
          onClick={fetchMarketplaceImages}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        >
          Refresh
        </button>
      </div>

      {/* Display cards or a message if there are no images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
        {cards.length > 0 ? (
          cards.map((card) => (
            <Card
              key={card.id} // Unique ID for the image
              imageUrl={card.image_url} // Image URL
              price={card.price || "0"} // Show the price or "0" if not set
              imageId={card.id} // Pass the image ID here
              onBuySuccess={(price) => {
                handleShowToast(`Achat réussi pour $${price} !`, "success");
                fetchMarketplaceImages(); // Refresh after purchase
              }}
              onBuyFailure={(message) => {
                handleShowToast(message, "error");
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
            {toastType === "error" ? (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiExclamation className="h-5 w-5" />
              </div>
            ) : (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheck className="h-5 w-5" />
              </div>
            )}
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
          </Toast>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
