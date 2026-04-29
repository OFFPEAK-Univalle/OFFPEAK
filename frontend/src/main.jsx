/**
 * Archivo: main.jsx
 * Propósito: Punto de entrada principal de la aplicación React.
 * Descripción:
 * 1. Importa React y ReactDOM para renderizar la interfaz.
 * 2. Importa el archivo global de estilos (index.css).
 * 3. Importa el componente raíz de la aplicación (App).
 * 4. Renderiza el componente 'App' dentro del DOM en el contenedor con id 'root',
 *    utilizando React.StrictMode para advertir sobre posibles problemas en la app.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
