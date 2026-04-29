/**
 * Archivo: Alertas.jsx
 * Propósito: Listado y administración de alertas y notificaciones del sistema.
 */

import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Map, Target, AlertCircle } from 'lucide-react';

const alertsData = [
  {
    id: 1,
    level: 'CRÍTICO',
    title: 'Terminal de Transportes — Afluencia Extrema',
    description: 'Se ha detectado un incremento del 45% sobre la capacidad operativa nominal en la zona de abordaje norte. Riesgo de embotellamiento peatonal y retrasos en despachos.',
    time: '14:22 — HACE 5 MIN',
    status: 'ACTIVA',
    color: 'var(--status-critical)',
    bg: 'var(--status-bg-critical)'
  },
  {
    id: 2,
    level: 'MODERADO',
    title: 'Estación Universidades — Saturación Gradual',
    description: 'Flujo ascendente constante detectado en puntos de recarga. Se recomienda habilitar ventanillas auxiliares para prevenir aglomeraciones en hora pico.',
    time: '13:45 — HACE 42 MIN',
    status: 'EN GESTION',
    color: 'var(--status-moderate)',
    bg: 'var(--status-bg-moderate)'
  },
  {
    id: 3,
    level: 'RESUELTO',
    title: 'Bulevar del Río — Evento Finalizado',
    description: 'La descongestión post-evento cultural se ha completado. Los niveles de afluencia han regresado a parámetros normales.',
    time: '11:10 — FINALIZADO',
    status: 'RESUELTA',
    color: 'var(--status-optimal)',
    bg: 'var(--status-bg-optimal)'
  },
  {
    id: 4,
    level: 'CRÍTICO',
    title: 'Intersección Calle 5ta con 66 — Falla de Sensor',
    description: 'Pérdida de señal en el nodo de conteo C66-04. Los datos de afluencia para este cuadrante están siendo estimados mediante triangulación de nodos adyacentes.',
    time: '09:05 — HACE 5 HORAS',
    status: 'FALLA TÉCNICA',
    color: 'var(--status-critical)',
    bg: 'var(--status-bg-critical)'
  }
];

export default function Alertas() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Alertas y Notificaciones</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoreo táctico de incidentes en tiempo real y flujo de afluencia.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-main)', border: 'none', padding: '8px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>TODAS</button>
          <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '8px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>CRÍTICAS</button>
          <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '8px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>MODERADAS</button>
          <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '8px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>RESUELTAS</button>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL ALERTAS HOY</span><div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>07</div></div>
          <Target color="var(--text-muted)" size={28} />
        </div>
        <div style={{ padding: '24px', borderLeft: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>CRÍTICAS ACTIVAS</span><div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, color: 'var(--status-critical)' }}>03</div></div>
          <AlertCircle color="var(--status-critical)" size={28} />
        </div>
        <div style={{ padding: '24px', borderLeft: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>RESUELTAS</span><div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, color: 'var(--status-optimal)' }}>04</div></div>
          <CheckCircle color="var(--status-optimal)" size={28} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {alertsData.map((alert) => (
          <div key={alert.id} className="glass-panel" style={{ borderLeft: `4px solid ${alert.color}`, padding: '24px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: alert.color }}>
                  {alert.level === 'CRÍTICO' && <AlertTriangle size={16} />}
                  {alert.level === 'MODERADO' && <TrendingUp size={16} />}
                  {alert.level === 'RESUELTO' && <CheckCircle size={16} />}
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>NIVEL {alert.level}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{alert.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '85%' }}>{alert.description}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '24px', minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
              <div style={{ display: 'inline-block', backgroundColor: alert.bg, color: alert.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center', alignSelf: 'flex-start', marginBottom: '8px' }}>{alert.status}</div>
              {alert.level === 'CRÍTICO' || alert.level === 'MODERADO' ? (
                <>
                  <button style={{ backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-main)', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Map size={14} /> VER EN MAPA</button>
                  <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>{alert.level === 'CRÍTICO' ? 'GESTIONAR' : 'MARCAR RESUELTA'}</button>
                </>
              ) : (
                <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>VER HISTORIAL</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <button style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '12px 24px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>CARGAR ALERTAS ANTERIORES</button>
      </div>
    </div>
  );
}
