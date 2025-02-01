import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialiser useNavigate

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}:80/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour gérer les sessions côté backend
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate("/marketplace"); // Redirige vers /marketplace
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de la connexion.");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      setError("Erreur réseau. Veuillez réessayer plus tard.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="max-w-sm mx-auto border-2 border-blue-300 w-full p-5 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-5 text-gray-900 dark:text-white">
          Welcome Back
        </h2>

        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@flowbite.com"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-5">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
        >
          Log In
        </button>

        {/* Divider */}
        <div className="mt-5 text-center text-gray-500 dark:text-gray-400">
          <span>Don’t have an account?</span>
        </div>

        {/* Signup Link */}
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Create an account
          </button>
        </div>
      </form>
    </main>
  );
}

export default Login;
