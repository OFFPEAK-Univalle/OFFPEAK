/**
 * Archivo: ZonasCriticas.jsx
 * Propósito: Visualizar el estado detallado de una zona y el mapa general.
 * Descripción:
 * 1. Nueva Integración: `react-leaflet` para un mapa interactivo premium centrado en Cali.
 * 2. Muestra un botón de regreso y el título de la zona seleccionada.
 * 3. Incorpora clases de grid responsivo `.responsive-grid` y `.responsive-grid-2-1`.
 * 4. Animaciones y estado visual estandarizado.
 */

import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, ReferenceLine } from 'recharts';
import { ArrowLeft, Clock, AlertTriangle, Activity, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// --- DATOS MOCK PARA ZONA (Detalle) ---
const zoneData = {
  nombre: "Bulevar del Rio",
  comuna: "Comuna 3 - Centro Histórico",
  estado: "CRÍTICO",
  afluenciaActual: 78,
  afluenciaPico: 92,
  horaRiesgo: "5:00 PM"
};

// Datos Simulados Para Mapa (Marcadores de Venues)
const venuesMapMock = [
  { id: 1, name: 'Bulevar del Rio', coords: [3.4516, -76.5320], status: 'critical' },
  { id: 2, name: 'Terminal de Transportes', coords: [3.4682, -76.5255], status: 'critical' },
  { id: 3, name: 'Jardín Plaza', coords: [3.3768, -76.5284], status: 'moderate' },
  { id: 4, name: 'Estación Universidades', coords: [3.3735, -76.5305], status: 'optimal' },
];

// Creación de Íconos Personalizados de Leaflet usando HTML nativo y las variables CSS creadas
const createCustomIcon = (statusStr) => {
  let colorVar = 'var(--status-optimal)';
  if (statusStr === 'critical') colorVar = 'var(--status-critical)';
  if (statusStr === 'moderate') colorVar = 'var(--status-moderate)';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 16px; height: 16px; background-color: ${colorVar}; border-radius: 50%; border: 2px solid var(--surface-primary); box-shadow: 0 0 10px ${colorVar};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

const dailyChartData = [
  { time: '06 AM', value: 15 },
  { time: '09 AM', value: 25 },
  { time: '12 PM', value: 45 },
  { time: '03 PM', value: 60 },
  { time: '06 PM', value: 92 },
  { time: '09 PM', value: 80 },
  { time: '11 PM', value: 40 },
];

export default function ZonasCriticas() {
  const [alternativas, setAlternativas] = useState([]);
  const [loadingDesvios, setLoadingDesvios] = useState(false);

  const fetchDesvios = async () => {
    setLoadingDesvios(true);
    try {
      // Coordenadas origen (Bulevar del Rio simulado)
      const response = await fetch('http://localhost:8000/api/v1/rerouting/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitud: 3.4516,
          longitud: -76.5320,
          categoria_objetivo: null,
          radio_metros: 3000,
          limite: 2
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAlternativas(data);
      }
    } catch (error) {
      console.error("Error fetching desvios:", error);
    } finally {
      setLoadingDesvios(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* Nuevo Header de Mapa Responsivo (Integración Leaflet) */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '350px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-primary)', zIndex: 10 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <MapPin size={18} color="var(--accent-cyan)" />
             <h3 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.5px' }}>Vista General Geográfica (Cali)</h3>
           </div>
           <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SELECCIONA UN MARCADOR</span>
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <MapContainer center={[3.42158, -76.5205]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
             {/* OpenStreetMap Dark variant / CartoDB Dark Matter para emparejar el diseño oscuro Premium */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {venuesMapMock.map((venue) => (
              <Marker key={venue.id} position={venue.coords} icon={createCustomIcon(venue.status)}>
                <Popup className="premium-popup">
                  <div style={{ padding: '4px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{venue.name}</strong>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: venue.status==='critical'?'var(--status-critical)':venue.status==='moderate'?'var(--status-moderate)':'var(--status-optimal)' }}>Estado: {venue.status}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Dibujamos las alternativas recomendadas por el Algoritmo */}
            {alternativas.map((alt) => (
              <React.Fragment key={`alt-${alt.venue_id}`}>
                <Marker 
                  position={[alt.latitud, alt.longitud]} 
                  icon={createCustomIcon('optimal')}
                >
                  <Popup className="premium-popup">
                    <div style={{ padding: '4px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{alt.nombre}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Alternativa Recomendada</span>
                      <br/>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{alt.razon_desvio}</span>
                    </div>
                  </Popup>
                </Marker>
                {/* Trazamos una línea desde el origen (Bulevar) hasta la alternativa */}
                <Polyline 
                  positions={[ [3.4516, -76.5320], [alt.latitud, alt.longitud] ]} 
                  color="var(--accent-cyan)" 
                  dashArray="5, 10"
                  weight={3}
                  opacity={0.8}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Header específico de la zona */}
      <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '24px', marginTop: '16px' }}>
        <div className="header-flex">
          <div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{zoneData.nombre}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{zoneData.comuna} • ÚLTIMA ACTUALIZACIÓN: HACE 2 MIN</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--status-critical)', backgroundColor: 'var(--status-bg-critical)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-critical)' }}></div>
            <span style={{ color: 'var(--status-critical)', fontSize: '0.75rem', fontWeight: 'bold' }}>ESTADO: {zoneData.estado}</span>
          </div>
        </div>
      </div>

      {/* KPIs usando utilidades responsivas (.responsive-grid) */}
      <div className="responsive-grid">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>AFLUENCIA ACTUAL</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
            <span className="stat-value">{zoneData.afluenciaActual}%</span>
            <span style={{ color: 'var(--status-moderate)', fontSize: '0.85rem' }}>+12% vs. hr anterior</span>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>AFLUENCIA PICO HOY</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span className="stat-value text-cyber">{zoneData.afluenciaPico}%</span>
            <Activity color="var(--accent-cyan)" size={24} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>HORA DE MAYOR RIESGO</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span className="stat-value">{zoneData.horaRiesgo}</span>
            <Clock color="var(--status-moderate)" size={24} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--status-critical)', color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', opacity: 0.9 }}>NIVEL DE RIESGO</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span className="stat-value" style={{ color: '#fff' }}>CRÍTICO</span>
            <AlertTriangle size={32} color="#fff" />
          </div>
        </div>
      </div>

      {/* Sección Inferior: Gráficos usando responsive layout (.responsive-grid-2-1) */}
      <div className="responsive-grid-2-1">
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="header-flex" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, letterSpacing: '0.5px' }}>COMPORTAMIENTO DE AFLUENCIA - HOY</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}/> AFLUENCIA</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '16px', borderTop: '2px dashed var(--status-critical)' }}/> UMBRAL (85%)</span>
            </div>
          </div>
          <div style={{ height: '250px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colFlow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.8}/><stop offset="50%" stopColor="var(--status-moderate)" stopOpacity={0.6}/><stop offset="95%" stopColor="var(--status-critical)" stopOpacity={0.2}/></linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{stroke: 'var(--border-light)'}} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}/>
                <ReferenceLine y={85} stroke="var(--status-critical)" strokeDasharray="3 3" />
                <Area type="natural" dataKey="value" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 24px 0', letterSpacing: '0.5px' }}>HISTORIAL SEMANAL</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '150px' }}>
              {['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map((day, idx) => {
                const heights = [30, 45, 40, 60, 85, 90, 50]; 
                const isHigh = heights[idx] > 80;
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: `${heights[idx]}px`, backgroundColor: isHigh ? 'var(--status-critical)' : 'var(--surface-secondary)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <p style={{ margin: '16px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Promedio histórico vs actual</p>
        </div>
      </div>

      {/* Call to Action Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-secondary)', borderLeft: '4px solid var(--status-critical)', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--status-bg-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle color="var(--status-critical)" size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Protocolo de Respuesta Activo</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Se recomienda intervención inmediata por superación.</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchDesvios}
            disabled={loadingDesvios}
            style={{ backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-main)', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: loadingDesvios ? 'not-allowed' : 'pointer', letterSpacing: '1px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: loadingDesvios ? 0.7 : 1 }}>
            <Navigation size={16} />
            {loadingDesvios ? 'CALCULANDO...' : 'CALCULAR DESVÍO'}
          </button>
          <button style={{ backgroundColor: 'var(--status-bg-critical)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', fontSize: '0.75rem' }}>ALERTA INSTITUCIONAL</button>
        </div>
      </div>

    </div>
  );
}
