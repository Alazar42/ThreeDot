import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DocThemeProvider } from './theme/ThemeContext';
import './style.css';
import './theme/prism-vsc-theme.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <DocThemeProvider>
        <App />
      </DocThemeProvider>
    </React.StrictMode>
  );
}

