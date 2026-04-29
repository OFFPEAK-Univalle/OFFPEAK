import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { AlertCircle } from 'lucide-react';
import '../../styles/dashboard/MainChart.css';

export default function MainChart({ data }) {
  return (
    <div className="responsive-grid-2-1">
      {/* Gráfico Principal: Cali Norte */}
      <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div className="main-chart-header">
          <div className="main-chart-header-content">
            <div>
              <h2 className="main-chart-title">Cali Norte - Comuna 2</h2>
              <p className="main-chart-subtitle">Monitoreo de afluencia peatonal en tiempo real</p>
            </div>
            <span className="status-badge">
              ESTADO: ÓPTIMO
            </span>
          </div>
        </div>

        <div className="chart-container-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'var(--surface-secondary)' }} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="afluencia" fill="var(--surface-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="main-chart-footer">
          <span className="main-chart-update-text">Actualización: Hace 2 min</span>
          <span className="main-chart-report-link">VER REPORTE</span>
        </div>
      </div>

      {/* Panel Lateral: Alertas Relevantes */}
      <div className="glass-panel side-alert-panel">
        <div className="side-alert-header">
          <AlertCircle size={16} />
          <span className="side-alert-label">ALERTA DE AFLUENCIA</span>
        </div>

        <h2 className="side-alert-title">Congestión Crítica</h2>
        <p className="side-alert-desc">
          Terminal de Transportes presenta un incremento del 45% sobre la capacidad recomendada.
        </p>

        <div className="side-alert-actions">
          <button className="btn-side-alert btn-side-alert-primary">
            DESPLEGAR PERSONAL
          </button>
          <button className="btn-side-alert btn-side-alert-secondary">
            IGNORAR
          </button>
        </div>
      </div>
    </div>
  );
}
