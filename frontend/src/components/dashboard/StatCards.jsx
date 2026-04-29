import React from 'react';
import '../../styles/dashboard/StatCards.css';

export default function StatCards() {
  return (
    <div>
      <h3 className="kpi-section-title">KPI STAT CHIPS & INDICADORS</h3>

      <div className="stat-cards-grid">
        {/* Card: Flujo Total */}
        <div className="glass-panel stat-card">
          <span className="stat-card-label">FLUJO TOTAL</span>
          <div className="stat-card-value-container">
            <span className="stat-value">20.000</span>
            <span className="stat-card-trend" style={{ color: 'var(--status-optimal)' }}>+12%</span>
          </div>
        </div>

        {/* Card: Zonas Críticas */}
        <div className="glass-panel stat-card">
          <span className="stat-card-label">ZONAS CRÍTICAS</span>
          <div className="stat-card-value-container">
            <span className="stat-value text-cyber">04</span>
            <span className="stat-card-trend" style={{ color: 'var(--status-critical)' }}>+2</span>
          </div>
        </div>

        {/* Estado Chips */}
        <div className="status-chips-container">
          <div className="status-chip active">
            <div className="status-chip-dot"></div>
            <span className="status-chip-text">ACTIVA</span>
          </div>
          <div className="status-chip managing">
            <div className="status-chip-dot"></div>
            <span className="status-chip-text">EN GESTION</span>
          </div>
          <div className="status-chip resolved">
            <div className="status-chip-dot"></div>
            <span className="status-chip-text">RESUELTA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
