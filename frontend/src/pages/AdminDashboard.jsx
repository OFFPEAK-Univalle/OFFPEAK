import React, { useState, useEffect } from 'react';
import { Settings, Database, RefreshCw, Server, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [cleanerStatus, setCleanerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/cleaner/status');
      if (response.ok) {
        const data = await response.json();
        setCleanerStatus(data);
      }
    } catch (error) {
      console.error("Error fetching cleaner status:", error);
    }
  };

  const forceClean = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/cleaner/force-run', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message });
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: 'Error al forzar limpieza.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fallo de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      <div className="header-flex" style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Panel de Administrador</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mantenimiento del Sistema y Background Tasks</span>
        </div>
        <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'var(--surface-secondary)', display: 'flex', alignItems: 'center' }}>
          <Settings size={24} color="var(--accent-cyan)" />
        </div>
      </div>

      <div className="responsive-grid">
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database color="var(--accent-cyan)" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Estado del Limpiador de Caché</h3>
          </div>
          
          {cleanerStatus ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ESTADO:</span>
                <span style={{ 
                  color: cleanerStatus.is_running ? 'var(--status-optimal)' : 'var(--status-critical)', 
                  fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' 
                }}>
                  {cleanerStatus.is_running ? <><CheckCircle size={14}/> ACTIVO</> : <><AlertCircle size={14}/> INACTIVO</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ÚLTIMA LIMPIEZA:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {cleanerStatus.last_run ? new Date(cleanerStatus.last_run).toLocaleString() : 'Ninguna (Recién iniciado)'}
                </span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cargando estado...</span>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button 
              onClick={forceClean}
              disabled={loading}
              style={{ 
                backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)', 
                padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} />
              {loading ? 'EJECUTANDO LIMPIEZA...' : 'FORZAR LIMPIEZA AHORA'}
            </button>
            
            {message && (
              <div style={{ 
                marginTop: '12px', padding: '8px', borderRadius: '4px', fontSize: '0.75rem', textAlign: 'center',
                backgroundColor: message.type === 'success' ? 'var(--status-bg-optimal)' : 'var(--status-bg-critical)',
                color: message.type === 'success' ? 'var(--status-optimal)' : 'var(--status-critical)'
              }}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', opacity: 0.6 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Server color="var(--text-secondary)" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Métricas del Servidor</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Módulo en construcción...</span>
        </div>
      </div>
      
    </div>
  );
}
