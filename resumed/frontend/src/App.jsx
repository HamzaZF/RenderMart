// import React, {useRef} from 'react'
// import 'flowbite';

// import { createBrowserRouter, RouterProvider } from 'react-router'
// import Home from './components/Home'
// import Signup from './components/Signup'
// import Login from './components/Login'
// import Dashboard from './components/Dashboard'

// function App() {

//   return (
//     <Dashboard/>
//   )
// }

// export default App

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Wallet from './components/Wallet';
import GenerateImage from './components/GenerateImage';
import History from './components/History';
import SignOutModal from './components/SignOutModal';
import ModalPriceCard from './components/ModalPriceCard';
import Login from './components/Login';
import SignUp from './components/SignUp';

// Les pages associées aux onglets de la barre latérale


// Définition des routes
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />, // Composant pour la page de connexion
  },
  {
    path: '/signup',
    element: <SignUp />, // Composant pour la page de connexion
  },
  {
    path: '/',
    element: <Dashboard />,
    children: [
      { path: '', element: <Marketplace /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'wallet', element: <Wallet /> },
      { path: 'generateimage', element: <GenerateImage /> },
      { path: 'history', element: <History /> },
      //{ path: 'signout', element: <SignOutModal isOpen={true} on /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
