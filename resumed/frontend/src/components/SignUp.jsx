import React, { useState, useEffect } from "react";

function SignUp() {
  const [darkMode, setDarkMode] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_INGRESS_IP;//process.env.VITE_INGRESS_IP;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Vérification côté client : les mots de passe doivent correspondre
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}:80/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Envoie les cookies de session,
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setSuccess("Compte créé avec succès. Vous pouvez maintenant vous connecter !");
        setError("");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de l'inscription.");
        setSuccess("");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      setError("Erreur réseau. Veuillez réessayer plus tard.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSignUp}
        className="max-w-sm mx-auto border-2 border-green-300 w-full p-5 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-5 text-gray-900 dark:text-white">
          Create an Account
        </h2>

        {/* Full Name */}
        <div className="mb-5">
          <label
            htmlFor="full-name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Full Name
          </label>
          <input
            type="text"
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

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
            Password
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

        {/* Confirm Password */}
        <div className="mb-5">
          <label
            htmlFor="confirm-password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Error or Success Message */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-5">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-500 text-center mb-5">{success}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="mt-5 text-center text-gray-500 dark:text-gray-400">
          <span>Already have an account?</span>
        </div>

        {/* Login Link */}
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => window.location.href = "/login"}
            className="text-green-600 hover:underline dark:text-green-400"
          >
            Log In
          </button>
        </div>
      </form>
    </main>
  );
}

export default SignUp;
