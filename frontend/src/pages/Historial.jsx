/**
 * Archivo: Historial.jsx
 * Propósito: Módulo de análisis retrospectivo y reportes de movilidad.
 */

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, Calendar, FileText, AlertTriangle, CheckCircle, Lightbulb, Map, Bell } from 'lucide-react';

const historyChartData = [
  { date: 'OCT 01', centro: 20, roosevelt: 15 },
  { date: 'OCT 07', centro: 40, roosevelt: 30 },
  { date: 'OCT 14', centro: 70, roosevelt: 45 },
  { date: 'OCT 21', centro: 50, roosevelt: 85 },
  { date: 'OCT 28', centro: 100, roosevelt: 65 },
  { date: 'OCT 31', centro: 15, roosevelt: 40 },
];

const desgloseData = [
  { id: 1, zona: 'Centro Histórico', comuna: 'Comuna 3', pico: '92.4%', hora: '17:45 hrs', promedio: '68.1%', alertas: 24, trend: 'critical' },
  { id: 2, zona: 'Av. Roosevelt', comuna: 'Comuna 19', pico: '86.2%', hora: '08:15 hrs', promedio: '54.9%', alertas: 18, trend: 'moderate' },
  { id: 3, zona: 'Chipichape Norte', comuna: 'Comuna 2', pico: '75.0%', hora: '13:00 hrs', promedio: '42.3%', alertas: 6, trend: 'optimal' },
];

export default function Historial() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      <div className="header-flex">
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Historial de Afluencia</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Análisis retrospectivo de movilidad y congestión urbana.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <Calendar size={14} color="var(--text-secondary)" /> 01/10/2023 - 31/10/2023
            </div>
            <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <Map size={14} color="var(--status-optimal)" /> 4 Zonas Seleccionadas
            </div>
          </div>
          <button style={{ backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-main)', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> EXPORTAR A PDF / EXCEL
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px 0' }}>Curva de Afluencia Temporal</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>VOLUMEN % DE CAPACIDAD • OCTUBRE 2023</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}/> CENTRO HISTÓRICO</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-optimal)' }}/> AV. ROOSEVELT</span>
          </div>
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer>
            <AreaChart data={historyChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCentro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRoos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-optimal)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--status-optimal)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <Tooltip cursor={{stroke: 'var(--border-light)'}} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}/>
              <Area type="monotone" dataKey="centro" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorCentro)" />
              <Area type="monotone" dataKey="roosevelt" stroke="var(--status-optimal)" strokeWidth={3} fillOpacity={1} fill="url(#colorRoos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="responsive-grid">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PROMEDIO GLOBAL</span><FileText size={16} color="var(--accent-cyan)" /></div>
          <div style={{ marginTop: '12px' }}><span style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>64.2%</span><span style={{ color: 'var(--status-optimal)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold', marginTop: '4px' }}>↓ 4.2% vs mes anterior</span></div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PICO DE SATURACIÓN</span><AlertTriangle size={16} color="var(--status-critical)" /></div>
          <div style={{ marginTop: '12px' }}><span style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>98.1%</span><span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold', marginTop: '4px' }}>Registrado en: <span style={{ color: 'var(--text-primary)' }}>ZONA SUR</span></span></div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ALERTAS EMITIDAS</span><Bell size={16} color="var(--status-moderate)" /></div>
          <div style={{ marginTop: '12px' }}><span style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>142</span><span style={{ color: 'var(--status-critical)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold', marginTop: '4px' }}>↑ 12% incidencias críticas</span></div>
        </div>
      </div>

      <div className="responsive-grid-2-1">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}><h3 style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', letterSpacing: '1px' }}>DESGLOSE DETALLADO POR ZONA</h3><span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', cursor: 'pointer' }}>Ver todas las zonas</span></div>
          <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)' }}><th style={{ paddingBottom: '12px', fontWeight: 600 }}>ZONA</th><th style={{ paddingBottom: '12px', fontWeight: 600 }}>PICO MÁXIMO</th><th style={{ paddingBottom: '12px', fontWeight: 600 }}>HORA PICO</th><th style={{ paddingBottom: '12px', fontWeight: 600 }}>PROMEDIO DIARIO</th><th style={{ paddingBottom: '12px', fontWeight: 600 }}>ALERTAS</th><th style={{ paddingBottom: '12px', fontWeight: 600 }}>TENDENCIA</th></tr></thead>
            <tbody>{desgloseData.map((row) => (<tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}><td style={{ padding: '16px 0' }}><div style={{ fontWeight: 'bold', color: '#fff' }}>{row.zona}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{row.comuna}</div></td><td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{row.pico}</td><td>{row.hora}</td><td>{row.promedio}</td><td style={{ color: row.alertas > 10 ? 'var(--status-critical)' : 'var(--text-primary)', fontWeight: 'bold' }}>{row.alertas}</td><td><div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>{[4, 6, 3, 8, 12, 10].map((h, i) => (<div key={i} style={{ width: '4px', height: `${h}px`, backgroundColor: row.trend === 'critical' ? 'var(--accent-cyan)' : row.trend === 'moderate' ? 'var(--status-optimal)' : 'var(--text-muted)' }}></div>))}</div></td></tr>))}</tbody>
          </table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--status-optimal)', backgroundColor: 'rgba(0, 230, 118, 0.05)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--status-bg-optimal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lightbulb color="var(--status-optimal)" size={16} /></div><div><h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Insights Predictivos</h4><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimización sugerida basada en datos históricos.</span></div></div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Los datos del periodo analizado indican una correlación del <strong style={{color: 'var(--accent-cyan)'}}>85%</strong> entre los eventos de lluvia intensa y el incremento de congestión en el corredor de la Av. Roosevelt. Se recomienda activar el protocolo "Plan Lluvia" 20 minutos antes de la precipitación prevista para reducir la saturación en un <strong style={{color: 'var(--status-optimal)'}}>12%</strong>.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>ESTADO DEL REPORTE</span><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}><CheckCircle color="var(--text-secondary)" size={24} /><div><h4 style={{ margin: 0, fontSize: '0.9rem' }}>Validado por Secretaría</h4><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: RPT-2023-OCT-092</span></div></div></div>
            <button style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', marginTop: '24px' }}>COMPARTIR DASHBOARD</button>
          </div>
        </div>
      </div>
    </div>
  );
}
