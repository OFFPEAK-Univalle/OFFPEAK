import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.jsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

const SENTRY_DSN_FRONT = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN_FRONT) {
  Sentry.init({
    dsn: SENTRY_DSN_FRONT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Captura de rendimiento y sesiones
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);