import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import App from './App.jsx';
import Other from './pages/Other.jsx';
import RootLayout from './components/RootLayout.jsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    // element: <App />,
    Component: RootLayout,
    children: [
      { index: true, Component: App },
      { path: 'other', Component: Other },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
