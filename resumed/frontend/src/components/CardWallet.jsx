import React, { useState } from "react";
import ModalPriceCard from "./ModalPriceCard";

function CardWallet({ imageUrl, initialState, cardId, onList, onWithdraw, initialPrice }) {
  const [isListed, setIsListed] = useState(initialState); // Local state for the status
  const [price, setPrice] = useState(initialPrice); // Card price
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const handleList = async (enteredPrice) => {
    try {
      await onList(enteredPrice); // Call the parent function to handle the API //onList(cardId, enteredPrice);
      setPrice(enteredPrice); // Save the price locally
      setIsListed(true); // Change the state to "listed"
    } catch (error) {
      console.error("Error listing the card:", error);
    } finally {
      setIsModalOpen(false); // Close the modal
    }
  };

  const handleWithdraw = async () => {
    try {
      await onWithdraw(cardId); // Call the parent function to handle the API
      setPrice(null); // Reset the price
      setIsListed(false); // Change the state to "withdrawn"
    } catch (error) {
      console.error("Error withdrawing the card:", error);
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

        {/* Display the price when the card is listed for sale */}
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
              if (!isListed) setIsModalOpen(true); // Open the modal if listing the card
              else handleWithdraw(); // Withdraw the card if it is listed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-transform transform hover:scale-105"
          >
            {isListed ? "Withdraw" : "List"}
          </button>
        </div>
      </div>

      {/* Modal to enter the price */}
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
