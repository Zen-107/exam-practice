import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/sarabun/400.css';
import '@fontsource/sarabun/500.css';
import '@fontsource/sarabun/600.css';
import '@fontsource/sarabun/700.css';
import '@fontsource/sarabun/800.css';
import 'katex/dist/katex.min.css';
import './styles.css';
import App from './App';
import { applyTheme } from './store/prefs';

applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
