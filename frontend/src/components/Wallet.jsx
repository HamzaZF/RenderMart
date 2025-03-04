import React, { useState, useEffect } from "react";
import CardWallet from "./CardWallet";
import { Toast } from "flowbite-react";
import { HiCheck, HiExclamation } from "react-icons/hi";

function Wallet() {
    const [walletCards, setWalletCards] = useState(null); // State to store wallet cards
    const [error, setError] = useState(null); // State to handle errors
    const [loading, setLoading] = useState(true); // Loading state
    const [toastMessage, setToastMessage] = useState(null); // Message for the toast
    const [toastType, setToastType] = useState("success"); // Toast type: success / error

    const API_URL = import.meta.env.VITE_INGRESS_IP;//process.env.VITE_INGRESS_IP;

    // Display a temporary toast
    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 5000); // Hide the toast after 5 seconds
    };

    const fetchWalletImages = async () => {
        setLoading(true); // Display spinner during loading
        try {
            setError(null); // Reset errors
            const response = await fetch(`${API_URL}:80/api/wallet`, {
                credentials: "include", // Include cookies for the user session
            });

            if (!response.ok) {
                throw new Error(
                    `Error fetching data: ${response.statusText}`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("The retrieved data is not valid.");
            }

            setWalletCards(data); // Update local state with fetched data
        } catch (err) {
            setError(err.message); // Capture and store errors
        } finally {
            setLoading(false); // Stop loading after completion
        }
    };

    useEffect(() => {
        fetchWalletImages(); // Load data on component mount
    }, []); // Empty dependencies: runs only on mount

    const handleList = async (cardId, price) => {
        try {
            const response = await fetch(`${API_URL}:80/api/wallet/list`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image_id: cardId, price }),
            });

            if (!response.ok) {
                throw new Error("Error listing the card for sale.");
            }

            setWalletCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, status: "listed", price } : card
                )
            );

            showToast("Card successfully listed for sale!");
        } catch (err) {
            console.error(err);
            setError(err.message);
            showToast("Error listing the card.", "error");
        }
    };

    const handleWithdraw = async (cardId) => {
        try {
            const response = await fetch(
                `${API_URL}:80/api/wallet/withdraw`,
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
                throw new Error("Error withdrawing the card.");
            }

            setWalletCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, status: "withdrawn", price: "0" } : card
                )
            );

            showToast("Card successfully withdrawn from sale!");
        } catch (err) {
            console.error(err);
            setError(err.message);
            showToast("Error withdrawing the card.", "error");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center">
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
                        fetching images from the wallet...
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
                {/* Refresh Button in the error view */}
                {/* <button
                    onClick={fetchWalletImages}
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
                    Wallet
                </h2>
                {/* Refresh Button */}
                <button
                    onClick={fetchWalletImages}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                >
                    Refresh
                </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 place-items-center`}>
                {walletCards.length > 0 ? (
                    walletCards.map((card) => (
                        <CardWallet
                            key={card.id}
                            cardId={card.id}
                            imageUrl={card.image_url}
                            initialState={card.status === "listed"}
                            initialPrice={card.price}
                            onList={(price) => handleList(card.id, price)}
                            onWithdraw={() => handleWithdraw(card.id)}
                        />
                    ))
                ) : (
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {/* Your wallet is empty. */}
                        </p>
                    </div>
                )}
            </div>

            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast>
                        <div
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                toastType === "success"
                                    ? "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200"
                                    : "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
                            }`}
                        >
                            {toastType === "success" ? (
                                <HiCheck className="h-5 w-5" />
                            ) : (
                                <HiExclamation className="h-5 w-5" />
                            )}
                        </div>
                        <div className="ml-3 text-sm font-normal">{toastMessage}</div>
                    </Toast>
                </div>
            )}
        </div>
    );
}

export default Wallet;
