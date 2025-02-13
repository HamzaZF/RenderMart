import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Link } from "react-router";
import SignOutModal from "./SignOutModal";
import { useLocation } from "react-router";
import logo from '../assets/logo/logo_no_bg.png';
import { useNavigate } from "react-router";

function Dashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [selectedTab, setSelectedTab] = useState("marketplace");
  const [selectedTab, setSelectedTab] = useState(() => {
    // Retrieve the saved value from localStorage or use "marketplace" by default
    return localStorage.getItem("selectedTab") || "marketplace";
  });

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isLogginActive, setIsLogginActive] = useState(null); // null = initial loading state
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  //const API_URL = process.env.VITE_INGRESS_IP;

  const API_URL = import.meta.env.VITE_INGRESS_IP;

  const navigate = useNavigate();

  const fetchBalance = async () => {
    try {
      //const response = await fetch("http://localhost:3300/api/user-balance", { method: "GET", credentials: "include" });
      const response = await fetch(`${API_URL}:80/api/user-balance`, { method: "GET", credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance); // Update the balance state
      }
    } catch (error) {
      console.error("Error retrieving balance:", error);
    }
  };

  // Verify authentication status to determine if sign in or sign out should be shown in the navbar

  // Check if the user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}:80/api/check-auth`, {
        method: "GET",
        credentials: "include", // Send cookies to verify the session
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Connected user:", data.user);
        setIsLogginActive(true); // Authentication successful
        fetchBalance();
      } else {
        console.warn("User not authenticated");
        setIsLogginActive(false); // Authentication failed
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Error during authentication check:", error);
      setIsLogginActive(false); // Error = not authenticated
      navigate("/login");
    }
  };

  // Called on component mount to verify authentication
  useEffect(() => {
    checkAuth();
  }, []); // Empty dependency array: executed only on mount

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}:80/api/logout`, {
        method: "POST",
        credentials: "include", // Important for session cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        setIsLogginActive(false); // Log out the user
        navigate("/login"); // Redirect to the login page
      } else {
        console.error("Error during logout");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const location = useLocation();

  const openSignOutModal = () => {
    setIsSignOutModalOpen(true);
  };

  const closeSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  const handleSignOut = () => {
    console.log("User signed out");
    // Redirection or cleanup here
    setIsSignOutModalOpen(false);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const changeTab = (tab) => {
    setSelectedTab(tab);
    localStorage.setItem("selectedTab", tab); // Save to localStorage
  };

  // During the authentication check, display a loader
  // Critical step: Do not display content until verification is complete
  if (isLogginActive === null) {
    // Loader or waiting page during verification
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
          {/* Enhanced loader */}
          <div className="loader w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          {/* Styled text */}
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-white">
            Loading...
          </h2>
        </div>
      </main>
    );
  }

  return (
    isLogginActive && (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Navbar */}
        <nav className="fixed top-0 z-50 w-full bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Hamburger Button - Visible only on small screens */}
            <button
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6H6V8H18V6ZM6 12H18V14H6V12ZM6 18H18V20H6V18Z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6H21V8H3V6ZM3 12H21V14H3V12ZM3 18H21V20H3V18Z" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <Link onClick={() => changeTab("marketplace")} className="flex items-center" to={"/"}>
                <img
                  //src="https://flowbite.com/docs/images/logo.svg"
                  src={logo}
                  alt="Logo"
                  className="h-8"
                />
                <span className="ml-2 text-xl font-semibold dark:text-white">
                  RenderMart
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
        <aside
          className={`fixed pt-16 top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 transform transition-transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:block`}
        >
          <div className="h-full px-4 py-3">
            <nav className="space-y-2">
              <ul>
                <li className="my-2">
                  <Link
                    to="/marketplace"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${selectedTab === "marketplace" ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    onClick={() => changeTab("marketplace")}
                  >
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.535 7.677c.313-.98.687-2.023.926-2.677H17.46c.253.63.646 1.64.977 2.61.166.487.312.953.416 1.347.11.42.148.675.148.779 0 .18-.032.355-.09.515-.06.161-.144.3-.243.412-.1.111-.21.192-.324.245a.809.809 0 0 1-.686 0 1.004 1.004 0 0 1-.324-.245c-.1-.112-.183-.25-.242-.412a1.473 1.473 0 0 1-.091-.515 1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.401 1.401 0 0 1 13 9.736a1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.4 1.4 0 0 1 9 9.74v-.008a1 1 0 0 0-2 .003v.008a1.504 1.504 0 0 1-.18.712 1.22 1.22 0 0 1-.146.209l-.007.007a1.01 1.01 0 0 1-.325.248.82.82 0 0 1-.316.08.973.973 0 0 1-.563-.256 1.224 1.224 0 0 1-.102-.103A1.518 1.518 0 0 1 5 9.724v-.006a2.543 2.543 0 0 1 .029-.207c.024-.132.06-.296.11-.49.098-.385.237-.85.395-1.344ZM4 12.112a3.521 3.521 0 0 1-1-2.376c0-.349.098-.8.202-1.208.112-.441.264-.95.428-1.46.327-1.024.715-2.104.958-2.767A1.985 1.985 0 0 1 6.456 3h11.01c.803 0 1.539.481 1.844 1.243.258.641.67 1.697 1.019 2.72a22.3 22.3 0 0 1 .457 1.487c.114.433.214.903.214 1.286 0 .412-.072.821-.214 1.207A3.288 3.288 0 0 1 20 12.16V19a2 2 0 0 1-2 2h-6a1 1 0 0 1-1-1v-4H8v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-6.888ZM13 15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="absolute pl-6">
                      <span className="flex-1 ms-3 whitespace-nowrap">Marketplace</span>
                    </span>
                  </Link>
                </li>

                <li className="my-2">
                  <Link
                    to="/wallet"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${selectedTab === "wallet" ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    onClick={() => changeTab("wallet")}
                  >
                    <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                    </svg>

                    <span className="absolute pl-6">
                      <span className="flex-1 ms-3 whitespace-nowrap">Wallet</span>
                      {/* <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span> */}
                    </span>
                  </Link>
                </li>
                <li className="my-2">
                  <Link
                    to="/generateimage"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${selectedTab === "generateimage" ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    onClick={() => changeTab("generateimage")}
                  >
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.8638 3.49613C12.6846 3.18891 12.3557 3 12 3s-.6846.18891-.8638.49613l-3.49998 6c-.18042.30929-.1817.69147-.00336 1.00197S8.14193 11 8.5 11h7c.3581 0 .6888-.1914.8671-.5019.1784-.3105.1771-.69268-.0033-1.00197l-3.5-6ZM4 13c-.55228 0-1 .4477-1 1v6c0 .5523.44772 1 1 1h6c.5523 0 1-.4477 1-1v-6c0-.5523-.4477-1-1-1H4Zm12.5-1c-2.4853 0-4.5 2.0147-4.5 4.5s2.0147 4.5 4.5 4.5 4.5-2.0147 4.5-4.5-2.0147-4.5-4.5-4.5Z" />
                    </svg>
                    <span className="absolute pl-6">
                      <span className="flex-1 ms-3 whitespace-nowrap">Generate Image</span>
                    </span>
                  </Link>
                </li>
                <li className="my-2">
                  <Link
                    to="/history"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${selectedTab === "history" ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    onClick={() => changeTab("history")}
                  >
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11.5c.07 0 .14-.007.207-.021.095.014.193.021.293.021h2a2 2 0 0 0 2-2V7a1 1 0 0 0-1-1h-1a1 1 0 1 0 0 2v11h-2V5a2 2 0 0 0-2-2H5Zm7 4a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1Zm-6 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1ZM7 6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7Zm1 3V8h1v1H8Z" clipRule="evenodd" />
                    </svg>
                    <span className="absolute pl-6">
                      <span className="ms-3">History</span>
                    </span>
                  </Link>
                </li>
                <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
                <li className="my-2">
                  <button
                    className="w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    onClick={isLogginActive ? handleLogout : () => navigate("/login")}
                  >
                    {isLogginActive ? (
                      <>
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                        </svg>
                        <span className="absolute pl-6">
                          <span className="ms-3 whitespace-nowrap">Sign out</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                        </svg>
                        <span className="absolute pl-6">
                          <span className="ms-3 whitespace-nowrap">Sign in</span>
                        </span>
                      </>
                    )}
                  </button>
                </li>

                <li className="my-8">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                    <span className="text-gray-700 dark:text-white font-medium">
                      balance : ${balance.toFixed(2)}
                    </span>
                  </div>
                </li>

              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <section className={`pt-16 transition-all pl-0 md:pl-64 w-full h-full`}>
          <div className="h-full w-full">
            {/* {isSignOutModalOpen && <SignOutModal isOpen={isSignOutModalOpen} onConfirm={handleLogout} onClose={closeSignOutModal} />} */}
            <Outlet />
          </div>
        </section>
      </main>
    )
  );
}

export default Dashboard;
