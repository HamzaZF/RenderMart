import React, { useState, useEffect } from "react";
import CardWallet from "./CardWallet";

function Wallet() {
    const [walletCards, setWalletCards] = useState(null); // État pour stocker les cartes du portefeuille
    const [error, setError] = useState(null); // État pour gérer les erreurs
    const [loading, setLoading] = useState(true); // État de chargement

    useEffect(() => {
        // Fonction pour récupérer les cartes du portefeuille avec délai minimum
        const fetchWalletImages = async () => {
            try {
                const response = await fetch("http://localhost:3300/api/wallet", {
                    credentials: "include", // Inclure les cookies pour la session utilisateur
                });

                if (!response.ok) {
                    throw new Error(
                        `Erreur lors de la récupération des données : ${response.statusText}`
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Les données récupérées ne sont pas valides.");
                }

                setWalletCards(data); // Met à jour l'état local avec les données récupérées
            } catch (err) {
                setError(err.message); // Capture et stocke les erreurs
            }
        };

        // Définir un délai minimum de 1 seconde
        const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

        // Attendre la récupération des données et le délai minimum
        Promise.all([fetchWalletImages(), delayPromise]).finally(() => {
            setLoading(false); // Arrêter le chargement après le délai
        });
    }, []); // Dépendances vides : s'exécute uniquement au montage

    // Fonction pour mettre une carte en vente
    const handleList = async (cardId, price) => {
        try {
            console.log("Envoi à l'API : ", { image_id: cardId, price }); // Ajoute un log ici
            const response = await fetch("http://localhost:3300/api/wallet/list", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image_id: cardId, price }), // Vérifie que les deux champs sont bien envoyés
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise en vente de la carte.");
            }

            setWalletCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, status: "listed", price } : card
                )
            );
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };


    // Fonction pour retirer une carte de la vente
    const handleWithdraw = async (cardId) => {
        try {
            const response = await fetch(
                "http://localhost:3300/api/wallet/withdraw",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ image_id: cardId }),
                }
            );

            if (!response.ok) {
                throw new Error("Erreur lors du retrait de la carte.");
            }

            // Mettre à jour l'état local après une réponse réussie
            setWalletCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, status: "withdrawn", price: "0" } : card
                )
            );
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
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
                        Chargement de votre portefeuille...
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
                Wallet
            </h2>

            {/* Affichage des cartes ou message si vide */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center">
                {walletCards.length > 0 ? (
                    walletCards.map((card) => (
                        <CardWallet
                            key={card.id}
                            cardId={card.id}
                            imageUrl={card.image_url}
                            initialState={card.status === "listed"} // Vérifie si la carte est listée
                            initialPrice={card.price} // Passe le prix initial
                            onList={(price) => handleList(card.id, price)}
                            onWithdraw={() => handleWithdraw(card.id)}
                        />

                    ))
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                        Votre portefeuille est vide.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Wallet;
