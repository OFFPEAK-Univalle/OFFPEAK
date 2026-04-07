/**
 * Archivo: Dashboard.jsx
 * Propósito: Pantalla principal "Vista General" del sistema administrador.
 * Descripción:
 * 1. Define componentes visuales como "StatCards" (tarjetas de KPI).
 * 2. Renderiza un gráfico principal de barras simulado (Recharts) representando afluencia de una zona crítica.
 * 3. Incorpora alertas de UI para llamar la atención en la zona crítica actual.
 * 4. Muestra gráficos de tendencia secundaria en miniatura.
 * 5. Documentado paso a paso para futura trazabilidad (formato glosario como fue solicitado).
 */

import React from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

// --- DATOS MOCK PARA GRÁFICAS ---
// Datos simulando el histograma de afluencia de "Cali Norte - Comuna 2"
const mainChartData = [
  { time: '6am', afluencia: 30 },
  { time: '9am', afluencia: 45 },
  { time: '12pm', afluencia: 70 }, // Pico 1
  { time: '3pm', afluencia: 50 },
  { time: '6pm', afluencia: 85 },  // Pico crítico
  { time: '9pm', afluencia: 60 },
  { time: '12am', afluencia: 20 },
];

// Datos simulando "Tendencia Semanal"
const trendData = [
  { day: 'Lun', real: 40, promedio: 30 },
  { day: 'Mar', real: 55, promedio: 45 },
  { day: 'Mie', real: 45, promedio: 50 },
  { day: 'Jue', real: 80, promedio: 60 },
  { day: 'Vie', real: 90, promedio: 75 },
  { day: 'Sab', real: 60, promedio: 80 },
  { day: 'Dom', real: 30, promedio: 40 },
];

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* SECCIÓN 1: KPIs Principales */}
      <div>
        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>KPI STAT CHIPS & INDICADORS</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Card: Flujo Total */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FLUJO TOTAL</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span className="stat-value">20.000</span>
              <span style={{ color: 'var(--status-optimal)', fontSize: '0.85rem', fontWeight: 600 }}>+12%</span>
            </div>
          </div>

          {/* Card: Zonas Críticas */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ZONAS CRÍTICAS</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span className="stat-value text-cyber">04</span>
              <span style={{ color: 'var(--status-critical)', fontSize: '0.85rem', fontWeight: 600 }}>+2</span>
            </div>
          </div>

          {/* Estado Chips (Visualización de botones de estado del mockup) */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--status-optimal)', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-optimal)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>ACTIVA</span>
            </div>
            <div style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--status-moderate)', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-moderate)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>EN GESTION</span>
            </div>
            <div style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>RESUELTA</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Zona Principal de Datos (Gráfico Central y Alerta Activa) */}
      <div className="responsive-grid-2-1">
        
        {/* Gráfico Principal: Cali Norte */}
        <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cali Norte - Comuna 2</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitoreo de afluencia peatonal en tiempo real</p>
              </div>
              <span style={{ backgroundColor: 'var(--status-bg-optimal)', color: 'var(--status-optimal)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                ESTADO: ÓPTIMO
              </span>
            </div>
          </div>
          
          <div style={{ height: '300px', padding: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mainChartData}>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'var(--surface-secondary)'}} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: 'none', borderRadius: '8px' }}/>
                <Bar dataKey="afluencia" fill="var(--surface-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Actualización: Hace 2 min</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold', cursor: 'pointer' }}>VER REPORTE</span>
          </div>
        </div>

        {/* Panel Lateral: Alertas Relevantes */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--status-critical)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-critical)', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>ALERTA DE AFLUENCIA</span>
          </div>
          
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>Congestión Crítica</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
            Terminal de Transportes presenta un incremento del 45% sobre la capacidad recomendada.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <button style={{ backgroundColor: 'var(--status-critical)', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
              DESPLEGAR PERSONAL
            </button>
            <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
              IGNORAR
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Paneles Inferiores (Leyenda y Tendencias) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .bottom-panels {
              grid-template-columns: 1fr 1.5fr 2fr !important;
            }
          }
        `}} />
        <div className="bottom-panels" style={{ display: 'grid', gap: '24px' }}>
          
          {/* Leyenda del mapa (informativo) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>LEYENDA DE MAPA</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-optimal)' }}/> <span style={{ fontSize: '0.85rem' }}>Bajo Tráfico</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-moderate)' }}/> <span style={{ fontSize: '0.85rem' }}>Moderado</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-critical)' }}/> <span style={{ fontSize: '0.85rem' }}>Crítico</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}/> <span style={{ fontSize: '0.85rem' }}>Punto de Control</span></div>
            </div>
          </div>

          {/* Ocupación Específica */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>COMUNA 17</span>
            <h2 style={{ margin: '4px 0 24px 0', fontSize: '1.2rem' }}>Jardín Plaza</h2>
            
            <div style={{ position: 'relative', width: '100%', height: '8px', backgroundColor: 'var(--surface-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '65%', backgroundColor: 'var(--accent-cyan)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OCUPACIÓN</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>65%</span>
            </div>
          </div>

          {/* Gráfico de Tendencia Semanal */}
          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, letterSpacing: '1px' }}>TENDENCIA SEMANAL</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}/>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-optimal)' }}/>
              </div>
            </div>
            <div style={{ height: '120px', marginTop: '16px' }}>
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={{stroke: 'var(--border-light)'}} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }}/>
                  <Area type="monotone" dataKey="real" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
                  <Area type="monotone" dataKey="promedio" stroke="var(--status-optimal)" strokeDasharray="3 3" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>LUN</span>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>DOM</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <div style={{ paddingTop: '24px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>OFFPEAK 2026 - TODOS LOS DERECHOS RESERVADOS</p>
      </div>

    </div>
  );
}
