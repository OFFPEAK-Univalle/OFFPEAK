import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import '../../styles/dashboard/BottomPanels.css';

export default function BottomPanels({ 
  currentAfluencia, 
  alertStatus, 
  setAlertStatus, 
  setCurrentAfluencia, 
  setProtocolActions,
  trendData 
}) {
  const isNormal = alertStatus === 'normal';
  const isCritical = alertStatus === 'critical';

  return (
    <div className="bottom-panels-grid">
      {/* Leyenda del mapa (informativo) */}
      <div className="glass-panel legend-panel">
        <h3 className="legend-title">LEYENDA DE MAPA</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--status-optimal)' }} /> 
            <span className="legend-text">Bajo Tráfico</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--status-moderate)' }} /> 
            <span className="legend-text">Moderado</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--status-critical)' }} /> 
            <span className="legend-text">Crítico</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} /> 
            <span className="legend-text">Punto de Control</span>
          </div>
        </div>
      </div>

      {/* Ocupación Específica */}
      <div 
        className="glass-panel capacity-card" 
        style={{ border: !isNormal ? `2px solid ${isCritical ? 'var(--status-critical)' : 'var(--status-moderate)'}` : '1px solid var(--border-light)' }}
      >
        <span className="capacity-card-label">COMUNA 17</span>
        <div className="capacity-card-header">
          <h2 className="capacity-card-title">Jardín Plaza</h2>
          <button
            onClick={() => {
              if (isNormal) setCurrentAfluencia(88);
              else {
                setAlertStatus('normal');
                setCurrentAfluencia(65);
                setProtocolActions({ trafficLights: true, agents: true, rerouting: false, mio: false });
              }
            }}
            className="btn-simulate"
          >
            {!isNormal ? 'Resetear' : 'Simular > 85%'}
          </button>
        </div>

        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${currentAfluencia}%`, 
              backgroundColor: isCritical ? 'var(--status-critical)' : (alertStatus === 'managing' ? 'var(--status-moderate)' : 'var(--accent-cyan)') 
            }} 
          />
        </div>
        <div className="capacity-card-footer">
          <span className="capacity-footer-label">OCUPACIÓN</span>
          <span className="capacity-footer-value" style={{ color: !isNormal ? (isCritical ? 'var(--status-critical)' : 'var(--status-moderate)') : 'inherit' }}>
            {currentAfluencia}%
          </span>
        </div>
      </div>

      {/* Gráfico de Tendencia Semanal */}
      <div className="glass-panel trend-panel">
        <div className="trend-header">
          <h3 className="trend-title">TENDENCIA SEMANAL</h3>
          <div className="trend-indicators">
            <div className="trend-indicator-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />
            <div className="trend-indicator-dot" style={{ backgroundColor: 'var(--status-optimal)' }} />
          </div>
        </div>
        <div className="chart-area-small">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip cursor={{ stroke: 'var(--border-light)' }} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="real" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
              <Area type="monotone" dataKey="promedio" stroke="var(--status-optimal)" strokeDasharray="3 3" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="trend-footer">
          <span className="trend-footer-text">LUN</span>
          <span className="trend-footer-text">DOM</span>
        </div>
      </div>
    </div>
  );
}
