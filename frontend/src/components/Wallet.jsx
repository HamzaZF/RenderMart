import React from 'react';
import CardWallet from './CardWallet';
import { cardsWallet } from '../constants/index';

function Wallet() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
                Wallet
            </h2>
            {/* Responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
                {cardsWallet.map((card, index) => (
                    <CardWallet key={index} imageUrl={card.imageUrl} state={card.state} />
                ))}
            </div>
        </div>
    );
}

export default Wallet;
