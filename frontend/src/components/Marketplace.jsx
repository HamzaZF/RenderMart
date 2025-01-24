import React from 'react';
import Card from './CardMarketPlace';
import { cardsMarketPlace } from '../constants/index';

function Marketplace() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
                Marketplace
            </h2>
            {/* Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
                {cardsMarketPlace.map((card, index) => (
                    <Card key={index} imageUrl={card.imageUrl} price={card.price} />
                ))}
            </div>
        </div>
    );
}

export default Marketplace;
