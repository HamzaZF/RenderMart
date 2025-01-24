import React from 'react';

function CardMarketPlace({ imageUrl, price }) {
  return (
    <main>
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <img
            className="rounded-t-lg"
            src={imageUrl}
            alt="Product"
          />
        </a>
        <div className="p-5 flex flex-row items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">${price}</span>
          <a
            href="#"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-m px-10 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Buy
          </a>
        </div>
      </div>
    </main>
  );
}

export default CardMarketPlace;
