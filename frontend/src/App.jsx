/**
 * Archivo: App.jsx
 * Propósito: Componente raíz que define el Layout principal y el Enrutamiento (React Router).
 * Descripción:
 * 1. Importa BrowserRouter, Routes y Route de 'react-router-dom'.
 * 2. Importa componentes de íconos (Lucide-React) para la navegación.
 * 3. Define un Layout responsivo:
 *    - Desktop: Sidebar lateral fija.
 *    - Móvil: Bottom Navigation bar (siguiendo estilo app nativa).
 * 4. Configura rutas para Dashboard, Zonas Críticas, Alertas e Historial.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Map, Bell, History, Settings, LogOut, UserCircle } from 'lucide-react';

// Importación de Páginas (Placeholder temporal mientras construimos cada una)
import Dashboard from './pages/Dashboard';
import ZonasCriticas from './pages/ZonasCriticas';
import Alertas from './pages/Alertas';
import Historial from './pages/Historial';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'VISTA GENERAL', path: '/dashboard', icon: LayoutDashboard },
  { id: 'zonas', label: 'ZONAS CRÍTICAS', path: '/zonas', icon: Map },
  { id: 'alertas', label: 'ALERTAS Y NOTIFICACIONES', path: '/alertas', icon: Bell },
  { id: 'historial', label: 'HISTORIAL DE AFLUENCIA', path: '/historial', icon: History },
  // { id: 'reportes', label: 'REPORTES', path: '/reportes', icon: FileText },
  { id: 'configuracion', label: 'CONFIGURACIÓN', path: '/configuracion', icon: Settings },
];

function AppLayout({ children }) {
  // Estado para controlar comportamiento en móvil (si fuese necesario expandir)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* 
        Sidebar (Desktop):
        Visible solo en pantallas grandes (min-width: 768px).
      */}
      <aside className="sidebar">
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>OffPeak Admin</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>SANTIAGO DE CALI</span>
        </div>

        <nav style={{ flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--surface-primary)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--accent-cyan)' : '4px solid transparent',
                  transition: 'all 0.2s',
                })}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile widget at bottom */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserCircle size={32} color="var(--text-secondary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Perfil Usuario</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CONFIGURACIÓN</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
        {/* Header superior */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>ZONAS MONITOREADAS</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>ALERTAS ACTIVAS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ÚLTIMA ACTUALIZACIÓN: 14:02</span>
            <Bell size={18} color="var(--text-secondary)" />
            <LogOut
              size={18}
              color="var(--text-secondary)"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              title="Cerrar sesión"
            />
          </div>
        </header>

        {/* Inyección de Rutas */}
        {children}
      </main>

      {/* Add inline media queries for responsiveness */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar {
          width: var(--sidebar-width-desktop);
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
        }
        .main-content {
          height: 100vh;
        }

        /* Hover effect for sidebar links */
        .sidebar-link:hover {
          background-color: var(--surface-hover) !important;
          color: var(--text-primary) !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none; /* Esconder sidebar en móviles */
          }
          .main-content {
            padding: 16px !important;
            padding-bottom: 80px !important; /* Espacio para el bottom nav */
          }
          header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
        }
      `}} />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {SIDEBAR_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <Icon size={20} />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-sidebar);
          border-top: 1px solid var(--border-light);
          padding: 8px 16px;
          padding-bottom: env(safe-area-inset-bottom, 16px);
          z-index: 100;
        }
        
        .mobile-bottom-nav a {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 600;
          flex: 1;
        }

        .mobile-bottom-nav a.active {
          color: var(--accent-cyan);
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
            justify-content: space-between;
          }
        }
      `}} />
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  let isAuthenticated = false;
  let isAuthorized = false;

  if (token) {
    isAuthenticated = true;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      if (payload.rol === 'autoridad' || payload.rol === 'admin') {
        isAuthorized = true;
      }
    } catch(e) {
      isAuthenticated = false;
    }
  }

  // Si está logueado pero no es autoridad, mostramos error de permisos.
  if (isAuthenticated && !isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <h1 style={{ color: 'var(--status-critical)' }}>ACCESO DENEGADO</h1>
        <p style={{ color: 'var(--text-secondary)' }}>No tienes los permisos necesarios (Rol: Autoridad) para acceder al Dashboard.</p>
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
          style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--accent-cyan)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/zonas" element={<ZonasCriticas />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/configuracion" element={<AdminDashboard />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <h2 style={{ color: 'var(--text-muted)' }}>Pantalla en construcción</h2>
              </div>
            } />
          </Routes>
        </AppLayout>
      )}
    </Router>
  );
}

export default App;
