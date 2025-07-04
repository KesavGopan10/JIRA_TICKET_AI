import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgba(30,41,59,0.95)',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
          fontSize: '1rem',
        },
        success: { iconTheme: { primary: '#22d3ee', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);
