import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Toast } from "flowbite-react";
import { HiCheck } from "react-icons/hi";

function GenerateImage() {
    const [prompt, setPrompt] = useState("");
    const [seed, setSeed] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const generateSeed = () => {
        const randomSeed = Math.floor(Math.random() * Math.pow(2, 32)); // Génère un entier aléatoire sur 32 bits
        setSeed(randomSeed);
    };

    const handleGenerateImage = () => {
        //ensure promp and seed are not empty
        if (!prompt) {
            alert("Please enter a prompt");
        }
        else if (!seed) {
            alert("Please generate a seed");
        }
        else {
            setIsLoading(true);
            setTimeout(() => {
                setImageUrl("https://placehold.co/600x400");
                setIsLoading(false);
            }, 2000);
        }
    };

    //   const handleSaveImage = () => {
    //     setShowToast(true); // Affiche le toast
    //     setTimeout(() => {
    //       setShowToast(false); // Cache le toast après 3 secondes
    //     }, 5000);
    //   };

    const handleSaveImage = async () => {
        if (!imageUrl) {
            alert("No image to save!");
            return;
        }

        try {
            const response = await fetch(`http://${API_URL}:8090/api/wallet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                credentials: "include", // Important pour inclure la session
                body: JSON.stringify({
                    image_url: imageUrl,
                    status: "withdrawn", // Ajout initial au portefeuille avec le statut "withdrawn"
                }),
            });

            if (response.ok) {
                setShowToast(true); // Affiche le toast
                setTimeout(() => {
                    setShowToast(false); // Cache le toast après 3 secondes
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to save the image to the wallet.");
            }
        } catch (error) {
            console.error("Error saving image to wallet:", error);
            alert("An error occurred while saving the image.");
        }
    };


    return (
        <main>
            <h2 className="mt-8 mb-8 text-2xl font-bold text-gray-800 dark:text-white text-center">
                Generate an Image
            </h2>
            <main className="flex items-center justify-center bg-gray-900">

                <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md max-w-lg w-full">


                    {/* Prompt Input */}
                    <div className="mb-6 flex flex-row">
                        <input
                            id="prompt"
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image..."
                            className="block w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Seed Generation */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={generateSeed}
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Generate
                        </button>
                        <input
                            type="text"
                            readOnly
                            value={seed}
                            placeholder="Generated seed"
                            className="px-4 py-2 w-full border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Generate Image Button */}
                    <div className="mb-6">
                        <button
                            onClick={handleGenerateImage}
                            className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Generate Image
                        </button>
                    </div>

                    {/* Display Spinner or Image */}
                    <div className="mt-6 text-center">
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <ClipLoader color="#4A90E2" size={50} />
                            </div>
                        ) : (
                            imageUrl && (
                                <>
                                    <img
                                        src={imageUrl}
                                        alt="Generated"
                                        className="rounded-lg shadow-lg w-full mb-4"
                                    />
                                    <button
                                        onClick={handleSaveImage}
                                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                                    >
                                        Save Image
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <Toast>
                            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                                <HiCheck className="h-5 w-5" />
                            </div>
                            <div className="ml-3 text-sm font-normal">
                                Image added to the wallet!
                            </div>
                        </Toast>
                    </div>
                )}
            </main>
        </main>
    );
}

export default GenerateImage;
