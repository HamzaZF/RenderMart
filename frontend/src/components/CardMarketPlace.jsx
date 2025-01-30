import React from "react";

function CardMarketPlace({ imageUrl, price, imageId, onBuySuccess }) {
  const handleBuy = async () => {
    try {
      const response = await fetch(`http://${API_URL}:8090/api/marketplace/buy`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_id: imageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Achat échoué : ${errorData.message}`);
        return;
      }

      const data = await response.json();
      // Appeler le callback onBuySuccess pour afficher le toast
      if (onBuySuccess) onBuySuccess(data.price);
    } catch (error) {
      console.error("Erreur lors de l'achat :", error);
      alert("Une erreur est survenue lors de l'achat.");
    }
  };

  return (
    <main>
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <img className="rounded-t-lg" src={imageUrl} alt="Product" />
        </a>
        <div className="p-5 flex flex-row items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ${price}
          </span>
          <button
            onClick={handleBuy}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-m px-10 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Buy
          </button>
        </div>
      </div>
    </main>
  );
}

export default CardMarketPlace;
