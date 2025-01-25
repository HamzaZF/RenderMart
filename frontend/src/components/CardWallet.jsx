import React, { useState } from "react";
import ModalPriceCard from "./ModalPriceCard";

function CardWallet({ imageUrl, initialState, cardId, onList, onWithdraw, initialPrice }) {
  const [isListed, setIsListed] = useState(initialState); // État local pour le statut
  const [price, setPrice] = useState(initialPrice); // Prix de la carte
  const [isModalOpen, setIsModalOpen] = useState(false); // État du modal

  const handleList = async (enteredPrice) => {
    try {
      await onList(enteredPrice); // Appelle la fonction parent pour gérer l'API //onList(cardId, enteredPrice);
      setPrice(enteredPrice); // Enregistre le prix localement
      setIsListed(true); // Passe l'état à "listed"
    } catch (error) {
      console.error("Erreur lors de la mise en vente :", error);
    } finally {
      setIsModalOpen(false); // Ferme le modal
    }
  };

  const handleWithdraw = async () => {
    try {
      await onWithdraw(cardId); // Appelle la fonction parent pour gérer l'API
      setPrice(null); // Réinitialise le prix
      setIsListed(false); // Passe l'état à "withdrawn"
    } catch (error) {
      console.error("Erreur lors du retrait :", error);
    }
  };

  return (
    <main>
      <div
        className={`relative max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 transition duration-300 ${
          isListed ? "opacity-75 grayscale" : "opacity-100"
        }`}
      >
        <a href="#">
          <img className="rounded-t-lg" src={imageUrl} alt="Product" />
        </a>

        {/* Affichage du prix lorsque la carte est "en vente" */}
        {isListed && price && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded-lg">
            Listed for ${price}
          </div>
        )}

        <div className="p-5 flex flex-row items-center justify-between">
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              isListed
                ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200"
            }`}
          >
            {isListed ? "Listed" : "Withdrawn"}
          </span>

          <button
            onClick={() => {
              if (!isListed) setIsModalOpen(true); // Ouvre le modal si on veut lister
              else handleWithdraw(); // Retire la carte si elle est en vente
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-transform transform hover:scale-105"
          >
            {isListed ? "Withdraw" : "List"}
          </button>
        </div>
      </div>

      {/* Modal pour entrer le prix */}
      {isModalOpen && (
        <ModalPriceCard
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleList}
        />
      )}
    </main>
  );
}

export default CardWallet;
