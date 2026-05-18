/**
 * Archivo: ZonasCriticas.jsx
 * Propósito: Visualizar el estado detallado de una zona y el mapa interactivo.
 * Descripción: Desacoplado de Mocks. Usa BD Real y Multimodal API.
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, ReferenceLine } from 'recharts';
import { Clock, AlertTriangle, Activity, MapPin, Navigation, Bus, Car, Shield, Heart, Umbrella, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { createCustomIcon, createParkingIcon, createMioIcon, createSecurityIcon, createHealthIcon, createComfortIcon, createIncidentIcon } from '../utils/icons';

export default function ZonasCriticas() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const [showZonas, setShowZonas] = useState(true);
  const [showParking, setShowParking] = useState(false);
  const [showMio, setShowMio] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showComfort, setShowComfort] = useState(false);
  const [showIncident, setShowIncident] = useState(true);

  // Estados Dinámicos de la BD
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [multimodal, setMultimodal] = useState({ parking: [], mio: [], security: [], health: [], comfort: [], incidents: [] });
  const [alternativas, setAlternativas] = useState([]);
  const [loadingDesvios, setLoadingDesvios] = useState(false);

  // Estados para la Alerta Institucional
  const [generandoAlerta, setGenerandoAlerta] = useState(false);
  const [alertaMensaje, setAlertaMensaje] = useState(null);

  // Estados de Estadísticas (Zone Data)
  const [zoneData, setZoneData] = useState({
    nombre: "Selecciona una zona en el mapa",
    comuna: "Esperando selección...",
    estado: "NORMAL",
    afluenciaActual: 0,
    afluenciaPico: 0,
    horaRiesgo: "--:--"
  });
  const [dailyChartData, setDailyChartData] = useState([]);

  // 1. Cargar Marcadores Multimodales
  useEffect(() => {
    fetch(`${API_URL}/multimodal/markers`)
      .then(res => res.json())
      .then(data => setMultimodal(data))
      .catch(err => console.error("Error fetching multimodal:", err));
  }, [API_URL]);

  // 2. Cargar Venues
  useEffect(() => {
    fetch(`${API_URL}/venues/`)
      .then(res => res.json())
      .then(data => {
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenueId(data[0].id); // Autoseleccionar el primero
        }
      })
      .catch(err => console.error("Error fetching venues:", err));
  }, [API_URL]);

  // 3. Cargar Forecast Histórico de la Zona Seleccionada
  useEffect(() => {
    if (!selectedVenueId) return;

    const currentVenue = venues.find(v => v.id === selectedVenueId);

    fetch(`${API_URL}/venues/${selectedVenueId}/forecasts`)
      .then(res => res.json())
      .then(data => {
        if (data.forecasts) {
          const todayJS = new Date().getDay();
          const backendDay = todayJS === 0 ? 6 : todayJS - 1;
          const todayForecasts = data.forecasts.filter(f => f.dia_semana === backendDay);

          // Llenar Chart Data
          const chartData = todayForecasts.filter(f => f.hora % 2 === 0).map(f => {
            const ampm = f.hora >= 12 ? 'PM' : 'AM';
            const hr = f.hora % 12 === 0 ? 12 : f.hora % 12;
            return { time: `${hr} ${ampm}`, value: f.indice_afluencia };
          });
          setDailyChartData(chartData);

          // Calcular KPIs
          const currentHour = new Date().getHours();
          const currentF = todayForecasts.find(f => f.hora === currentHour) || { indice_afluencia: 0 };
          let maxAfluencia = 0;
          let peakHour = "--:--";

          todayForecasts.forEach(f => {
            if (f.indice_afluencia > maxAfluencia) {
              maxAfluencia = f.indice_afluencia;
              const ampm = f.hora >= 12 ? 'PM' : 'AM';
              const hr = f.hora % 12 === 0 ? 12 : f.hora % 12;
              peakHour = `${hr}:00 ${ampm}`;
            }
          });

          let riesgo = "ÓPTIMO";
          if (currentF.indice_afluencia > 80) riesgo = "CRÍTICO";
          else if (currentF.indice_afluencia > 50) riesgo = "MODERADO";

          setZoneData({
            nombre: currentVenue ? currentVenue.nombre : "Zona",
            comuna: currentVenue ? currentVenue.ciudad : "Cali",
            estado: riesgo,
            afluenciaActual: currentF.indice_afluencia,
            afluenciaPico: maxAfluencia,
            horaRiesgo: peakHour
          });
        }
      })
      .catch(err => console.error("Error fetching forecasts:", err));
  }, [selectedVenueId, venues, API_URL]);


  const fetchDesvios = async () => {
    setLoadingDesvios(true);
    try {
      const currentVenue = venues.find(v => v.id === selectedVenueId);
      if (!currentVenue) return;

      const response = await fetch(`${API_URL}/rerouting/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitud: currentVenue.latitud,
          longitud: currentVenue.longitud,
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

  const handleCrearAlerta = async () => {
    if (!selectedVenueId) return;
    setGenerandoAlerta(true);
    setAlertaMensaje(null);

    try {
      // Determinamos el tipo de alerta según el estado actual de la zona
      let tipoAlerta = 'congestion_media';
      if (zoneData.estado === 'CRÍTICO') tipoAlerta = 'congestion_alta';
      if (zoneData.estado === 'ÓPTIMO') tipoAlerta = 'normalizado';

      const payload = {
        venue_id: selectedVenueId,
        tipo: tipoAlerta,
        mensaje: `ALERTA OPERATIVA: Se reporta nivel de riesgo ${zoneData.estado} en ${zoneData.nombre}. Afluencia actual: ${zoneData.afluenciaActual}%. Se solicita apoyo en la zona.`
      };

      // Recuperamos el token por si tu endpoint está protegido
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }) // Agrega token si existe
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAlertaMensaje({ type: 'success', text: '¡Alerta oficial enviada a la central!' });
      } else {
        throw new Error('Error al guardar la alerta');
      }
    } catch (error) {
      console.error("Error enviando alerta:", error);
      setAlertaMensaje({ type: 'error', text: 'Fallo al emitir la alerta.' });
    } finally {
      setGenerandoAlerta(false);
      // Limpiar el mensaje de éxito/error después de 3 segundos
      setTimeout(() => setAlertaMensaje(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>

      {/* Header de Mapa Responsivo */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '400px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--surface-primary)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--accent-cyan)" />
              <h3 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.5px' }}>Vista General Geográfica (Cali)</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FILTROS DE MULTIMOVILIDAD</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowZonas(!showZonas)}
              style={{ backgroundColor: showZonas ? 'var(--accent-cyan)' : 'transparent', color: showZonas ? 'var(--bg-main)' : 'var(--text-secondary)', border: showZonas ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <MapPin size={14} /> LUGARES
            </button>
            <button
              onClick={() => setShowParking(!showParking)}
              style={{ backgroundColor: showParking ? '#3b82f6' : 'transparent', color: showParking ? '#fff' : 'var(--text-secondary)', border: showParking ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Car size={14} /> PARQUEADEROS
            </button>
            <button
              onClick={() => setShowMio(!showMio)}
              style={{ backgroundColor: showMio ? '#f97316' : 'transparent', color: showMio ? '#fff' : 'var(--text-secondary)', border: showMio ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Bus size={14} /> ESTACIONES MIO
            </button>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              style={{ backgroundColor: showSecurity ? '#1e3a8a' : 'transparent', color: showSecurity ? '#fff' : 'var(--text-secondary)', border: showSecurity ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Shield size={14} /> SEGURIDAD
            </button>
            <button
              onClick={() => setShowHealth(!showHealth)}
              style={{ backgroundColor: showHealth ? '#ef4444' : 'transparent', color: showHealth ? '#fff' : 'var(--text-secondary)', border: showHealth ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Heart size={14} /> SALUD
            </button>
            <button
              onClick={() => setShowComfort(!showComfort)}
              style={{ backgroundColor: showComfort ? '#10b981' : 'transparent', color: showComfort ? '#fff' : 'var(--text-secondary)', border: showComfort ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Umbrella size={14} /> CONFORT URBANO
            </button>
            <button
              onClick={() => setShowIncident(!showIncident)}
              style={{ backgroundColor: showIncident ? '#facc15' : 'transparent', color: showIncident ? '#000' : 'var(--text-secondary)', border: showIncident ? 'none' : '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <AlertCircle size={14} /> INCIDENCIAS
            </button>
          </div>
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <MapContainer center={[3.42158, -76.5205]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {showZonas && venues
              .filter(venue =>
                venue.latitud && venue.latitud !== 0 &&
                venue.longitud && venue.longitud !== 0
              )
              .map((venue) => (
                <Marker
                  key={venue.id}
                  position={[venue.latitud, venue.longitud]}
                  icon={createCustomIcon(selectedVenueId === venue.id ? 'selected' : 'optimal')}
                  eventHandlers={{ click: () => setSelectedVenueId(venue.id) }}
                >
                  <Popup className="premium-popup">
                    <div style={{ padding: '4px', textAlign: 'center' }}>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{venue.nombre}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#22d3ee' }}>Seleccionado para Analítica</span>
                    </div>
                  </Popup>
                </Marker>
              ))
            }
            {alternativas && alternativas.map((alt) => (
              <React.Fragment key={`alt-${alt.venue_id}`}>
                <Marker position={[alt.latitud, alt.longitud]} icon={createCustomIcon('optimal')}>
                  <Popup className="premium-popup">
                    <div style={{ padding: '4px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{alt.nombre}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Desvío Recomendado</span>
                    </div>
                  </Popup>
                </Marker>
                {(() => {
                  const origin = venues.find(v => v.id === selectedVenueId);
                  if (origin) {
                    return <Polyline positions={[[origin.latitud, origin.longitud], [alt.latitud, alt.longitud]]} color="var(--accent-cyan)" dashArray="5, 10" weight={3} opacity={0.8} />;
                  }
                  return null;
                })()}
              </React.Fragment>
            ))}

            {showParking && multimodal.parking.map((p) => (
              <Marker key={`park-${p.id}`} position={p.coords} icon={createParkingIcon()}>
                <Popup className="premium-popup"><strong>{p.name}</strong></Popup>
              </Marker>
            ))}

            {showMio && multimodal.mio.map((m) => (
              <Marker key={`mio-${m.id}`} position={m.coords} icon={createMioIcon()}>
                <Popup className="premium-popup"><strong>{m.name}</strong></Popup>
              </Marker>
            ))}

            {showSecurity && multimodal.security.map((s) => (
              <Marker key={`sec-${s.id}`} position={s.coords} icon={createSecurityIcon()}>
                <Popup className="premium-popup"><strong>{s.name}</strong></Popup>
              </Marker>
            ))}

            {showHealth && multimodal.health.map((h) => (
              <Marker key={`health-${h.id}`} position={h.coords} icon={createHealthIcon()}>
                <Popup className="premium-popup"><strong>{h.name}</strong></Popup>
              </Marker>
            ))}

            {showComfort && multimodal.comfort.map((c) => (
              <Marker key={`comf-${c.id}`} position={c.coords} icon={createComfortIcon()}>
                <Popup className="premium-popup"><strong>{c.name}</strong></Popup>
              </Marker>
            ))}

            {showIncident && multimodal.incidents.map((i) => (
              <Marker key={`inc-${i.id}`} position={i.coords} icon={createIncidentIcon()}>
                <Popup className="premium-popup"><strong style={{ color: '#facc15' }}>{i.name}</strong></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '24px', marginTop: '16px' }}>
        <div className="header-flex">
          <div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{zoneData.nombre}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{zoneData.comuna} • ACTUALIZADO EN TIEMPO REAL</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '30px', border: `1px solid ${zoneData.estado === 'CRÍTICO' ? 'var(--status-critical)' : 'var(--status-optimal)'}`, backgroundColor: zoneData.estado === 'CRÍTICO' ? 'var(--status-bg-critical)' : 'var(--status-bg-optimal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: zoneData.estado === 'CRÍTICO' ? 'var(--status-critical)' : 'var(--status-optimal)' }}></div>
            <span style={{ color: zoneData.estado === 'CRÍTICO' ? 'var(--status-critical)' : 'var(--status-optimal)', fontSize: '0.75rem', fontWeight: 'bold' }}>ESTADO: {zoneData.estado}</span>
          </div>
        </div>
      </div>

      <div className="responsive-grid">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>AFLUENCIA ACTUAL</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
            <span className="stat-value">{zoneData.afluenciaActual}%</span>
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
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: zoneData.estado === 'CRÍTICO' ? 'var(--status-critical)' : 'var(--surface-primary)', color: zoneData.estado === 'CRÍTICO' ? '#fff' : 'var(--text-primary)', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', opacity: 0.9 }}>NIVEL DE RIESGO</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span className="stat-value" style={{ color: zoneData.estado === 'CRÍTICO' ? '#fff' : 'var(--text-primary)' }}>{zoneData.estado}</span>
            <AlertTriangle size={32} color={zoneData.estado === 'CRÍTICO' ? '#fff' : 'var(--status-moderate)'} />
          </div>
        </div>
      </div>

      <div className="responsive-grid-2-1">
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="header-flex" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, letterSpacing: '0.5px' }}>COMPORTAMIENTO DE AFLUENCIA - HOY</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} /> AFLUENCIA</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '16px', borderTop: '2px dashed var(--status-critical)' }} /> UMBRAL (80%)</span>
            </div>
          </div>
          <div style={{ height: '250px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colFlow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.8} /><stop offset="50%" stopColor="var(--status-moderate)" stopOpacity={0.6} /><stop offset="95%" stopColor="var(--status-critical)" stopOpacity={0.2} /></linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: 'var(--border-light)' }} contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                <ReferenceLine y={80} stroke="var(--status-critical)" strokeDasharray="3 3" />
                <Area type="natural" dataKey="value" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTÓN DE ALERTA INSTITUCIONAL CONECTADO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleCrearAlerta}
            disabled={generandoAlerta || !selectedVenueId}
            style={{
              backgroundColor: 'var(--status-bg-critical)',
              color: 'var(--status-critical)',
              border: '1px solid var(--status-critical)',
              padding: '16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: (generandoAlerta || !selectedVenueId) ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (generandoAlerta || !selectedVenueId) ? 0.6 : 1,
              transition: 'all 0.2s'
            }}>
            <AlertTriangle size={18} />
            {generandoAlerta ? 'EMITIENDO ALERTA...' : 'ALERTA INSTITUCIONAL'}
          </button>

          {/* Mensaje de feedback de la Alerta */}
          {alertaMensaje && (
            <div style={{
              padding: '8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              textAlign: 'center',
              backgroundColor: alertaMensaje.type === 'success' ? 'var(--status-bg-optimal)' : 'var(--status-bg-critical)',
              color: alertaMensaje.type === 'success' ? 'var(--status-optimal)' : 'var(--status-critical)',
              fontWeight: 'bold'
            }}>
              {alertaMensaje.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}